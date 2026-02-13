import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantityLocal, removeItemLocal, clearCartLocal, getTotalPrice, getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-petshop-cream py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl mb-6"
            >
              🛒
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              <FiShoppingBag />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petshop-cream py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng</h1>
          <p className="text-gray-600 mt-1">{getItemCount()} sản phẩm</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <Link to={`/products/${item.product?.slug}`} className="flex-shrink-0">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/120'}
                      alt={item.product?.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?.slug}`}
                      className="font-semibold text-gray-800 hover:text-petshop-orange transition-colors line-clamp-2"
                    >
                      {item.product?.name}
                    </Link>
                    
                    {item.variant && (
                      <p className="text-sm text-gray-500 mt-1">
                        Phân loại: {item.variant.name}
                      </p>
                    )}

                    <div className="mt-2">
                      <span className="text-lg font-bold text-petshop-orange">
                        {formatPrice(item.price || item.variant?.price || item.product?.salePrice || item.product?.basePrice)}
                      </span>
                    </div>

                    {/* Mobile: Quantity & Remove */}
                    <div className="flex items-center justify-between mt-4 md:hidden">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantityLocal(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantityLocal(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItemLocal(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop: Quantity & Remove */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantityLocal(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantityLocal(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <p className="text-lg font-bold text-petshop-orange">
                        {formatPrice((item.price || item.variant?.price || item.product?.salePrice || item.product?.basePrice) * item.quantity)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItemLocal(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
                  clearCartLocal();
                }
              }}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Xóa tất cả giỏ hàng
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-32">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tổng đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-petshop-green">Miễn phí</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-petshop-orange">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              {/* Voucher */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="input-field flex-1"
                  />
                  <button className="btn-outline px-4">
                    Áp dụng
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Thanh toán
                <FiArrowRight />
              </button>

              <Link
                to="/products"
                className="block text-center text-petshop-orange hover:underline mt-4 text-sm"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
