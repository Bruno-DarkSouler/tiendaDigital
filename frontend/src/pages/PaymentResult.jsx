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
        const response = await api.get(
          `/orders/${orderId}`
        );

        setOrder(response.data);

      } catch (error) {
        console.error(error);
      }
    }

    loadOrder();

  }, [orderId]);

  const messages = {
    success: "Tu pago fue recibido.",
    failure: "No se pudo completar el pago.",
    pending: "Tu pago está pendiente de confirmación."
  };

  return (
    <div className="container">

      <h1>Resultado de tu compra</h1>

      <h2>{messages[status] || "Estado del pago"}</h2>

      {order && (
        <>
          <p>Orden: {order.id}</p>

          <p>
            Estado confirmado por el servidor:
            {" "}{order.status}
          </p>

          <p>Total: ${order.total}</p>
        </>
      )}

      <a href="/">
        Volver al marketplace
      </a>

    </div>
  );
}

export default PaymentResult;