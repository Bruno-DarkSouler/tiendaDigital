import { useEffect, useState } from "react";

import api from "../services/api";

function Dashboard() {
  const [products, setProducts] = useState([]);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsResponse, ordersResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/orders")
        ]);

      setProducts(productsResponse.data);

      setOrders(ordersResponse.data);

    } catch (error) {
      console.error(error);
    }
  }

  const approvedOrders = orders.filter(
    order => order.status === "approved"
  );

  const totalSales = approvedOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  return (
    <div className="container">

      <h1>Dashboard QRMarket MP</h1>

      <div className="dashboard-stats">

        <div>
          <h3>Productos</h3>
          <h2>{products.length}</h2>
        </div>

        <div>
          <h3>Órdenes</h3>
          <h2>{orders.length}</h2>
        </div>

        <div>
          <h3>Ventas aprobadas</h3>
          <h2>{approvedOrders.length}</h2>
        </div>

        <div>
          <h3>Facturación aprobada</h3>
          <h2>
            ${totalSales.toLocaleString("es-AR")}
          </h2>
        </div>

      </div>

      <h2>Productos</h2>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Órdenes recibidas</h2>

      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Comprador</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>

              <td>
                {order.buyer.firstName}
                {" "}
                {order.buyer.lastName}
              </td>

              <td>${order.total}</td>

              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={loadData}>
        Actualizar información
      </button>

    </div>
  );
}

export default Dashboard;