import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadProduct() {
      try {
        setLoading(true); setError("");
        const response = await api.get(`/products/${id}`);
        if (!cancelled) setProduct(response.data);
      } catch (err) {
        console.error("Error obteniendo producto:", err);
        if (!cancelled) setError("No se pudo cargar el producto.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) loadProduct();
    else { setError("No se recibió un ID de producto."); setLoading(false); }
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <main className="container"><div className="empty-state">Cargando producto...</div></main>;
  if (error || !product) return <main className="container"><div className="empty-state"><h2>{error || "Producto no encontrado."}</h2><a href="/">Volver al catálogo</a></div></main>;

  const productUrl = `${window.location.origin}/product/${product.id}`;
  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(item => item.productId === product.id);
    const currentQuantity = existing ? existing.quantity : 0;
    if (currentQuantity + quantity > product.stock) { alert("No hay suficiente stock"); return; }
    if (existing) existing.quantity += quantity;
    else cart.push({ productId: product.id, quantity });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Producto agregado");
  }

  return (
    <main className="container">
      <p><a href="/">← Volver al catálogo</a></p>
      <div className="product-detail" style={{marginTop: 22}}>
        <img className="detail-image" src={product.image} alt={product.name} />
        <div className="detail-copy">
          <span className="eyebrow">Detalle del producto</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="product-price">${product.price.toLocaleString("es-AR")}</div>
          <span className="stock-pill">{product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}</span>
          <label htmlFor="quantity">Cantidad</label>
          <input className="quantity-input" id="quantity" type="number" min="1" max={product.stock} value={quantity} onChange={e => { const value = Number(e.target.value); if (Number.isInteger(value)) setQuantity(Math.max(1, Math.min(value, product.stock))); }} />
          <button disabled={product.stock <= 0} onClick={addToCart}>Agregar al carrito</button>
          <div>
            <div className="qr-product">
              <QRCodeCanvas value={productUrl} size={160} />
              <strong>Acceso directo al producto</strong>
              <p>Escaneá este código para abrir esta página.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
export default ProductDetail;
