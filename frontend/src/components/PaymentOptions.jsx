function PaymentOptions({ enabled, onMercadoPago, onQR }) {
  return (
    <section className="panel payment-options">
      <div><span className="eyebrow">Último paso</span><h2>Elegí cómo pagar</h2><p>Procesamos tu pago de forma segura con Mercado Pago.</p></div>
      <button disabled={!enabled} onClick={onMercadoPago}>Continuar con Mercado Pago ↗</button>
      <button className="qr-button" disabled={!enabled} onClick={onQR}>Generar código QR</button>
      {!enabled && <p>Completá los datos del comprador y agregá productos para habilitar las opciones de pago.</p>}
    </section>
  );
}
export default PaymentOptions;
