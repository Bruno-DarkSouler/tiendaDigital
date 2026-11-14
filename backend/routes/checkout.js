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
    const preference = await preferenceClient.create({
      body: {
        items: orderItems.map(item => ({
          id: item.productId,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS"
        })),

        payer: {
          name: order.buyer.firstName,
          surname: order.buyer.lastName,
          email: order.buyer.email
        },

        external_reference: orderId,

        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },

        auto_return: "approved",

        notification_url:
          `${process.env.BASE_URL}/api/webhooks/mp`
      }
    });

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
    console.error("Error en checkout:", error);

    res.status(500).json({
      message: "No se pudo iniciar el pago"
    });
  }
});

module.exports = router;