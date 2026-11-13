const express = require("express");

const router = express.Router();

const { readJSON } = require("../utils/jsonDB");

router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;

    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({
        message: "Ingresá un cupón válido"
      });
    }

    const coupons = await readJSON("coupons.json");

    const coupon = coupons.find(
      c =>
        c.code.toUpperCase() === code.trim().toUpperCase() &&
        c.active
    );

    if (!coupon) {
      return res.status(404).json({
        message: "Cupón inválido"
      });
    }

    res.json({
      valid: true,
      code: coupon.code,
      percentage: coupon.percentage
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al validar cupón"
    });
  }
});

// Calcular envío
router.post("/shipping", async (req, res) => {
  try {
    const { postalCode, subtotal } = req.body;

    if (
      typeof postalCode !== "string" ||
      !/^\d{4,8}$/.test(postalCode) ||
      !Number.isFinite(subtotal) ||
      subtotal < 0
    ) {
      return res.status(400).json({
        message: "Datos de envío inválidos"
      });
    }

    const freeShippingMinimum = 100000;

    const cost =
      subtotal >= freeShippingMinimum ? 0 : 5000;

    res.json({
      postalCode,
      cost,
      freeShipping: cost === 0
    });

  } catch (error) {
    res.status(500).json({
      message: "Error calculando envío"
    });
  }
});

module.exports = router;