import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));

  useEffect(() => {
    api.get("/products").then(response => setProducts(response.data)).catch(console.error);
  }, []);

  function addToCart(product) {
    const updated = [...cart];
    const existing = updated.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      existing.quantity += 1;
    } else {
      updated.push({ productId: product.id, quantity: 1 });
    }
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Marketplace digital · Pagos seguros</span>
          <h1>La próxima forma de comprar es <span>más simple.</span></h1>
          <p>Descubrí productos, armá tu carrito y elegí cómo pagar. Una experiencia de compra rápida, conectada y segura con Mercado Pago.</p>
          <div className="hero-actions">
            <a className="button-secondary" href="#catalogo">Explorar productos ↓</a>
            <a className="button-secondary" href="/checkout">Ver carrito ({cartCount})</a>
          </div>
        </div>
      </section>

      <section id="catalogo">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Selección disponible</span>
            <h2>Explorá el catálogo</h2>
            <p>Encontrá lo que buscás y agregalo a tu carrito.</p>
          </div>
          <a href="/checkout">Ir al carrito ({cartCount}) →</a>
        </div>
        {products.length === 0 ? (
          <div className="empty-state"><h3>Preparando el catálogo</h3><p>En este momento no hay productos para mostrar.</p></div>
        ) : (
          <div className="product-grid">
            {products.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
          </div>
        )}
      </section>
    </main>
  );
}
export default Home;
