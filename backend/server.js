require("dotenv").config();

const { createProxyMiddleware } = require("http-proxy-middleware");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log("================================");
  console.log("Solicitud recibida:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);
  console.log("================================");

  next();
});

app.use("/api/products", require("./routes/products"));

app.use("/api/checkout", require("./routes/checkout"));

app.use("/api/webhooks", require("./routes/webhooks"));

app.use("/api/coupons", require("./routes/coupons"));

app.use("/api/orders", require("./routes/orders"));

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:5173",
    changeOrigin: true,
    ws: true
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "QRMarket MP API funcionando"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});