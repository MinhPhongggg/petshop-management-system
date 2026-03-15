import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiClock, FiPercent, FiDollarSign, FiBookmark, FiShoppingCart, FiSearch, FiX, FiCheck, FiGift } from 'react-icons/fi';
import { vouchersApi } from '../../services/api';
import toast from 'react-hot-toast';

const MyVouchersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'saved'
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, savedRes] = await Promise.all([
        vouchersApi.getActive(),
        vouchersApi.getMySaved(),
      ]);
      setActiveVouchers(activeRes.data || []);
      setSavedVouchers(savedRes.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (voucherId) => {
    try {
      await vouchersApi.saveVoucher(voucherId);
      toast.success('Đã lưu voucher vào ví!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu voucher');
    }
  };

  const handleUnsave = async (voucherId) => {
    try {
      await vouchersApi.unsaveVoucher(voucherId);
      toast.success('Đã xóa voucher khỏi ví');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa voucher');
    }
  };

  const handleUseNow = (code) => {
    navigate('/cart', { state: { voucherCode: code } });
    toast.success(`Mã ${code} đã sẵn sàng áp dụng!`);
  };

  const formatPrice = (price) => {
    if (!price) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getCategoryBadge = (category) => {
    const map = {
      WELCOME: { label: '🎉 Chào mừng', color: 'bg-blue-100 text-blue-700' },
      SERVICE: { label: '💆 Dịch vụ', color: 'bg-violet-100 text-violet-700' },
      LOYALTY: { label: '🎂 Sinh nhật', color: 'bg-pink-100 text-pink-700' },
      RECURRING: { label: '🔄 Mua lại', color: 'bg-teal-100 text-teal-700' },
    };
    return map[category] || null;
  };

  const savedIds = new Set(savedVouchers.map(v => v.id));

  const filteredVouchers = (activeTab === 'available' ? activeVouchers : savedVouchers)
    .filter(v => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return v.code?.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q);
    });

  const VoucherCard = ({ voucher, isSaved }) => {
    const daysLeft = getDaysLeft(voucher.endDate);
    const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="flex">
          {/* Left: discount badge */}
          <div className={`w-28 flex-shrink-0 flex flex-col items-center justify-center p-4 ${
            voucher.discountType === 'PERCENTAGE'
              ? 'bg-gradient-to-br from-orange-500 to-amber-500'
              : 'bg-gradient-to-br from-emerald-500 to-teal-500'
          } text-white relative`}>
            {/* Decorative circles */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
            
            {voucher.discountType === 'PERCENTAGE' ? (
              <>
                <FiPercent className="text-2xl mb-1" />
                <span className="text-2xl font-bold">{voucher.discountValue}%</span>
                <span className="text-xs opacity-80 text-center">Giảm</span>
              </>
            ) : (
              <>
                <FiDollarSign className="text-2xl mb-1" />
                <span className="text-lg font-bold">{formatPrice(voucher.discountValue)}</span>
                <span className="text-xs opacity-80 text-center">Giảm</span>
              </>
            )}
          </div>

          {/* Right: info */}
          <div className="flex-1 p-4 pl-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-bold text-lg text-gray-800 tracking-wider">{voucher.code}</span>
                  {isExpiringSoon && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      Còn {daysLeft} ngày
                    </span>
                  )}
                  {voucher.voucherCategory && getCategoryBadge(voucher.voucherCategory) && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadge(voucher.voucherCategory).color}`}>
                      {getCategoryBadge(voucher.voucherCategory).label}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{voucher.description || 'Mã giảm giá'}</p>
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {voucher.minOrderAmount > 0 && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      <FiShoppingCart size={12} />
                      Đơn tối thiểu {formatPrice(voucher.minOrderAmount)}
                    </span>
                  )}
                  {voucher.maxDiscount && voucher.discountType === 'PERCENTAGE' && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      Giảm tối đa {formatPrice(voucher.maxDiscount)}
                    </span>
                  )}
                  {voucher.endDate && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      <FiClock size={12} />
                      HSD: {formatDate(voucher.endDate)}
                    </span>
                  )}
                  {voucher.remainingUsage !== null && voucher.remainingUsage !== undefined && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      Còn {voucher.remainingUsage} lượt
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              {isSaved ? (
                <>
                  <button
                    onClick={() => handleUseNow(voucher.code)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-petshop-orange text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    <FiShoppingCart size={14} />
                    Dùng ngay
                  </button>
                  <button
                    onClick={() => handleUnsave(voucher.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <FiX size={14} />
                    Bỏ lưu
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSave(voucher.id)}
                    disabled={savedIds.has(voucher.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      savedIds.has(voucher.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {savedIds.has(voucher.id) ? (
                      <><FiCheck size={14} /> Đã lưu</>
                    ) : (
                      <><FiBookmark size={14} /> Lưu</>
                    )}
                  </button>
                  <button
                    onClick={() => handleUseNow(voucher.code)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-petshop-orange text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    <FiShoppingCart size={14} />
                    Dùng ngay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <FiGift className="text-amber-600 text-xl" />
          </div>
          Ví Voucher
        </h1>
        <p className="text-gray-500 mt-1">Lưu và quản lý mã giảm giá của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'available'
              ? 'bg-white text-petshop-orange shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiTag className="inline mr-2" />
          Voucher khả dụng ({activeVouchers.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'saved'
              ? 'bg-white text-petshop-orange shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiBookmark className="inline mr-2" />
          Đã lưu ({savedVouchers.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm voucher theo mã hoặc mô tả..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petshop-orange/30 focus:border-petshop-orange"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-petshop-orange" />
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <div className="text-5xl mb-4">🎟️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {activeTab === 'saved' ? 'Chưa có voucher nào được lưu' : 'Không có voucher khả dụng'}
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === 'saved'
              ? 'Hãy khám phá tab "Voucher khả dụng" để lưu mã giảm giá yêu thích!'
              : 'Hiện tại chưa có chương trình khuyến mãi nào.'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredVouchers.map(voucher => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                isSaved={activeTab === 'saved' || savedIds.has(voucher.id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default MyVouchersPage;
