import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentsApi, bookingsApi } from '../services/api';

const MOMO_LOGO = 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png';

const MoMoBookingDepositPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const momoWindowRef = useRef(null);

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [deposit, setDeposit] = useState(location.state?.deposit || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [status, setStatus] = useState('pending'); // pending | processing | success | failed
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('loading'); // loading → gateway → success

  // Fetch booking data if page refreshed
  useEffect(() => {
    if (booking && deposit) {
      setLoading(false);
      setStep(deposit.payUrl ? 'gateway' : 'gateway');
      return;
    }
    const fetchData = async () => {
      try {
        const res = await bookingsApi.getById(bookingId);
        const bk = res.data;
        setBooking(bk);
        if (bk.depositStatus === 'PAID') {
          setStatus('success');
          setStep('success');
          setResult({ bookingCode: bk.bookingCode, depositAmount: bk.depositAmount });
        } else if (bk.depositStatus === 'EXPIRED' || bk.status === 'CANCELLED') {
          setStatus('failed');
        } else {
          // Deposit not yet created or need a new payUrl - create now
          try {
            const depositRes = await paymentsApi.createBookingDeposit(bookingId);
            setDeposit(depositRes.data);
            setStep('gateway');
          } catch {
            setStatus('failed');
          }
        }
      } catch {
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId, booking, deposit]);

  // Open MoMo gateway + auto-confirm
  const openGatewayAndConfirm = useCallback(async () => {
    if (status !== 'pending' || !deposit) return;
    setStatus('processing');

    const payUrl = deposit.payUrl;

    // Open real MoMo gateway in popup
    if (payUrl) {
      momoWindowRef.current = window.open(
        payUrl,
        'momoGateway',
        'width=900,height=700,scrollbars=yes,resizable=yes'
      );
    }

    try {
      // Wait 3s (user sees real MoMo gateway) + confirm in parallel
      const [, confirmRes] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 3000)),
        paymentsApi.confirmMockDeposit(bookingId),
      ]);

      // Close MoMo popup
      if (momoWindowRef.current && !momoWindowRef.current.closed) {
        momoWindowRef.current.close();
      }

      setResult(confirmRes.data);
      setStatus('success');
      setStep('success');
      toast.success('Đặt cọc thành công!');
    } catch (error) {
      if (momoWindowRef.current && !momoWindowRef.current.closed) {
        momoWindowRef.current.close();
      }
      setStatus('failed');
      toast.error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  }, [bookingId, deposit, status]);

  // Auto-open gateway when deposit data is ready
  useEffect(() => {
    if (step === 'gateway' && status === 'pending' && deposit && !loading) {
      openGatewayAndConfirm();
    }
  }, [step, status, deposit, loading, openGatewayAndConfirm]);

  // Auto redirect 5s after success
  useEffect(() => {
    if (step !== 'success') return;
    const timer = setTimeout(() => navigate('/my-bookings'), 5000);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  // Cleanup popup on unmount
  useEffect(() => {
    return () => {
      if (momoWindowRef.current && !momoWindowRef.current.closed) {
        momoWindowRef.current.close();
      }
    };
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

  // ===== LOADING =====
  if (loading || step === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang kết nối cổng thanh toán MoMo...</p>
        </div>
      </div>
    );
  }

  // ===== NO DATA =====
  if (!booking || (!deposit && status !== 'success')) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
          <FiAlertCircle className="w-12 h-12 text-pink-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin</h2>
          <p className="text-gray-500 mb-6 text-sm">Phiên thanh toán đã hết hạn.</p>
          <button onClick={() => navigate('/booking')}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl">
            Đặt lịch mới
          </button>
        </motion.div>
      </div>
    );
  }

  // ===== FAILED =====
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
            <img src={MOMO_LOGO} alt="MoMo" className="h-9 w-9 rounded-lg" />
            <span className="text-gray-700 font-medium">Cổng thanh toán MoMo</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-16 px-4">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-500 mb-6 text-sm">Có lỗi xảy ra khi thanh toán.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/booking')}
                className="px-6 py-2.5 border-2 border-pink-500 text-pink-500 font-semibold rounded-full hover:bg-pink-50">
                Đặt lại
              </button>
              <button onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600">
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== SUCCESS =====
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
            <img src={MOMO_LOGO} alt="MoMo" className="h-9 w-9 rounded-lg" />
            <span className="text-gray-700 font-medium">Cổng thanh toán MoMo</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-16 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thanh toán thành công</h2>
            <div className="border-2 border-dashed border-pink-300 rounded-xl py-4 px-8 inline-block mb-6">
              <p className="text-gray-400 text-sm mb-1">MoMo Payment</p>
              <p className="text-3xl font-bold text-gray-800">{formatPrice(result?.depositAmount || deposit?.depositAmount)}đ</p>
            </div>
            <div className="mb-6"><span className="text-3xl">🎉</span></div>
            <p className="text-gray-500 text-sm mb-4">MoMo sẽ tự động đưa bạn về lại trang của Nhà cung cấp</p>
            <button onClick={() => navigate('/my-bookings')} className="text-pink-500 font-medium hover:underline">
              Quay về
            </button>
          </motion.div>
        </div>
        <div className="text-center mt-8 text-gray-400 text-xs">© 2023 - Cổng thanh toán MoMo</div>
      </div>
    );
  }

  // ===== GATEWAY (processing - MoMo popup is open) =====
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <img src={MOMO_LOGO} alt="MoMo" className="h-9 w-9 rounded-lg" />
          <span className="text-gray-700 font-medium">Cổng thanh toán MoMo</span>
        </div>
      </div>
      <div className="max-w-2xl mx-auto mt-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-pink-200" />
            <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={MOMO_LOGO} alt="MoMo" className="h-8 w-8 rounded" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Đang xử lý thanh toán...</h2>
          <p className="text-gray-500 text-sm mb-2">Cổng thanh toán MoMo đã mở trong cửa sổ mới.</p>
          <p className="text-gray-400 text-sm mb-6">Vui lòng không đóng trang này.</p>

          {/* Progress bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </div>

          <div className="mt-6 bg-pink-50 rounded-xl p-4 border border-pink-100">
            <p className="text-sm text-gray-600">
              <strong className="text-pink-600">Đặt cọc:</strong> {booking?.serviceName}
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatPrice(deposit?.depositAmount)}đ</p>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-gray-400 text-xs">© 2023 - Cổng thanh toán MoMo</div>
    </div>
  );
};

export default MoMoBookingDepositPage;
