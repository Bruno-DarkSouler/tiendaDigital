import {
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/product/:id"
        element={<ProductDetail />}
      />

      <Route
        path="/checkout"
        element={<Checkout />}
      />

      <Route
        path="/payment/:status"
        element={<PaymentResult />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
    </Routes>
  );
}

export default App;