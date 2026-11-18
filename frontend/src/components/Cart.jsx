function Cart({ products, cart, setCart }) {
  function updateQuantity(id, quantity) {
    const updated = cart.map(item => item.productId === id ? { ...item, quantity } : item).filter(item => item.quantity > 0);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }
  function removeItem(id) {
    const updated = cart.filter(item => item.productId !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <section className="panel">
      <h2>Tu carrito</h2>
      <p>Revisá los artículos antes de continuar.</p>
      {cart.length === 0 ? <div className="empty-state"><h3>Tu carrito está vacío</h3><p>Volvé al catálogo para descubrir productos.</p><a href="/">Explorar catálogo →</a></div> : (
        <div className="cart-list">
          {cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return (
              <div className="cart-item" key={item.productId}>
                <div><strong>{product.name}</strong><small>${product.price.toLocaleString("es-AR")} c/u</small></div>
                <input aria-label={`Cantidad de ${product.name}`} type="number" min="0" max={product.stock} value={item.quantity} onChange={e => updateQuantity(item.productId, Math.min(product.stock, Math.max(0, Number(e.target.value))))} />
                <button className="text-button" onClick={() => removeItem(item.productId)}>Quitar</button>
              </div>
            );
          })}
        </div>
      )}
      <div className="summary-row summary-total"><span>Subtotal</span><strong>${subtotal.toLocaleString("es-AR")}</strong></div>
    </section>
  );
}
export default Cart;
