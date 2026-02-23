import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiBell,
  FiSearch,
  FiGrid,
} from 'react-icons/fi';
import { MdPets, MdSpa } from 'react-icons/md';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FiPackage, label: 'Sản phẩm' },
    { path: '/admin/categories', icon: FiGrid, label: 'Danh mục' },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Đơn hàng' },
    { path: '/admin/bookings', icon: FiCalendar, label: 'Lịch đặt' },
    { path: '/admin/services', icon: MdSpa, label: 'Dịch vụ' },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-xl flex items-center justify-center">
              <MdPets className="text-white text-2xl" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl text-gray-800">PetShop</span>
            )}
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive(item.path, item.exact)
                  ? 'bg-petshop-orange text-white shadow-lg shadow-petshop-orange/30'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiMenu className="w-5 h-5 text-gray-600" />
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
              <FiSearch className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-xl">
              <FiBell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="font-medium text-gray-800">{user?.fullName}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-xl flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600"
                title="Đăng xuất"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
