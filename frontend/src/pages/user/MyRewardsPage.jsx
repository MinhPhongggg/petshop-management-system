import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGift, FiCopy, FiCheck, FiShoppingBag, FiTrendingUp, FiAward, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { rewardsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const REDEEM_OPTIONS = [100, 200, 500, 1000];
const POINT_TO_VND = 100;

const MyRewardsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview');
  const [points, setPoints] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState(REDEEM_OPTIONS[0]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pointsRes, progressRes] = await Promise.all([
        rewardsApi.getMyPoints(),
        rewardsApi.getMyProgress(),
      ]);
      const currentPoints = pointsRes?.data?.availablePoints ?? 0;
      setPoints(currentPoints);

      const redeemedFromServer = (progressRes?.data?.earnedVouchers || [])
        .filter((v) => (v.voucherCode || '').startsWith('POINT-'))
        .map((v) => {
          const pointUsed = Math.max(1, Math.round((Number(v.maxDiscount || 0) / POINT_TO_VND)));
          return {
            time: v.unlockedAt || new Date().toISOString(),
            points: pointUsed,
            code: v.voucherCode,
            value: pointUsed * POINT_TO_VND,
            status: 'SUCCESS',
          };
        });

      const localHistory = JSON.parse(localStorage.getItem('rewardRedeemHistory') || '[]');
      const merged = [...localHistory, ...redeemedFromServer]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 20);
      setHistory(merged);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không tải được dữ liệu tích điểm');
    } finally {
      setLoading(false);
    }
  };

  const formattedValue = (value) =>
    new Intl.NumberFormat('vi-VN').format(value || 0);

  const selectedVoucherValue = useMemo(
    () => selectedPoints * POINT_TO_VND,
    [selectedPoints]
  );

  const openOtpModal = async () => {
    if (points < selectedPoints) {
      toast.error('Điểm hiện có không đủ để đổi mức này');
      return;
    }
    try {
      const res = await rewardsApi.requestRedeemCode(selectedPoints);
      const debugCode = res?.data?.debugCode;
      if (debugCode) {
        toast.success(`OTP test: ${debugCode}`);
      } else {
        toast.success('Đã gửi OTP Microsoft Authenticator');
      }
      setOtpCode('');
      setShowOtpModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi OTP');
    }
  };

  const confirmRedeem = async () => {
    if (!otpCode.trim()) {
      toast.error('Vui lòng nhập mã OTP 6 số');
      return;
    }
    try {
      setSubmitting(true);
      const res = await rewardsApi.confirmRedeemPoints(selectedPoints, otpCode.trim());
      const newItem = {
        time: new Date().toISOString(),
        points: selectedPoints,
        code: res?.data?.code || '-',
        value: selectedVoucherValue,
        status: 'SUCCESS',
      };

      const nextPoints = Math.max(0, points - selectedPoints);
      setPoints(nextPoints);
      const updatedHistory = [newItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('rewardRedeemHistory', JSON.stringify(updatedHistory));

      setShowOtpModal(false);
      setViewMode('overview');
      setOtpCode('');
      toast.success(`Đổi điểm thành công: ${newItem.code}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xác thực OTP thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Điểm tích lũy</h2>
        <p className="text-gray-500 mb-6">Đăng nhập để xem và đổi điểm</p>
        <Link to="/login" className="btn-primary px-8 py-3">Đăng nhập</Link>
      </div>
    );
  }

  if (viewMode === 'redeem') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-5 md:p-6">
        <div className="text-center mb-5">
          <FiGift className="mx-auto text-3xl text-emerald-600 mb-2" />
          <h1 className="text-[32px] font-bold text-gray-800 leading-[1.2] mb-3 tracking-normal">Đổi điểm lấy voucher</h1>
          <div className="rounded-2xl py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <p className="text-sm opacity-90">Điểm hiện có</p>
            <p className="text-5xl md:text-6xl font-black tracking-wide">{points}</p>
          </div>
        </div>

        <h2 className="text-[32px] font-bold text-gray-800 mb-4 leading-[1.2] tracking-normal">🎁 Bước 1: Chọn mức đổi điểm</h2>
        <div className="space-y-3">
          {REDEEM_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 cursor-pointer transition ${
                selectedPoints === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name="redeemOption"
                checked={selectedPoints === option}
                onChange={() => setSelectedPoints(option)}
              />
              <span className="text-2xl font-extrabold text-gray-900">{option} điểm</span>
              <span className="text-2xl text-emerald-700">→ Voucher {formattedValue(option * POINT_TO_VND)}đ</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={openOtpModal}
          className="w-full mt-6 bg-emerald-600 text-white rounded-2xl py-3.5 text-3xl font-black hover:bg-emerald-700 transition"
        >
          🎁 Đổi Voucher
        </button>

        <button
          type="button"
          onClick={() => setViewMode('overview')}
          className="mt-5 mx-auto flex items-center gap-2 text-gray-600 text-2xl"
        >
          <FiArrowLeft />
          Quay lại trang điểm tích lũy
        </button>

        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6">
              <FiShield className="mx-auto text-4xl text-indigo-500 mb-2" />
              <h3 className="text-center text-3xl font-black text-gray-800 mb-2">Xác thực OTP</h3>
              <p className="text-center text-gray-600 text-base mb-4">
                Để bảo mật, vui lòng nhập mã 6 số từ <span className="font-bold">Microsoft Authenticator</span>
              </p>

              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-center text-base mb-3">
                Đổi <span className="font-extrabold">{selectedPoints} điểm</span> → Voucher{' '}
                <span className="font-extrabold">{formattedValue(selectedVoucherValue)}đ</span>
              </div>

              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Nhập mã OTP 6 số"
                maxLength={6}
                className="w-full rounded-2xl border-2 border-indigo-400 px-4 py-3 text-2xl tracking-[0.3em] text-center outline-none"
              />

              <button
                type="button"
                onClick={confirmRedeem}
                disabled={submitting}
                className="w-full mt-3 bg-indigo-500 text-white rounded-2xl py-3 text-lg font-bold hover:bg-indigo-600 disabled:opacity-60"
              >
                {submitting ? 'Đang xác nhận...' : '☑ Xác nhận đổi điểm'}
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-full mt-2.5 border border-gray-300 text-gray-700 rounded-2xl py-3 text-lg font-semibold"
              >
                Hủy
              </button>
              <p className="mt-4 text-center text-gray-500 text-sm">
                ⓘ Mã OTP thay đổi mỗi 30 giây. Đảm bảo chính chủ mới có quyền đổi điểm.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 leading-[1.1] tracking-normal">✨ Điểm tích lũy</h1>
        <Link to="/" className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
          ← Về trang chủ
        </Link>
      </div>

      <div className="rounded-3xl p-6 md:p-7 text-white bg-gradient-to-r from-indigo-500 to-purple-600 text-center">
        <p className="text-base opacity-90 mb-1">Số điểm hiện tại</p>
        <p className="text-5xl font-black">{points}</p>
        <p className="text-lg mt-1 opacity-95">Tương đương {formattedValue(points * POINT_TO_VND)}đ voucher</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setViewMode('redeem')}
          className="bg-white rounded-2xl p-5 text-center border hover:shadow-sm"
        >
          <FiGift className="mx-auto text-3xl text-emerald-600 mb-2" />
          <p className="font-bold text-lg text-gray-800">Đổi voucher</p>
          <p className="text-sm text-gray-500">Đổi điểm lấy mã giảm giá</p>
        </button>
        <div className="bg-white rounded-2xl p-5 text-center border">
          <FiShield className="mx-auto text-3xl text-indigo-500 mb-2" />
          <p className="font-bold text-lg text-gray-800">Cài đặt OTP</p>
          <p className="text-sm text-gray-500">Đã kích hoạt ✓</p>
        </div>
        <Link to="/products" className="bg-white rounded-2xl p-5 text-center border hover:shadow-sm">
          <FiShoppingCart className="mx-auto text-3xl text-amber-500 mb-2" />
          <p className="font-bold text-lg text-gray-800">Mua sắm</p>
          <p className="text-sm text-gray-500">Tích thêm điểm</p>
        </Link>
      </div>

      <div className="bg-cyan-100 border border-cyan-200 rounded-2xl p-4 text-cyan-900">
        <p className="text-sm md:text-base">
          <FiInfo className="inline mr-1" />
          <span className="font-bold">Quy đổi:</span> Mỗi 10.000đ mua hàng = 1 điểm tích lũy. Đổi 100 điểm = voucher
          10.000đ. Cần xác thực OTP qua Microsoft Authenticator để đổi điểm.
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2 text-gray-800">
          <FiClock />
          <span className="font-bold text-xl">Lịch sử đổi điểm</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700">
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Điểm đã đổi</th>
                <th className="px-5 py-3">Mã voucher</th>
                <th className="px-5 py-3">Giá trị</th>
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Chưa có giao dịch đổi điểm
                  </td>
                </tr>
              )}
              {history.map((item, index) => (
                <tr key={`${item.code}-${index}`} className="border-t">
                  <td className="px-5 py-3">{new Date(item.time).toLocaleString('vi-VN')}</td>
                  <td className="px-5 py-3 text-red-500">-{item.points}</td>
                  <td className="px-5 py-3 text-purple-700 font-medium">{item.code}</td>
                  <td className="px-5 py-3">{formattedValue(item.value)}đ</td>
                  <td className="px-5 py-3">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                      {item.status || 'SUCCESS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
        <FiLock />
        Giao dịch đổi điểm được bảo vệ bởi OTP
      </div>
    </div>
  );
};

export default MyRewardsPage;
