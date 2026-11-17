import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { QRCodeCanvas } from "qrcode.react";

import api from "../services/api";

import BuyerForm from "../components/BuyerForm";

import PaymentOptions from "../components/PaymentOptions";

import Cart from "../components/Cart";

function Checkout() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
    return JSON.parse(
      localStorage.getItem("cart") || "[]"
    );
  });

  const [buyer, setBuyer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: ""
  });

  const [couponCode, setCouponCode] = useState("");

  const [coupon, setCoupon] = useState(null);

  const [shipping, setShipping] = useState(null);

  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/products").then(response => {
      setProducts(response.data);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const buyerValid = useMemo(() => {
    return (
      buyer.firstName.trim().length >= 2 &&
      buyer.lastName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email) &&
      /^[0-9+\s()-]{6,20}$/.test(buyer.phone) &&
      buyer.address.trim().length >= 5 &&
      /^[0-9]{4,8}$/.test(buyer.postalCode)
    );
  }, [buyer]);

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(
      p => p.id === item.productId
    );

    return sum + (
      product ? product.price * item.quantity : 0
    );
  }, 0);

  const discount = coupon
    ? Math.round(subtotal * coupon.percentage / 100)
    : 0;

  const shippingCost = shipping?.cost ?? (
    subtotal >= 100000 ? 0 : 5000
  );

  const total = subtotal - discount + shippingCost;

  async function validateCoupon() {
    try {
      const response = await api.post(
        "/coupons/validate",
        { code: couponCode }
      );

      setCoupon(response.data);

      alert("Cupón aplicado");

    } catch (error) {
      setCoupon(null);

      alert(
        error.response?.data?.message ||
        "No se pudo validar el cupón"
      );
    }
  }

  async function calculateShipping() {
    try {
      const response = await api.post(
        "/coupons/shipping",
        {
          postalCode: buyer.postalCode,
          subtotal
        }
      );

      setShipping(response.data);

    } catch (error) {
      alert("Error calculando el envío");
    }
  }

  async function createPayment() {
    if (!buyerValid || cart.length === 0) return;

    setLoading(true);

    try {
      const response = await api.post(
        "/checkout/create-preference",
        {
          items: cart,
          buyer,
          couponCode: coupon?.code || null,
          postalCode: buyer.postalCode
        }
      );

      setPayment(response.data);

      return response.data;

    } catch (error) {
      console.error("Error al crear el pago:");

      console.log("Mensaje:", error.message);
      console.log("Respuesta del servidor:", error.response);
      console.log("Estado HTTP:", error.response?.status);
      console.log("Datos recibidos:", error.response?.data);
      console.log("Solicitud:", error.config);

      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function payWithMercadoPago() {
    try {
      const data = await createPayment();

      window.location.href = data.init_point;

    } catch (error) {
      console.error(error);
    }
  }

  async function payWithQR() {
    try {
      const data = await createPayment();

      setPayment(data);

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="container">

      <h1>Finalizar compra</h1>

      <Cart
        products={products}
        cart={cart}
        setCart={setCart}
      />

      <hr />

      <h2>Resumen de compra</h2>

      <p>Subtotal: ${subtotal}</p>

      <div>
        <input
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          placeholder="Código de descuento"
        />

        <button onClick={validateCoupon}>
          Aplicar cupón
        </button>
      </div>

      <p>Descuento: ${discount}</p>

      <button onClick={calculateShipping}>
        Calcular envío
      </button>

      <p>Envío: ${shippingCost}</p>

      <h2>Total: ${total}</h2>

      <hr />

      <BuyerForm
        buyer={buyer}
        setBuyer={setBuyer}
      />

      <PaymentOptions
        enabled={
          buyerValid &&
          cart.length > 0 &&
          !loading
        }
        onMercadoPago={payWithMercadoPago}
        onQR={payWithQR}
      />

      {payment && (
        <div className="qr-payment">

          <h2>Escaneá para pagar</h2>

          <QRCodeCanvas
            value={payment.init_point}
            size={250}
          />

          <p>
            Orden: {payment.orderId}
          </p>

          <p>
            Total: ${payment.total}
          </p>

          <a
            href={payment.init_point}
            target="_blank"
            rel="noreferrer"
          >
            Abrir MercadoPago
          </a>

        </div>
      )}

    </div>
  );
}

export default Checkout;