const express = require("express");
const crypto = require("crypto");

const {
  MercadoPagoConfig,
  Payment
} = require("mercadopago");

const {
  readJSON,
  writeJSON
} = require("../utils/jsonDB");

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const paymentClient = new Payment(client);

// Verificar firma de MercadoPago
function verifySignature(req) {
  const signature = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];

  const dataId = String(req.query["data.id"] || "")
    .toLowerCase();

  const secret = process.env.MP_WEBHOOK_SECRET;

  if (!signature || !requestId || !dataId || !secret) {
    return false;
  }

  const parts = Object.fromEntries(
    signature.split(",").map(part => {
      const [key, ...value] = part.trim().split("=");

      return [key, value.join("=")];
    })
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1 || !/^[a-f0-9]{64}$/i.test(v1)) {
    return false;
  }

  const manifest =
    `id:${dataId};request-id:${requestId};ts:${ts};`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest();

  const received = Buffer.from(v1, "hex");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

// Recibir notificación
router.post("/mp", async (req, res) => {
  // Responder inmediatamente
  res.sendStatus(200);

  try {
    const { type, data } = req.body;

    if (type !== "payment" || !data?.id) {
      return;
    }

    // Verificar firma antes de procesar
    if (!verifySignature(req)) {
      console.error("Firma de webhook inválida");
      return;
    }

    // Consultar el pago directamente en MP
    const payment = await paymentClient.get({
      id: data.id
    });

    const paymentData = payment;

    const orderId = paymentData.external_reference;

    if (!orderId) return;

    const orders = await readJSON("orders.json");

    const order = orders.find(
      o => o.id === orderId
    );

    if (!order) return;

    // Validar que el pago corresponde a la orden
    const expectedAmount = order.total;

    if (
      Number(paymentData.transaction_amount) !==
        expectedAmount ||
      paymentData.currency_id !== "ARS"
    ) {
      console.error("Importe o moneda incorrectos");
      return;
    }

    // Evitar procesar dos veces el mismo pago
    if (order.paymentId === String(data.id)) {
      return;
    }

    if (order.status === "approved") {
      
      return;
    }

    const status = paymentData.status;

    if (
      !["approved", "pending", "rejected", "cancelled"]
        .includes(status)
    ) {
      if (status === "approved") {

        const products = await readJSON("products.json");

        // Comprobar stock nuevamente
        for (const item of order.items) {
          const product = products.find(
            p => p.id === item.productId
          );

          if (!product || product.stock < item.quantity) {
            console.error("Stock insuficiente al confirmar pago");
            return;
          }
        }

        // Descontar stock
        for (const item of order.items) {
          const product = products.find(
            p => p.id === item.productId
          );

          product.stock -= item.quantity;
        }

        await writeJSON("products.json", products);
      }
      return;
    }

    order.status = status;
    order.paymentId = String(data.id);

    order.updatedAt = new Date().toISOString();

    await writeJSON("orders.json", orders);

    console.log(
      `Orden ${orderId} actualizada: ${status}`
    );

  } catch (error) {
    console.error(
      "Error procesando webhook:",
      error
    );
  }
});

module.exports = router;