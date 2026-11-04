const express = require("express");

const router = express.Router();

const { readJSON } = require("../utils/jsonDB");

// Obtener productos
router.get("/", async (req, res) => {
  try {
    const products = await readJSON("products.json");

    const activeProducts = products.filter(
      product => product.active
    );

    res.json(activeProducts);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener productos"
    });
  }
});

// Obtener producto por ID
router.get("/:id", async (req, res) => {
  try {
    const products = await readJSON("products.json");

    const product = products.find(
      p => p.id === req.params.id && p.active
    );

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener producto"
    });
  }
});

module.exports = router;