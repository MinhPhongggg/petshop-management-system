import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPackage, FiCalendar, FiHeart, FiLogOut, FiStar } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { useAuthStore } from '../store/authStore';

const UserLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/profile', icon: FiUser, label: 'Thông tin cá nhân' },
    { path: '/my-orders', icon: FiPackage, label: 'Đơn hàng của tôi' },
    { path: '/my-bookings', icon: FiCalendar, label: 'Lịch hẹn của tôi' },
    { path: '/my-pets', icon: MdPets, label: 'Thú cưng của tôi' },
    { path: '/my-reviews', icon: FiStar, label: 'Đánh giá của tôi' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
            {/* User Info */}
            <div className="p-6 bg-gradient-to-r from-petshop-orange to-petshop-yellow text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FiUser className="text-2xl" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{user?.fullName || 'Người dùng'}</h3>
                  <p className="text-sm opacity-90">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-petshop-orange text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="text-xl" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <hr className="my-4" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-colors"
              >
                <FiLogOut className="text-xl" />
                Đăng xuất
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
