import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BookingPage from './pages/BookingPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import ProfilePage from './pages/user/ProfilePage';
import MyOrdersPage from './pages/user/MyOrdersPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import MyPetsPage from './pages/user/MyPetsPage';
import MyReviewsPage from './pages/user/MyReviewsPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* User Routes */}
          <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="my-pets" element={<MyPetsPage />} />
            <Route path="my-reviews" element={<MyReviewsPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
