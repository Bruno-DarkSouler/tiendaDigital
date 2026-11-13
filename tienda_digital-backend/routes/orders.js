const express = require("express");

const router = express.Router();

const { readJSON } = require("../utils/jsonDB");

// Obtener todas las órdenes
router.get("/", async (req, res) => {
  try {
    const orders = await readJSON("orders.json");

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo órdenes"
    });
  }
});

// Consultar una orden
router.get("/:id", async (req, res) => {
  try {
    const orders = await readJSON("orders.json");

    const order = orders.find(
      o => o.id === req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Orden no encontrada"
      });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({
      message: "Error consultando orden"
    });
  }
});

module.exports = router;