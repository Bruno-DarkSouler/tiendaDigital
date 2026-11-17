function Cart({
  products,
  cart,
  setCart
}) {
  function updateQuantity(id, quantity) {
    const updated = cart.map(item => {
      if (item.productId === id) {
        return {
          ...item,
          quantity
        };
      }

      return item;
    }).filter(item => item.quantity > 0);

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );
  }

  function removeItem(id) {
    const updated = cart.filter(
      item => item.productId !== id
    );

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(
      p => p.id === item.productId
    );

    return sum + (
      product
        ? product.price * item.quantity
        : 0
    );
  }, 0);

  return (
    <div>

      <h2>Mi carrito</h2>

      {cart.map(item => {
        const product = products.find(
          p => p.id === item.productId
        );

        if (!product) return null;

        return (
          <div key={item.productId}>

            <h3>{product.name}</h3>

            <p>Precio: ${product.price}</p>

            <input
              type="number"
              min="0"
              max={product.stock}
              value={item.quantity}
              onChange={e => {
                updateQuantity(
                  item.productId,
                  Number(e.target.value)
                );
              }}
            />

            <button
              onClick={() => removeItem(item.productId)}
            >
              Eliminar
            </button>

          </div>
        );
      })}

      <h3>Subtotal: ${subtotal}</h3>

    </div>
  );
}

export default Cart;