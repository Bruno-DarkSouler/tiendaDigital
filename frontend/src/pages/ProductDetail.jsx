
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

    console.log("ID recibido:", id);

    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        if (!cancelled) {
          setProduct(response.data);
        }

      } catch (err) {

        console.error("Error obteniendo producto:", err);

        if (!cancelled) {
          setError("No se pudo cargar el producto.");
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    }

    if (id) {
      loadProduct();
    } else {
      setError("No se recibió un ID de producto.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };

  }, [id]);

  // Estados de carga y error

  if (loading) {
    return <p>Cargando producto...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!product) {
    return <p>Producto no encontrado.</p>;
  }

  // A partir de aquí sabemos que product existe

  const productUrl =
    `${window.location.origin}/product/${product.id}`;

  function addToCart() {

    const cart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existing = cart.find(
      item => item.productId === product.id
    );

    const currentQuantity = existing
      ? existing.quantity
      : 0;

    if (currentQuantity + quantity > product.stock) {
      alert("No hay suficiente stock");
      return;
    }

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        quantity
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    alert("Producto agregado");
  }

  return (
    <div className="container">

      <img
        src={product.image}
        width="350"
        alt={product.name}
      />

      <h1>{product.name}</h1>

      <p>{product.description}</p>

      <h2>
        ${product.price.toLocaleString("es-AR")}
      </h2>

      <p>Stock disponible: {product.stock}</p>

      <input
        type="number"
        min="1"
        max={product.stock}
        value={quantity}
        onChange={e => {
          const value = Number(e.target.value);

          if (Number.isInteger(value)) {
            setQuantity(
              Math.max(1, Math.min(value, product.stock))
            );
          }
        }}
      />

      <button
        onClick={addToCart}
        disabled={product.stock <= 0}
      >
        Agregar al carrito
      </button>

      <h3>QR del producto</h3>

      <QRCodeCanvas
        value={productUrl}
        size={200}
      />

      <p>Escaneá para acceder al producto.</p>

    </div>
  );
}

export default ProductDetail;
