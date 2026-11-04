require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.use("/api/products", require("./routes/products"));

app.use("/api/checkout", require("./routes/checkout"));

app.use("/api/webhooks", require("./routes/webhooks"));

app.use("/api/coupons", require("./routes/coupons"));

app.use("/api/orders", require("./routes/orders"));

app.get("/", (req, res) => {
  res.json({
    message: "QRMarket MP API funcionando"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});