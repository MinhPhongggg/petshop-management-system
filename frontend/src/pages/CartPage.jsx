import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiTag, FiX, FiBookmark, FiPercent, FiDollarSign } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { vouchersApi } from '../services/api';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    isLoading,
    fetchCart,
    updateQuantity,
    updateQuantityLocal,
    removeItem,
    removeItemLocal,
    clearCart,
    clearCartLocal,
    getTotalPrice,
    getItemCount,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  const [quantityDraft, setQuantityDraft] = useState({});

  // Auto-apply voucher from navigation state (from MyVouchersPage "Dùng ngay")
  useEffect(() => {
    if (location.state?.voucherCode && items.length > 0) {
      setVoucherCode(location.state.voucherCode);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, items.length]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    // Keep draft quantities in sync with cart
    const draft = {};
    for (const item of items) {
      draft[item.id] = item.quantity;
    }
    setQuantityDraft(draft);
  }, [items]);

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

  const handleOpenWallet = async () => {
    setShowWallet(true);
    setWalletLoading(true);
    try {
      const res = await vouchersApi.getMySaved();
      setSavedVouchers(res.data || []);
    } catch {
      toast.error('Không thể tải ví voucher');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSelectFromWallet = (code) => {
    setVoucherCode(code);
    setShowWallet(false);
    setTimeout(async () => {
      setVoucherLoading(true);
      try {
        const res = await vouchersApi.apply(code, getTotalPrice());
        const discountAmount = res.data.discount;
        if (discountAmount > 0) {
          setDiscount(discountAmount);
          try {
            const vInfo = await vouchersApi.getByCode(code);
            setAppliedVoucher(vInfo.data);
          } catch { setAppliedVoucher({ code }); }
          toast.success(`Áp dụng mã ${code} thành công! Giảm ${formatPrice(discountAmount)}`);
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

  const getItemInfo = (item) => {
    const slug = item.productSlug || item.product?.slug;
    const name = item.productName || item.product?.name;
    const image =
      item.productImage ||
      item.product?.images?.[0]?.url ||
      'https://via.placeholder.com/120';

    const variantName = item.variantName || item.variant?.name;
    const unitPrice =
      item.currentPrice ||
      item.price ||
      item.variant?.price ||
      item.product?.salePrice ||
      item.product?.basePrice ||
      0;
    const lineTotal = (item.subtotal ?? unitPrice * item.quantity) || 0;
    return { slug, name, image, variantName, unitPrice, lineTotal };
  };

  const handleUpdateQuantity = async (itemId, nextQuantity) => {
    const safeQuantity = Number.isFinite(nextQuantity) ? Math.floor(nextQuantity) : 1;
    if (safeQuantity < 1) return;
    if (isAuthenticated) {
      await updateQuantity(itemId, safeQuantity);
      await fetchCart();
    } else {
      updateQuantityLocal(itemId, safeQuantity);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (isAuthenticated) {
      await removeItem(itemId);
      await fetchCart();
    } else {
      removeItemLocal(itemId);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) return;
    if (isAuthenticated) {
      await clearCart();
      await fetchCart();
    } else {
      clearCartLocal();
    }
  };

  if (isAuthenticated && isLoading) {
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
              (() => {
                const info = getItemInfo(item);
                const productLink = info.slug ? `/products/${info.slug}` : '/products';
                return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <Link to={productLink} className="flex-shrink-0">
                    <img
                      src={info.image}
                      alt={info.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={productLink}
                      className="font-semibold text-gray-800 hover:text-petshop-orange transition-colors line-clamp-2"
                    >
                      {info.name}
                    </Link>
                    
                    {info.variantName && (
                      <p className="text-sm text-gray-500 mt-1">
                        Phân loại: {info.variantName}
                      </p>
                    )}

                    <div className="mt-2">
                      <span className="text-lg font-bold text-petshop-orange">
                        {formatPrice(info.unitPrice)}
                      </span>
                    </div>

                    {/* Mobile: Quantity & Remove */}
                    <div className="flex items-center justify-between mt-4 md:hidden">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={quantityDraft[item.id] ?? item.quantity}
                          onChange={(e) => {
                            const v = e.target.value;
                            const next = v === '' ? '' : Number(v);
                            setQuantityDraft((prev) => ({ ...prev, [item.id]: next }));
                            if (next !== '' && Number.isFinite(next) && next >= 1) {
                              handleUpdateQuantity(item.id, next);
                            }
                          }}
                          onBlur={() => {
                            const draft = quantityDraft[item.id];
                            const next = draft === '' ? item.quantity : Number(draft);
                            handleUpdateQuantity(item.id, next);
                          }}
                          className="w-16 text-center font-medium outline-none"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
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
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantityDraft[item.id] ?? item.quantity}
                        onChange={(e) => {
                          const v = e.target.value;
                          const next = v === '' ? '' : Number(v);
                          setQuantityDraft((prev) => ({ ...prev, [item.id]: next }));
                          if (next !== '' && Number.isFinite(next) && next >= 1) {
                            handleUpdateQuantity(item.id, next);
                          }
                        }}
                        onBlur={() => {
                          const draft = quantityDraft[item.id];
                          const next = draft === '' ? item.quantity : Number(draft);
                          handleUpdateQuantity(item.id, next);
                        }}
                        className="w-16 text-center font-medium outline-none"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <p className="text-lg font-bold text-petshop-orange">
                        {formatPrice(info.lineTotal)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
                );
              })()
            ))}

            {/* Clear Cart */}
            <button
              onClick={handleClearCart}
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
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-petshop-orange">{formatPrice(Math.max(getTotalPrice() - discount, 0))}</span>
                </div>
              </div>

              {/* Voucher */}
              <div className="mb-6">
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
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                        placeholder="Nhập mã giảm giá"
                        className="input-field flex-1 font-mono uppercase tracking-wider"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherCode.trim()}
                        className="btn-outline px-4 disabled:opacity-50"
                      >
                        {voucherLoading ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                    {isAuthenticated && (
                      <button
                        onClick={handleOpenWallet}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        <FiBookmark size={14} />
                        Chọn từ ví voucher
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Voucher Wallet Modal */}
              <AnimatePresence>
                {showWallet && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowWallet(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
                    >
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <FiBookmark className="text-amber-600" /> Ví Voucher
                        </h3>
                        <button onClick={() => setShowWallet(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <FiX size={18} />
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-[55vh] p-4 space-y-3">
                        {walletLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-petshop-orange" />
                          </div>
                        ) : savedVouchers.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-3xl mb-2">🎟️</div>
                            <p className="text-sm">Chưa có voucher nào trong ví</p>
                            <Link to="/my-vouchers" className="text-petshop-orange text-sm mt-2 inline-block hover:underline">
                              Khám phá voucher
                            </Link>
                          </div>
                        ) : (
                          savedVouchers.filter(v => v.isValid).map(v => (
                            <button
                              key={v.id}
                              onClick={() => handleSelectFromWallet(v.code)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-petshop-orange hover:bg-orange-50 transition-all text-left"
                            >
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                v.discountType === 'PERCENTAGE'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {v.discountType === 'PERCENTAGE' ? <FiPercent size={20} /> : <FiDollarSign size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-mono font-bold text-sm tracking-wider">{v.code}</p>
                                <p className="text-xs text-gray-500 truncate">{v.description || 'Mã giảm giá'}</p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                  {v.discountType === 'PERCENTAGE'
                                    ? `Giảm ${v.discountValue}%`
                                    : `Giảm ${formatPrice(v.discountValue)}`
                                  }
                                  {v.minOrderAmount > 0 && ` · Đơn từ ${formatPrice(v.minOrderAmount)}`}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

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
