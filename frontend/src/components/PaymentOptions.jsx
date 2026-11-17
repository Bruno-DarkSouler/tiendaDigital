function PaymentOptions({
  enabled,
  onMercadoPago,
  onQR
}) {
  return (
    <div className="payment-options">

      <h2>Elegí cómo pagar</h2>

      <button
        disabled={!enabled}
        onClick={onMercadoPago}
      >
        Pagar con MercadoPago
      </button>

      <button
        disabled={!enabled}
        onClick={onQR}
      >
        Pagar con código QR
      </button>

      {!enabled && (
        <p>
          Completá los datos del comprador
          para habilitar las opciones de pago.
        </p>
      )}

    </div>
  );
}

export default PaymentOptions;