import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiCalendar, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const MobileNav = () => {
  const location = useLocation();
  const { getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Trang chủ' },
    { path: '/products', icon: FiGrid, label: 'Sản phẩm' },
    { path: '/booking', icon: FiCalendar, label: 'Đặt lịch' },
    { path: '/cart', icon: FiShoppingCart, label: 'Giỏ hàng', badge: getItemCount() },
    { path: isAuthenticated ? '/profile' : '/login', icon: FiUser, label: 'Tài khoản' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              location.pathname === item.path
                ? 'text-petshop-orange'
                : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-petshop-orange text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            {location.pathname === item.path && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-petshop-orange rounded-b-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
