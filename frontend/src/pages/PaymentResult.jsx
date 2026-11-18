import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";

function PaymentResult() {
  const { status } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const orderId = searchParams.get("external_reference");

  useEffect(() => {
    if (!orderId) return;
    async function loadOrder() {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) { console.error(error); }
    }
    loadOrder();
  }, [orderId]);

  const messages = {
    success: { title: "¡Pago recibido!", description: "Tu pago fue recibido. Gracias por comprar en QRMarket MP.", icon: "✓", className: "success" },
    failure: { title: "No se pudo completar el pago", description: "El pago no fue aprobado. Podés volver al marketplace e intentarlo nuevamente.", icon: "!", className: "failure" },
    pending: { title: "Pago pendiente", description: "Estamos esperando la confirmación de tu pago. El estado se actualizará cuando recibamos la notificación.", icon: "…", className: "" }
  };
  const result = messages[status] || { title: "Estado del pago", description: "Consultá los datos de tu operación.", icon: "i", className: "" };

  return (
    <main className="container">
      <section className="panel result-card">
        <div className={`result-icon ${result.className}`}>{result.icon}</div>
        <span className="eyebrow">Estado de la operación</span>
        <h1 style={{fontSize:"clamp(1.8rem,4vw,2.6rem)"}}>{result.title}</h1>
        <p>{result.description}</p>
        {order ? (
          <div className="order-data">
            <p><span>Número de orden</span><strong>{order.id}</strong></p>
            <p><span>Estado informado por el servidor</span><strong>{order.status}</strong></p>
            <p><span>Total</span><strong>${Number(order.total).toLocaleString("es-AR")}</strong></p>
          </div>
        ) : orderId ? <p>Consultando los datos de tu orden...</p> : null}
        <a className="button-secondary" href="/">Volver al marketplace</a>
      </section>
    </main>
  );
}
export default PaymentResult;
