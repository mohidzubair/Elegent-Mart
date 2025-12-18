import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomePage from "./Homepage";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Login from "./Login";
import Signup from "./Signup";
import EmailVerification from "./EmailVerification";
import ProductPage from "./ProductPage";
import AllProducts from "./All-products";
import Wishlist from "./Wishlist";
import CategoryPage from "./CategoryPage";
import AdminPortal from "./AdminPortal";
import OrderManagement from "./OrderManagement";
import AnalyticsReports from "./AnalyticsReports";
import CustomerManagement from "./CustomerManagement";
import TransactionManagement from "./TransactionManagement";
import Notifications from "./Notifications";
import ProductsInventory from "./ProductsInventory";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      {/* Only show Navbar/Footer if NOT on admin pages */}
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* Normal pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />

        {/* Admin pages - Protected for admin role only */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPortal />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute requireAdmin={true}>
            <OrderManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requireAdmin={true}>
            <AnalyticsReports />
          </ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute requireAdmin={true}>
            <CustomerManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute requireAdmin={true}>
            <TransactionManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute requireAdmin={true}>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute requireAdmin={true}>
            <ProductsInventory />
          </ProtectedRoute>
        } />
      </Routes>

      {!isAdminPage && <Footer />}
    </AuthProvider>
  );
}

export default App;
