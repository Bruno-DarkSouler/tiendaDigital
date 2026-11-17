function BuyerForm({
  buyer,
  setBuyer
}) {
  function handleChange(e) {
    setBuyer({
      ...buyer,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className="buyer-form">

      <h2>Datos del comprador</h2>

      <p>
        Completá tus datos para continuar con la compra.
      </p>

      <label>Nombre</label>

      <input
        name="firstName"
        value={buyer.firstName}
        onChange={handleChange}
        required
      />

      <label>Apellido</label>

      <input
        name="lastName"
        value={buyer.lastName}
        onChange={handleChange}
        required
      />

      <label>Email</label>

      <input
        type="email"
        name="email"
        value={buyer.email}
        onChange={handleChange}
        required
      />

      <label>Teléfono</label>

      <input
        type="tel"
        name="phone"
        value={buyer.phone}
        onChange={handleChange}
        required
      />

      <label>Dirección</label>

      <input
        name="address"
        value={buyer.address}
        onChange={handleChange}
        required
      />

      <label>Código postal</label>

      <input
        name="postalCode"
        value={buyer.postalCode}
        onChange={handleChange}
        required
      />

    </div>
  );
}

export default BuyerForm;