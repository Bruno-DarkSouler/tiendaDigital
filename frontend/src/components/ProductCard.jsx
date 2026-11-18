import { Link } from "react-router-dom";

function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-price">${product.price.toLocaleString("es-AR")}</div>
        <div className="product-meta">{product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}</div>
        <div className="product-actions">
          <Link to={`/product/${product.id}`}>Ver detalles</Link>
          <button disabled={product.stock <= 0} onClick={() => addToCart(product)}>Agregar al carrito</button>
        </div>
      </div>
    </article>
  );
}
export default ProductCard;
