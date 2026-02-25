import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const CartPage = () => {
  const navigate = useNavigate();
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

  const [quantityDraft, setQuantityDraft] = useState({});

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
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-petshop-orange">{formatPrice(getTotalPrice())}</span>
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
