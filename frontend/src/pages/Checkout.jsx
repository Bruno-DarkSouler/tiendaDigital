import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../services/api";
import BuyerForm from "../components/BuyerForm";
import PaymentOptions from "../components/PaymentOptions";
import Cart from "../components/Cart";

function money(value) { return `$${Number(value || 0).toLocaleString("es-AR")}`; }

function Checkout() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  const [buyer, setBuyer] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", postalCode: "" });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/products").then(response => setProducts(response.data)).catch(console.error); }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const buyerValid = useMemo(() => (
    buyer.firstName.trim().length >= 2 &&
    buyer.lastName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email) &&
    /^[0-9+\s()-]{6,20}$/.test(buyer.phone) &&
    buyer.address.trim().length >= 5 &&
    /^[0-9]{4,8}$/.test(buyer.postalCode)
  ), [buyer]);

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const discount = coupon ? Math.round(subtotal * coupon.percentage / 100) : 0;
  const shippingCost = shipping?.cost ?? (subtotal >= 100000 ? 0 : 5000);
  const total = subtotal - discount + shippingCost;

  async function validateCoupon() {
    try {
      const response = await api.post("/coupons/validate", { code: couponCode });
      setCoupon(response.data);
      alert("Cupón aplicado");
    } catch (error) {
      setCoupon(null);
      alert(error.response?.data?.message || "No se pudo validar el cupón");
    }
  }
  async function calculateShipping() {
    try {
      const response = await api.post("/coupons/shipping", { postalCode: buyer.postalCode, subtotal });
      setShipping(response.data);
    } catch (error) { alert("Error calculando el envío"); }
  }
  async function createPayment() {
    if (!buyerValid || cart.length === 0) return;
    setLoading(true);
    try {
      const response = await api.post("/checkout/create-preference", {
        items: cart, buyer, couponCode: coupon?.code || null, postalCode: buyer.postalCode
      });
      setPayment(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear el pago:", error.response?.data || error);
      alert(error.response?.data?.message || "No se pudo iniciar el pago. Intentá nuevamente.");
      throw error;
    } finally { setLoading(false); }
  }
  async function payWithMercadoPago() {
    try { const data = await createPayment(); window.location.href = data.init_point; } catch (error) { /* El error ya se informa en pantalla. */ }
  }
  async function payWithQR() {
    try { const data = await createPayment(); setPayment(data); } catch (error) { /* El error ya se informa en pantalla. */ }
  }

  return (
    <main className="container">
      <div className="page-heading">
        <span className="eyebrow">Checkout seguro</span>
        <h1>Finalizar compra</h1>
        <p>Estás a un paso de completar tu pedido.</p>
      </div>
      {cart.length === 0 ? (
        <div className="empty-state"><h2>Tu carrito está vacío</h2><p>Agregá productos antes de iniciar el checkout.</p><a href="/">Volver al catálogo →</a></div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-main">
            <Cart products={products} cart={cart} setCart={setCart} />
            <BuyerForm buyer={buyer} setBuyer={setBuyer} />
          </div>
          <aside className="checkout-side">
            <section className="panel">
              <h2>Resumen de compra</h2>
              <div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div className="coupon-row">
                <input aria-label="Código de descuento" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Código de descuento" />
                <button onClick={validateCoupon} disabled={!couponCode.trim()}>Aplicar</button>
              </div>
              <div className="summary-row"><span>Descuento</span><strong>{discount > 0 ? `−${money(discount)}` : money(0)}</strong></div>
              <div className="summary-row"><span>Envío</span><strong>{money(shippingCost)}</strong></div>
              <button className="qr-button" style={{width:"100%"}} onClick={calculateShipping} disabled={!/^[0-9]{4,8}$/.test(buyer.postalCode)}>Calcular envío</button>
              <div className="summary-row summary-total"><span>Total</span><strong>{money(total)}</strong></div>
              <p style={{fontSize:".8rem",margin:0}}>El costo de envío puede actualizarse al calcularlo con tu código postal.</p>
            </section>
            <PaymentOptions enabled={buyerValid && cart.length > 0 && !loading} onMercadoPago={payWithMercadoPago} onQR={payWithQR} />
            {loading && <p>Preparando tu pago...</p>}
            {payment && (
              <section className="panel qr-payment">
                <span className="eyebrow">Pago por QR</span>
                <h2>Escaneá para pagar</h2>
                <div className="qr-frame"><QRCodeCanvas value={payment.init_point} size={220} /></div>
                <p>Orden: <strong>{payment.orderId}</strong></p>
                <h3>{money(payment.total)}</h3>
                <a href={payment.init_point} target="_blank" rel="noreferrer">Abrir Mercado Pago ↗</a>
              </section>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
export default Checkout;
