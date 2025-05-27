import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import InventoryLogin from "./pages/InventoryLogin";
import InventoryHome from "./pages/InventoryHome";
import AddEmployee from "./pages/AddEmployee";
import InventoryMain from "./pages/InventoryMain";
import CategoryList from "./pages/CategoryList";
import InventorySales from "./pages/InventorySales";
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
import Success from "./pages/Success";
import MisCompras from "./pages/MisCompras"; // ✅ NUEVO

// Nuevos hooks de autenticación
import usePOSAuth from "./hooks/usePOSAuth";
import useInventoryAuth from "./hooks/useInventoryAuth";

console.log("✅ App.jsx se está ejecutando...");

// 🔒 Ruta protegida para POS
const POSProtectedRoute = ({ element }) => {
  const isPOSAuthenticated = usePOSAuth();
  if (isPOSAuthenticated === null)
    return <div className="text-center mt-20">Cargando...</div>;
  return isPOSAuthenticated ? element : <Navigate to="/poslogin" replace />;
};

// 🔒 Ruta protegida para inventario
const InventoryProtectedRoute = ({ element }) => {
  const isInventoryAuthenticated = useInventoryAuth();
  if (isInventoryAuthenticated === null)
    return <div className="text-center mt-20">Cargando...</div>;
  return isInventoryAuthenticated ? (
    element
  ) : (
    <Navigate to="/inventariologin" replace />
  );
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
    "/success",
    "/mis-compras", // ✅ OCULTAR NAVBAR EN ESTA RUTA
  ];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>
        {/* Públicas */}
        <Route path="/home" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* Protegida - mensaje de compra exitosa (solo POS) */}
        <Route
          path="/success"
          element={<POSProtectedRoute element={<Success />} />}
        />

        {/* ✅ NUEVA - vista de compras del cliente */}
        <Route
          path="/mis-compras"
          element={<POSProtectedRoute element={<MisCompras />} />}
        />

        {/* Protegidas - punto de venta */}
        <Route
          path="/carrito"
          element={<POSProtectedRoute element={<Cart />} />}
        />
        <Route
          path="/checkout/direccion"
          element={<POSProtectedRoute element={<CheckoutDireccion />} />}
        />
        <Route
          path="/checkout/pago"
          element={<POSProtectedRoute element={<CheckoutPago />} />}
        />
        <Route
          path="/checkout/resumen"
          element={<POSProtectedRoute element={<CheckoutResumen />} />}
        />
        <Route
          path="/pos/dashboard"
          element={<POSProtectedRoute element={<POSDashboard />} />}
        />

        {/* Protegidas - inventario */}
        <Route
          path="/inventory"
          element={<InventoryProtectedRoute element={<InventoryHome />} />}
        />
        <Route
          path="/add-employee"
          element={<InventoryProtectedRoute element={<AddEmployee />} />}
        />
        <Route
          path="/main"
          element={<InventoryProtectedRoute element={<InventoryMain />} />}
        />
        <Route
          path="/dashboard"
          element={<InventoryProtectedRoute element={<InventoryDashboard />} />}
        />
        <Route
          path="/categories"
          element={<InventoryProtectedRoute element={<CategoryList />} />}
        />
        <Route
          path="/reports"
          element={<InventoryProtectedRoute element={<InventoryReports />} />}
        />
        <Route
          path="/archive-products"
          element={<InventoryProtectedRoute element={<ArchivedProducts />} />}
        />
        <Route
          path="/archive-category"
          element={<InventoryProtectedRoute element={<ArchivedCategories />} />}
        />
        <Route
          path="/add-categorie"
          element={<InventoryProtectedRoute element={<AddCategory />} />}
        />
        <Route
          path="/edit-categorie/:id"
          element={<InventoryProtectedRoute element={<EditCategory />} />}
        />
        <Route
          path="/add-product"
          element={<InventoryProtectedRoute element={<AddProduct />} />}
        />
        <Route
          path="/view-product"
          element={<InventoryProtectedRoute element={<ViewProducts />} />}
        />
        <Route
          path="/inventory/sales"
          element={<InventoryProtectedRoute element={<InventorySales />} />}
        />
        <Route
          path="/edit-product/:id"
          element={<InventoryProtectedRoute element={<EditProduct />} />}
        />

        {/* Login y registro */}
        <Route path="/inventariologin" element={<InventoryLogin />} />
        <Route path="/poslogin" element={<POSLogin />} />
        <Route path="/pos/register" element={<POSRegister />} />
      </Routes>
    </>
  );
}

export default App;
