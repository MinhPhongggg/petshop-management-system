import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiHeart } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/products', label: 'Sản phẩm' },
    { path: '/services', label: 'Dịch vụ Spa' },
    { path: '/booking', label: 'Đặt lịch' },
    { path: '/about', label: 'Về chúng tôi' },
    { path: '/contact', label: 'Liên hệ' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        {/* Top Bar */}
        <div className="hidden lg:block bg-petshop-orange text-white py-2">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span>📞 Hotline: 1900 1234</span>
              <span>📧 support@petshop.vn</span>
            </div>
            <div className="flex items-center gap-4">
              <span>🚚 Miễn phí vận chuyển đơn từ 500K</span>
              <span>⭐ Tích điểm đổi quà</span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-10">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-xl flex items-center justify-center shadow-lg"
              >
                <MdPets className="text-white text-2xl lg:text-3xl" />
              </motion.div>
              <div>
                <span className={`font-display font-bold text-xl lg:text-2xl ${isScrolled ? 'text-gray-800' : 'text-gray-800'}`}>
                  Pet<span className="text-petshop-orange">Shop</span>
                </span>
                <p className={`text-xs hidden lg:block ${isScrolled ? 'text-gray-500' : 'text-gray-500'}`}>
                  Yêu thương thú cưng của bạn
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-petshop-orange text-white'
                      : isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/50'
                }`}
              >
                <FiSearch className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className={`hidden lg:flex p-2 rounded-full transition-all duration-200 ${
                  isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/50'
                }`}
              >
                <FiHeart className="w-5 h-5 lg:w-6 lg:h-6" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative p-2 rounded-full transition-all duration-200 ${
                  isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/50'
                }`}
              >
                <FiShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-petshop-orange text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
                      isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <FiChevronDown className={`hidden lg:block w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="font-semibold text-gray-800">{user?.fullName}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          👤 Tài khoản của tôi
                        </Link>
                        <Link
                          to="/my-orders"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📦 Đơn hàng
                        </Link>
                        <Link
                          to="/my-bookings"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📅 Lịch đã đặt
                        </Link>
                        <Link
                          to="/my-pets"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          🐾 Thú cưng của tôi
                        </Link>
                        {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-petshop-orange hover:bg-orange-50 border-t"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            ⚙️ Quản trị
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t"
                        >
                          🚪 Đăng xuất
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex btn-primary text-sm"
                >
                  Đăng nhập
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-t"
            >
              <div className="container mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm, dịch vụ..."
                    className="input-field flex-1"
                    autoFocus
                  />
                  <button type="submit" className="btn-primary">
                    Tìm kiếm
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed inset-0 top-16 bg-white z-40 lg:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                      location.pathname === link.path
                        ? 'bg-petshop-orange text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {!isAuthenticated && (
                  <div className="pt-4 space-y-2">
                    <Link to="/login" className="block btn-primary text-center">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="block btn-outline text-center">
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-28" />

      {/* Click outside to close menus */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Header;
