import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiTruck, FiTag, FiX, FiGift, FiPercent, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ordersApi, vouchersApi } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, isLoading: isCartLoading, getTotalPrice, clearCart, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [hasFetchedCart, setHasFetchedCart] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [savedVouchersLoading, setSavedVouchersLoading] = useState(false);
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

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await vouchersApi.apply(voucherCode.trim(), getTotalPrice());
      const discountAmount = res.data.discount;
      if (discountAmount > 0) {
        setDiscount(discountAmount);
        try {
          const vInfo = await vouchersApi.getByCode(voucherCode.trim());
          setAppliedVoucher(vInfo.data);
        } catch { setAppliedVoucher({ code: voucherCode.trim().toUpperCase() }); }
        toast.success(`Áp dụng mã ${voucherCode.toUpperCase()} thành công! Giảm ${formatPrice(discountAmount)}`);
      } else {
        toast.error('Mã không áp dụng được cho đơn hàng này');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setDiscount(0);
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    setDiscount(0);
    toast.success('Đã gỡ mã giảm giá');
  };

  const fetchSavedVouchers = async () => {
    setSavedVouchersLoading(true);
    try {
      const res = await vouchersApi.getMySaved();
      setSavedVouchers(res.data || []);
    } catch {
      setSavedVouchers([]);
    } finally {
      setSavedVouchersLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (url && url.startsWith('/images/')) {
      return url;
    }
    return url || '/images/paw-pattern.svg';
  };

  const handleSelectFromWallet = (voucher) => {
    setVoucherCode(voucher.code);
    setShowVoucherModal(false);
    // Auto-apply
    setTimeout(async () => {
      setVoucherLoading(true);
      try {
        const res = await vouchersApi.apply(voucher.code, getTotalPrice());
        const discountAmount = res.data.discount;
        if (discountAmount > 0) {
          setDiscount(discountAmount);
          setAppliedVoucher(voucher);
          toast.success(`Áp dụng mã ${voucher.code} thành công! Giảm ${formatPrice(discountAmount)}`);
        } else {
          toast.error('Mã không áp dụng được cho đơn hàng này');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
        setDiscount(0);
        setAppliedVoucher(null);
      } finally {
        setVoucherLoading(false);
      }
    }, 100);
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
        paymentMethod: formData.paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        items: items.map(item => ({
          productId: item.productId || item.product?.id,
          variantId: item.variantId || item.variant?.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await ordersApi.create(orderData);
      const createdOrder = orderRes.data;

      await clearCart();

      // Nếu thanh toán MoMo -> chuyển sang trang thanh toán MoMo
      if (formData.paymentMethod === 'MOMO') {
        navigate(`/payment/momo/${createdOrder.id}`, { state: { order: createdOrder } });
      } else {
        toast.success('Đặt hàng thành công!');
        navigate(`/my-orders`);
      }
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

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'MOMO'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOMO"
                      checked={formData.paymentMethod === 'MOMO'}
                      onChange={handleChange}
                      className="w-5 h-5 text-pink-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">Ví MoMo</span>
                      <p className="text-sm text-gray-500">Thanh toán qua ví điện tử MoMo</p>
                    </div>
                    <span className="text-2xl">📱</span>
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
                      const productImage = getImageUrl(item.productImage || item.product?.images?.[0]?.imageUrl || item.product?.images?.[0]?.url);
                      const variantName = item.variantName || item.variant?.name;
                      const unitPrice = item.currentPrice || item.price || item.variant?.price || item.product?.salePrice || item.product?.basePrice || 0;
                      const lineTotal = (item.subtotal ?? unitPrice * item.quantity) || 0;
                      return (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={productImage}
                        alt={productName}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/paw-pattern.svg'; }}
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

                  {/* Voucher */}
                  <div className="pt-2">
                    {appliedVoucher ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FiTag className="text-emerald-600" />
                          <div>
                            <p className="font-bold text-emerald-700 text-sm">{appliedVoucher.code}</p>
                            <p className="text-xs text-emerald-600">Giảm {formatPrice(discount)}</p>
                          </div>
                        </div>
                        <button onClick={handleRemoveVoucher} className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors">
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyVoucher())}
                            placeholder="Nhập mã giảm giá"
                            className="input-field flex-1 font-mono uppercase tracking-wider text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleApplyVoucher}
                            disabled={voucherLoading || !voucherCode.trim()}
                            className="px-4 py-2 border border-petshop-orange text-petshop-orange font-medium rounded-lg text-sm hover:bg-petshop-orange/5 disabled:opacity-50 transition-colors"
                          >
                            {voucherLoading ? '...' : 'Áp dụng'}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setShowVoucherModal(true); fetchSavedVouchers(); }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-orange-300 text-petshop-orange font-medium rounded-xl text-sm hover:bg-orange-50 transition-colors"
                        >
                          <FiGift size={16} />
                          Chọn voucher từ ví của bạn
                        </button>
                      </div>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-petshop-orange">{formatPrice(Math.max(getTotalPrice() - discount, 0))}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading 
                    ? (formData.paymentMethod === 'MOMO' ? 'Đang thanh toán MoMo...' : 'Đang xử lý...') 
                    : (formData.paymentMethod === 'MOMO' ? 'Thanh toán MoMo' : 'Đặt hàng')}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  {formData.paymentMethod === 'MOMO' 
                    ? 'Đơn hàng sẽ được thanh toán qua ví MoMo sau khi đặt hàng.'
                    : 'Hệ thống hiện hỗ trợ thanh toán khi nhận hàng (COD).'}
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>

      {/* Voucher Wallet Modal */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowVoucherModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center gap-2">
                  <FiGift className="text-petshop-orange text-xl" />
                  <h3 className="text-lg font-bold text-gray-800">Ví voucher của bạn</h3>
                </div>
                <button onClick={() => setShowVoucherModal(false)} className="p-2 hover:bg-white/60 rounded-lg transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-4">
                {savedVouchersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-petshop-orange border-t-transparent"></div>
                  </div>
                ) : savedVouchers.length === 0 ? (
                  <div className="text-center py-12">
                    <FiTag className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Chưa có voucher nào trong ví</p>
                    <p className="text-gray-400 text-sm mt-1">Hãy lưu voucher từ trang ưu đãi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedVouchers.map(voucher => {
                      const isExpired = voucher.endDate && new Date(voucher.endDate) < new Date();
                      const meetsMinOrder = !voucher.minOrderAmount || getTotalPrice() >= voucher.minOrderAmount;
                      const canUse = !isExpired && meetsMinOrder;
                      
                      return (
                        <div
                          key={voucher.id}
                          className={`relative border-2 rounded-xl overflow-hidden transition-all ${
                            canUse 
                              ? 'border-orange-200 hover:border-petshop-orange hover:shadow-md cursor-pointer' 
                              : 'border-gray-200 opacity-60'
                          }`}
                          onClick={() => canUse && handleSelectFromWallet(voucher)}
                        >
                          <div className="flex">
                            {/* Left color strip */}
                            <div className={`w-2 ${canUse ? 'bg-gradient-to-b from-petshop-orange to-amber-400' : 'bg-gray-300'}`} />
                            
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-bold text-base text-gray-800">{voucher.code}</span>
                                    {voucher.voucherCategory && voucher.voucherCategory !== 'GENERAL' && (
                                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                        voucher.voucherCategory === 'WELCOME' ? 'bg-blue-100 text-blue-700' :
                                        voucher.voucherCategory === 'LOYALTY' ? 'bg-pink-100 text-pink-700' :
                                        voucher.voucherCategory === 'RECURRING' ? 'bg-teal-100 text-teal-700' :
                                        voucher.voucherCategory === 'SERVICE' ? 'bg-violet-100 text-violet-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {voucher.voucherCategory === 'WELCOME' ? '🎉 Chào mừng' :
                                         voucher.voucherCategory === 'LOYALTY' ? '🎂 Sinh nhật' :
                                         voucher.voucherCategory === 'RECURRING' ? '🔄 Mua lại' :
                                         voucher.voucherCategory === 'SERVICE' ? '💆 Dịch vụ' : voucher.voucherCategory}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    {voucher.discountType === 'PERCENTAGE' ? (
                                      <span className="flex items-center gap-1"><FiPercent size={12} /> Giảm {voucher.discountValue}%</span>
                                    ) : (
                                      <span className="flex items-center gap-1"><FiDollarSign size={12} /> Giảm {formatPrice(voucher.discountValue)}</span>
                                    )}
                                    {voucher.minOrderAmount > 0 && (
                                      <span>Đơn tối thiểu {formatPrice(voucher.minOrderAmount)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                  {canUse ? (
                                    <span className="inline-block px-3 py-1.5 bg-petshop-orange text-white text-xs font-bold rounded-lg">
                                      ÁP DỤNG
                                    </span>
                                  ) : isExpired ? (
                                    <span className="text-xs text-red-500 font-medium">Hết hạn</span>
                                  ) : (
                                    <span className="text-xs text-gray-400">Đơn chưa đủ</span>
                                  )}
                                </div>
                              </div>
                              {voucher.endDate && (
                                <p className="text-xs text-gray-400 mt-2">
                                  HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
