import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGift, FiCopy, FiCheck, FiShoppingBag, FiTrendingUp, FiAward, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { rewardsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

const MyRewardsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchProgress = async () => {
    try {
      const res = await rewardsApi.getMyProgress();
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val) => {
    if (!val && val !== 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Đã sao chép mã: ' + code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <FiGift className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chương trình tích điểm</h2>
        <p className="text-gray-500 mb-6">Đăng nhập để xem tiến trình tích điểm của bạn</p>
        <Link to="/login" className="btn-primary px-8 py-3">Đăng nhập</Link>
      </div>
    );
  }

  if (!progress) return null;

  const tierColors = {
    BRONZE: { bg: 'from-amber-700 to-amber-500', light: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    SILVER: { bg: 'from-gray-400 to-gray-300', light: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
    GOLD: { bg: 'from-yellow-500 to-yellow-300', light: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
    PLATINUM: { bg: 'from-indigo-400 to-purple-300', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    DIAMOND: { bg: 'from-cyan-400 to-blue-300', light: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
  };

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-8 text-white bg-gradient-to-r ${
          progress.currentTier ? tierColors[progress.currentTier.name]?.bg || 'from-gray-600 to-gray-400' : 'from-gray-600 to-gray-400'
        } shadow-xl`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{progress.currentTier?.icon || '⭐'}</span>
              <div>
                <p className="text-sm opacity-80">Hạng thành viên</p>
                <h1 className="text-3xl font-black">
                  {progress.currentTier?.displayName || 'Chưa có hạng'}
                </h1>
              </div>
            </div>
            <p className="text-white/80">Xin chào, {progress.userName}! Mua sắm thêm để mở khóa voucher lớn hơn.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
              <FiShoppingBag className="text-2xl mx-auto mb-1" />
              <p className="text-2xl font-bold">{progress.completedOrders || 0}</p>
              <p className="text-xs opacity-80">Đơn hoàn thành</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
              <FiTrendingUp className="text-2xl mx-auto mb-1" />
              <p className="text-2xl font-bold">{formatPrice(progress.totalSpending)}</p>
              <p className="text-xs opacity-80">Tổng chi tiêu</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progress.nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-80">
                {progress.currentTier ? `${progress.currentTier.icon} ${progress.currentTier.displayName}` : '🌟 Bắt đầu'}
              </span>
              <span className="font-bold">{progress.nextTier.icon} {progress.nextTier.displayName}</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.progressPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-white rounded-full relative"
              >
                <span className="absolute right-2 top-0 text-[10px] font-bold text-gray-700 leading-4">
                  {progress.progressPercent}%
                </span>
              </motion.div>
            </div>
            <p className="text-sm mt-2 opacity-80">
              Còn <span className="font-bold text-white">{formatPrice(progress.amountToNextTier)}</span> nữa để đạt hạng {progress.nextTier.displayName}
            </p>
          </div>
        )}
        {!progress.nextTier && progress.currentTier && (
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-lg font-bold">🎉 Bạn đã đạt hạng cao nhất!</p>
          </div>
        )}
      </motion.div>

      {/* Tier Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FiAward className="text-petshop-orange" />
          Bậc thang thưởng
        </h2>

        <div className="space-y-4">
          {progress.allTiers?.map((tier, index) => {
            const colors = tierColors[tier.name] || { light: 'bg-gray-50 border-gray-200', text: 'text-gray-600' };
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className={`border-2 rounded-2xl p-5 transition-all ${
                  tier.unlocked 
                    ? `${colors.light} shadow-md` 
                    : 'border-gray-100 bg-gray-50/50 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{tier.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${tier.unlocked ? colors.text : 'text-gray-400'}`}>
                          {tier.displayName}
                        </h3>
                        {tier.unlocked && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            ✓ Đã mở
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Chi tiêu từ {formatPrice(tier.minSpending)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-2xl font-black ${tier.unlocked ? colors.text : 'text-gray-300'}`}>
                        {tier.discountPercent}%
                      </p>
                      <p className="text-xs text-gray-400">Tối đa {formatPrice(tier.maxDiscount)}</p>
                    </div>

                    {tier.unlocked && tier.voucherCode && (
                      <button
                        onClick={() => handleCopy(tier.voucherCode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          tier.voucherUsed
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : copiedCode === tier.voucherCode
                              ? 'bg-green-100 text-green-700'
                              : 'bg-petshop-orange/10 text-petshop-orange hover:bg-petshop-orange/20'
                        }`}
                        disabled={tier.voucherUsed}
                      >
                        {tier.voucherUsed ? (
                          <>Đã dùng</>
                        ) : copiedCode === tier.voucherCode ? (
                          <><FiCheck /> Đã sao chép</>
                        ) : (
                          <><FiCopy /> {tier.voucherCode}</>
                        )}
                      </button>
                    )}

                    {!tier.unlocked && (
                      <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
                        🔒 Chưa mở
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress inside tier (for next tier only) */}
                {!tier.unlocked && progress.nextTier?.id === tier.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-petshop-orange to-petshop-yellow rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Còn {formatPrice(progress.amountToNextTier)} để mở khóa
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Earned Vouchers */}
      {progress.earnedVouchers && progress.earnedVouchers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiGift className="text-petshop-orange" />
            Voucher đã nhận ({progress.earnedVouchers.length})
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {progress.earnedVouchers.map((v, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * idx }}
                className={`relative rounded-2xl overflow-hidden ${
                  v.used ? 'opacity-60' : ''
                }`}
              >
                {/* Ticket shape */}
                <div className={`flex ${v.used ? 'bg-gray-100' : 'bg-gradient-to-r from-petshop-orange to-orange-400'}`}>
                  {/* Left part */}
                  <div className={`flex-1 p-5 ${v.used ? 'text-gray-500' : 'text-white'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{v.tierIcon}</span>
                      <span className="text-xs font-medium opacity-80">{v.tierDisplayName}</span>
                    </div>
                    <p className="text-3xl font-black">{v.discountPercent}%</p>
                    <p className="text-xs opacity-80 mt-1">Tối đa {formatPrice(v.maxDiscount)}</p>
                  </div>

                  {/* Divider with circles */}
                  <div className="relative w-8 flex items-center justify-center">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${v.used ? 'bg-white' : 'bg-gray-50'}`}></div>
                    <div className={`border-l-2 border-dashed h-full ${v.used ? 'border-gray-300' : 'border-white/40'}`}></div>
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full ${v.used ? 'bg-white' : 'bg-gray-50'}`}></div>
                  </div>

                  {/* Right part - Code */}
                  <div className={`flex flex-col items-center justify-center px-5 py-4 min-w-[120px] ${
                    v.used ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <p className="text-xs text-gray-400 mb-1">MÃ VOUCHER</p>
                    <p className={`font-mono font-bold text-sm ${v.used ? 'text-gray-400 line-through' : 'text-petshop-orange'}`}>
                      {v.voucherCode}
                    </p>
                    {v.used ? (
                      <span className="text-xs text-gray-400 mt-2">Đã sử dụng</span>
                    ) : (
                      <button
                        onClick={() => handleCopy(v.voucherCode)}
                        className="mt-2 flex items-center gap-1 text-xs text-petshop-orange hover:text-orange-600 font-bold"
                      >
                        {copiedCode === v.voucherCode ? <><FiCheck /> Copied</> : <><FiCopy /> Sao chép</>}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-petshop-orange/5 to-petshop-yellow/5 rounded-2xl p-8 text-center border border-petshop-orange/10"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">🛍️ Mua sắm ngay để tích điểm!</h3>
        <p className="text-gray-500 mb-6">Mỗi đơn hàng hoàn thành sẽ được cộng vào tổng chi tiêu. Mua càng nhiều, voucher càng lớn!</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-petshop-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          Khám phá sản phẩm <FiChevronRight />
        </Link>
      </motion.div>
    </div>
  );
};

export default MyRewardsPage;
