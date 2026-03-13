import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiHeart, FiChevronRight } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { categoriesApi } from '../../services/api';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activePetType, setActivePetType] = useState(null);
  const categoryMenuRef = useRef(null);
  const categoryTimeoutRef = useRef(null);
  
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

  useEffect(() => {
    categoriesApi.getTree().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !activePetType) {
      setActivePetType(categories[0]?.id);
    }
  }, [categories, activePetType]);

  const handleCategoryMenuEnter = () => {
    clearTimeout(categoryTimeoutRef.current);
    setCategoryMenuOpen(true);
  };

  const handleCategoryMenuLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setCategoryMenuOpen(false);
    }, 200);
  };

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

  // Lấy danh mục cha đang active
  const activePetCategory = categories.find(c => c.id === activePetType);

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
              {navLinks.map((link) => {
                // Thêm mega-menu cho "Sản phẩm"
                if (link.path === '/products') {
                  return (
                    <div
                      key={link.path}
                      className="relative"
                      onMouseEnter={handleCategoryMenuEnter}
                      onMouseLeave={handleCategoryMenuLeave}
                      ref={categoryMenuRef}
                    >
                      <Link
                        to={link.path}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-1 ${
                          location.pathname === link.path || location.pathname.startsWith('/products')
                            ? 'bg-petshop-orange text-white'
                            : isScrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-700 hover:bg-white/50'
                        }`}
                      >
                        {link.label}
                        <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                      </Link>

                      {/* Mega Menu Dropdown */}
                      <AnimatePresence>
                        {categoryMenuOpen && categories.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                            style={{ minWidth: '720px' }}
                          >
                            <div className="flex">
                              {/* Tab bên trái: Loại thú cưng (Level 0) */}
                              <div className="w-48 bg-gray-50 border-r border-gray-100 py-3">
                                {categories.map(rootCat => (
                                  <button
                                    key={rootCat.id}
                                    onMouseEnter={() => setActivePetType(rootCat.id)}
                                    className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-all flex items-center justify-between ${
                                      activePetType === rootCat.id
                                        ? 'bg-white text-petshop-orange border-r-2 border-petshop-orange'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                                  >
                                    {rootCat.name}
                                    <FiChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                ))}
                                <div className="border-t border-gray-200 mt-2 pt-2 px-5">
                                  <Link
                                    to="/products"
                                    onClick={() => setCategoryMenuOpen(false)}
                                    className="text-sm text-petshop-blue hover:underline"
                                  >
                                    Xem tất cả →
                                  </Link>
                                </div>
                              </div>

                              {/* Nội dung bên phải: danh mục level 1 & 2 */}
                              <div className="flex-1 p-5">
                                {activePetCategory && activePetCategory.children && (
                                  <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                                    {activePetCategory.children.map(level1Cat => (
                                      <div key={level1Cat.id}>
                                        {/* Level 1 header */}
                                        <Link
                                          to={`/products?category=${level1Cat.slug}`}
                                          onClick={() => setCategoryMenuOpen(false)}
                                          className="font-bold text-gray-800 text-sm hover:text-petshop-orange transition-colors block mb-2 pb-1 border-b border-gray-100"
                                        >
                                          {level1Cat.name}
                                        </Link>
                                        {/* Level 2 items */}
                                        {level1Cat.children && level1Cat.children.length > 0 && (
                                          <ul className="space-y-1">
                                            {level1Cat.children.map(level2Cat => (
                                              <li key={level2Cat.id}>
                                                <Link
                                                  to={`/products?category=${level2Cat.slug}`}
                                                  onClick={() => setCategoryMenuOpen(false)}
                                                  className="text-sm text-gray-500 hover:text-petshop-orange transition-colors block py-0.5"
                                                >
                                                  {level2Cat.name}
                                                </Link>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
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
                );
              })}
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
                {navLinks.map((link) => {
                  // Mobile: Danh mục sản phẩm dạng accordion
                  if (link.path === '/products' && categories.length > 0) {
                    return (
                      <div key={link.path}>
                        <Link
                          to={link.path}
                          className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                            location.pathname === link.path
                              ? 'bg-petshop-orange text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {link.label}
                        </Link>
                        {/* Mobile category tree */}
                        <div className="ml-4 mt-1 space-y-1">
                          {categories.map(rootCat => (
                            <div key={rootCat.id}>
                              <button
                                onClick={() => setActivePetType(activePetType === rootCat.id ? null : rootCat.id)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                              >
                                {rootCat.name}
                                <FiChevronDown className={`w-4 h-4 transition-transform ${activePetType === rootCat.id ? 'rotate-180' : ''}`} />
                              </button>
                              <AnimatePresence>
                                {activePetType === rootCat.id && rootCat.children && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden ml-3"
                                  >
                                    {rootCat.children.map(l1 => (
                                      <div key={l1.id} className="mb-1">
                                        <Link
                                          to={`/products?category=${l1.slug}`}
                                          className="block px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-petshop-orange"
                                        >
                                          {l1.name}
                                        </Link>
                                        {l1.children && l1.children.map(l2 => (
                                          <Link
                                            key={l2.id}
                                            to={`/products?category=${l2.slug}`}
                                            className="block px-6 py-1 text-sm text-gray-400 hover:text-petshop-orange"
                                          >
                                            {l2.name}
                                          </Link>
                                        ))}
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
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
                  );
                })}
                
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
