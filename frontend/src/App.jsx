import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/">
            <span className="brand-mark">⌁</span>
            <span>QRMarket <span style={{color:"#43d9f5"}}>MP</span></span>
          </a>
          <nav className="header-links">
            <a href="/">Marketplace</a>
            <a href="/dashboard">Panel</a>
            <a className="cart-link" href="/checkout">Carrito ↗</a>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:status" element={<PaymentResult />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <footer className="site-footer">QRMarket MP · Compras simples, pagos inteligentes.</footer>
    </>
  );
}
export default App;
