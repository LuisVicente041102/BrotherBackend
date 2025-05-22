import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import InventoryLogin from "./pages/InventoryLogin";
import InventoryHome from "./pages/InventoryHome";
import AddEmployee from "./pages/AddEmployee";
import InventoryMain from "./pages/InventoryMain";
import CategoryList from "./pages/CategoryList";
import ArchivedCategories from "./pages/ArchivedCategories";
import EditCategory from "./pages/EditCategory";
import POSLogin from "./pages/POSLogin";
import POSRegister from "./pages/POSRegister";
import ArchivedProducts from "./pages/ArchivedProducts";
import InventoryDashboard from "./pages/InventoryDashboard";
import POSDashboard from "./pages/POSDashboard";
import AddProduct from "./pages/AddProduct";
import InventoryReports from "./pages/InventoryReports";
import AddCategory from "./pages/AddCategory";
import EditProduct from "./pages/EditProduct";
import ViewProducts from "./pages/ViewProducts";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import CheckoutDireccion from "./pages/CheckoutDireccion";
import CheckoutPago from "./pages/CheckoutPago";
import CheckoutResumen from "./pages/CheckoutResumen";
import Navbar from "./components/Navbar";
import useAuth from "./hooks/useAuth";

console.log("✅ App.jsx se está ejecutando...");

// 🔒 Verifica si hay token + usuario
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = useAuth();
  if (isAuthenticated === null) {
    return <div className="text-center mt-20">Cargando...</div>;
  }
  return isAuthenticated ? element : <Navigate to="/poslogin" replace />;
};

function App() {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/inventariologin",
    "/poslogin",
    "/pos/register",
    "/home",
    "/catalogo",
    "/carrito",
    "/checkout/direccion",
    "/checkout/pago",
    "/checkout/resumen",
    `/producto/${location.pathname.split("/")[2]}`,
  ];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>
        {/* Públicas */}
        <Route path="/home" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* Protegidas por sesión POS */}
        <Route
          path="/carrito"
          element={<ProtectedRoute element={<Cart />} />}
        />
        <Route
          path="/checkout/direccion"
          element={<ProtectedRoute element={<CheckoutDireccion />} />}
        />
        <Route
          path="/checkout/pago"
          element={<ProtectedRoute element={<CheckoutPago />} />}
        />
        <Route
          path="/checkout/resumen"
          element={<ProtectedRoute element={<CheckoutResumen />} />}
        />

        {/* Login y registro */}
        <Route path="/inventariologin" element={<InventoryLogin />} />
        <Route path="/poslogin" element={<POSLogin />} />
        <Route path="/pos/register" element={<POSRegister />} />

        {/* Protegidas - inventario */}
        <Route
          path="/inventory"
          element={<ProtectedRoute element={<InventoryHome />} />}
        />
        <Route
          path="/add-employee"
          element={<ProtectedRoute element={<AddEmployee />} />}
        />
        <Route
          path="/main"
          element={<ProtectedRoute element={<InventoryMain />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<InventoryDashboard />} />}
        />
        <Route
          path="/categories"
          element={<ProtectedRoute element={<CategoryList />} />}
        />
        <Route
          path="/reports"
          element={<ProtectedRoute element={<InventoryReports />} />}
        />
        <Route
          path="/archive-products"
          element={<ProtectedRoute element={<ArchivedProducts />} />}
        />
        <Route
          path="/archive-category"
          element={<ProtectedRoute element={<ArchivedCategories />} />}
        />
        <Route
          path="/add-categorie"
          element={<ProtectedRoute element={<AddCategory />} />}
        />
        <Route
          path="/edit-categorie/:id"
          element={<ProtectedRoute element={<EditCategory />} />}
        />
        <Route
          path="/add-product"
          element={<ProtectedRoute element={<AddProduct />} />}
        />
        <Route
          path="/view-product"
          element={<ProtectedRoute element={<ViewProducts />} />}
        />
        <Route
          path="/edit-product/:id"
          element={<ProtectedRoute element={<EditProduct />} />}
        />
        <Route
          path="/pos/dashboard"
          element={<ProtectedRoute element={<POSDashboard />} />}
        />
      </Routes>
    </>
  );
}

export default App;
