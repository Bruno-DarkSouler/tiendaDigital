function BuyerForm({ buyer, setBuyer }) {
  function handleChange(e) {
    setBuyer({ ...buyer, [e.target.name]: e.target.value });
  }
  return (
    <section className="panel buyer-form">
      <h2>Datos del comprador</h2>
      <p>Completá tus datos para preparar el envío y habilitar el pago.</p>
      <div><label htmlFor="firstName">Nombre</label><input id="firstName" name="firstName" autoComplete="given-name" value={buyer.firstName} onChange={handleChange} required /></div>
      <div><label htmlFor="lastName">Apellido</label><input id="lastName" name="lastName" autoComplete="family-name" value={buyer.lastName} onChange={handleChange} required /></div>
      <div><label htmlFor="email">Email</label><input id="email" type="email" name="email" autoComplete="email" value={buyer.email} onChange={handleChange} required /></div>
      <div><label htmlFor="phone">Teléfono</label><input id="phone" type="tel" name="phone" autoComplete="tel" value={buyer.phone} onChange={handleChange} required /></div>
      <div><label htmlFor="address">Dirección</label><input id="address" name="address" autoComplete="street-address" value={buyer.address} onChange={handleChange} required /></div>
      <div><label htmlFor="postalCode">Código postal</label><input id="postalCode" name="postalCode" autoComplete="postal-code" value={buyer.postalCode} onChange={handleChange} required /></div>
    </section>
  );
}
export default BuyerForm;
