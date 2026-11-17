const express = require("express");
const { randomUUID } = require("crypto");

const {
  MercadoPagoConfig,
  Preference
} = require("mercadopago");

const QRCode = require("qrcode");

const router = express.Router();

const {
  readJSON,
  writeJSON
} = require("../utils/jsonDB");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preferenceClient = new Preference(client);

// Crear preferencia y orden
router.post("/create-preference", async (req, res) => {
  try {
    const {
      items,
      buyer,
      couponCode,
      postalCode
    } = req.body;

    // 1. Validar comprador
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "postalCode"
    ];
    
    
    for (const field of requiredFields) {
      if (
        typeof buyer?.[field] !== "string" ||
        !buyer[field].trim()
      ) {
        return res.status(400).json({
          message: `El campo ${field} es obligatorio`
        });
      }
    }
    
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)
    ) {
      return res.status(400).json({
        message: "Email inválido"
      });
    }
    
    if (
      !/^[0-9]{4,8}$/.test(buyer.postalCode)
    ) {
      return res.status(400).json({
        message: "Código postal inválido"
      });
    }
    
    // 2. Validar carrito
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "El carrito está vacío"
      });
    }
    
    const products = await readJSON("products.json");
    
    const orderItems = [];
    
    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return res.status(400).json({
          message: "Producto o cantidad inválida"
        });
      }
      
      const product = products.find(
        p => p.id === item.productId && p.active
      );
      
      if (!product) {
        return res.status(400).json({
          message: "Producto inexistente"
        });
      }
      
      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.name}`
        });
      }
      
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }
    
    // 3. Calcular subtotal
    const subtotal = orderItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
    
    // 4. Validar cupón en backend
    let discount = 0;
    
    if (couponCode) {
      const coupons = await readJSON("coupons.json");
      
      const coupon = coupons.find(
        c =>
          c.code.toUpperCase() ===
        String(couponCode).trim().toUpperCase() &&
        c.active
      );
      
      if (!coupon) {
        return res.status(400).json({
          message: "Cupón inválido"
        });
      }
      
      discount = Math.round(
        subtotal * coupon.percentage / 100
      );
    }
    
    // 5. Calcular envío en backend
    const shippingCost =
    subtotal >= 100000 ? 0 : 5000;

    const total = subtotal - discount + shippingCost;
    
    if (!Number.isSafeInteger(total) || total <= 0) {
      return res.status(400).json({
        message: "Importe inválido"
      });
    }
    
    // 6. Crear identificador de orden
    const orderId = `ORD-${randomUUID()}`;
    
    // 7. Guardar orden antes de llamar a MercadoPago
    const orders = await readJSON("orders.json");
    
    const order = {
      id: orderId,
      
      buyer: {
        firstName: buyer.firstName.trim(),
        lastName: buyer.lastName.trim(),
        email: buyer.email.trim().toLowerCase(),
        phone: buyer.phone.trim(),
        address: buyer.address.trim(),
        postalCode: buyer.postalCode.trim()
      },
      
      items: orderItems,
      
      subtotal,
      discount,
      shippingCost,
      total,

      status: "pending",
      paymentId: null,
      createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    
    await writeJSON("orders.json", orders);
    // 8. Crear preferencia MercadoPago
    console.log("Datos de la orden:", {
      orderId,
      buyer: order?.buyer,
      orderItems
    });

    console.log("Variables de entorno:", {
      FRONTEND_URL: process.env.FRONTEND_URL,
      BASE_URL: process.env.BASE_URL,
      ACCESS_TOKEN_CONFIGURADO: Boolean(process.env.MP_ACCESS_TOKEN)
    });
    const frontendUrl = process.env.FRONTEND_URL;
    const backendUrl = process.env.BASE_URL;

    if (!frontendUrl || !backendUrl) {
      throw new Error("Faltan FRONTEND_URL o BASE_URL en el archivo .env");
    }

    const preferenceBody = {
      items: orderItems.map(item => ({
        id: String(item.productId),
        title: String(item.name),
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: "ARS"
      })),

      payer: {
        name: order.buyer.firstName,
        surname: order.buyer.lastName,
        email: order.buyer.email
      },

      external_reference: String(orderId),

      back_urls: {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`
      },

      auto_return: "approved",

      notification_url: `${backendUrl}/api/webhooks/mp`
    };

    console.log(
      "Preferencia enviada:",
      JSON.stringify(preferenceBody, null, 2)
    );

    const preference = await preferenceClient.create({
      body: preferenceBody
    });

    console.log("Preferencia creada:", preference.id);
    
    const initPoint = preference.init_point;
    
    if (!initPoint) {
      throw new Error("MercadoPago no devolvió init_point");
    }
    
    // 9. Generar QR con la URL de pago
    const qrImage = await QRCode.toDataURL(initPoint, {
      width: 300,
      margin: 2,
      color: {
        dark: "#009ee3",
        light: "#ffffff"
      }
    });
    
    // 10. Guardar referencia de preferencia
    const updatedOrders = await readJSON("orders.json");
    
    const savedOrder = updatedOrders.find(
      o => o.id === orderId
    );
    
    savedOrder.preferenceId = preference.id;
    
    await writeJSON("orders.json", updatedOrders);
    
    res.status(201).json({
      orderId,
      init_point: initPoint,
      qr_image: qrImage,
      total
    });
    
  } catch (error) {
    console.error("ERROR AL CREAR PREFERENCIA:");
    console.error(error);

    console.error("Mensaje:", error.message);
    console.error("Status:", error.status);
    console.error("Causa:", error.cause);
    console.error("Respuesta:", error.response?.data);

    if (!res.headersSent) {
      res.status(500).json({
        message: "No se pudo iniciar el pago",
        error: error.message
      });
    }
  }
});

module.exports = router;