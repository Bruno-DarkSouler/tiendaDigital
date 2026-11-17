import { useEffect, useState } from "react";

import api from "../services/api";

import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
    return JSON.parse(
      localStorage.getItem("cart") || "[]"
    );
  });

  useEffect(() => {
    api.get("/products")
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  function addToCart(product) {
    const updated = [...cart];

    const existing = updated.find(
      item => item.productId === product.id
    );

    if (existing) {
      if (existing.quantity >= product.stock) return;

      existing.quantity += 1;

    } else {
      updated.push({
        productId: product.id,
        quantity: 1
      });
    }

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );

    alert("Producto agregado al carrito");
  }

  return (
    <div className="container">

      <h1>QRMarket MP</h1>

      <p>Comprá, escaneá y pagá con MercadoPago.</p>

      <h2>Nuestros productos</h2>

      <div className="product-grid">

        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}

      </div>

      <a href="/checkout">
        Ir al carrito ({cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        )})
      </a>

    </div>
  );
}

export default Home;