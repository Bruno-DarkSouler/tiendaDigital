import { Link } from "react-router-dom";

function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">

      <img
        src={product.image}
        alt={product.name}
      />

      <div className="product-info">

        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <h2>
          ${product.price.toLocaleString("es-AR")}
        </h2>

        <p>Stock: {product.stock}</p>

        <Link to={`/product/${product.id}`}>
          Ver producto
        </Link>

        <button
          disabled={product.stock <= 0}
          onClick={() => addToCart(product)}
        >
          Agregar al carrito
        </button>

      </div>
    </div>
  );
}

export default ProductCard;