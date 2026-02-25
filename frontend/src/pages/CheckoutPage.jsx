import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ordersApi } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, isLoading: isCartLoading, getTotalPrice, clearCartLocal, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [hasFetchedCart, setHasFetchedCart] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
    notes: '',
    paymentMethod: 'COD',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    (async () => {
      await fetchCart();
      setHasFetchedCart(true);
    })();
  }, [isAuthenticated, navigate, fetchCart]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setLoading(true);
    try {
      const shippingAddressParts = [
        formData.address,
        formData.ward,
        formData.district,
        formData.city,
      ].map((p) => (p || '').trim()).filter(Boolean);

      const orderData = {
        shippingAddress: shippingAddressParts.join(', '),
        receiverName: formData.fullName,
        receiverPhone: formData.phone,
        note: formData.notes,  // BE expects 'note' not 'notes'
        paymentMethod: 'COD',
      };

      await ordersApi.create(orderData);
      
      clearCartLocal();
      await fetchCart();
      toast.success('Đặt hàng thành công!');
      navigate(`/my-orders`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && (isCartLoading || !hasFetchedCart)) {
    return (
      <div className="min-h-screen bg-petshop-cream py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-petshop-cream py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Giỏ hàng trống
          </h1>
          <Link to="/products" className="btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petshop-cream py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Shipping Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiMapPin className="text-petshop-orange" />
                  Địa chỉ giao hàng
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="VD: Quận 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="VD: Phường Bến Nghé"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ cụ thể *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Số nhà, tên đường..."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="input-field"
                      placeholder="Ghi chú về đơn hàng, thời gian nhận hàng..."
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiCreditCard className="text-petshop-orange" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'COD'
                      ? 'border-petshop-green bg-petshop-green/5'
                      : 'border-gray-200 hover:border-petshop-green/50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="w-5 h-5 text-petshop-green"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm sticky top-32"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    (() => {
                      const productName = item.productName || item.product?.name;
                      const productImage = item.productImage || item.product?.images?.[0]?.url || 'https://via.placeholder.com/60';
                      const variantName = item.variantName || item.variant?.name;
                      const unitPrice = item.currentPrice || item.price || item.variant?.price || item.product?.salePrice || item.product?.basePrice || 0;
                      const lineTotal = (item.subtotal ?? unitPrice * item.quantity) || 0;
                      return (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {productName}
                        </p>
                        {variantName && <p className="text-xs text-gray-500">{variantName}</p>}
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-petshop-orange whitespace-nowrap">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                      );
                    })()
                  ))}
                </div>

                <hr className="my-4" />

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiTruck className="text-petshop-green" />
                      Phí vận chuyển
                    </span>
                    <span className="text-petshop-green font-medium">Miễn phí</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-petshop-orange">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Hệ thống hiện hỗ trợ thanh toán khi nhận hàng (COD).
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
