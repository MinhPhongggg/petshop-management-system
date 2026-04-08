import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentsApi, ordersApi } from '../services/api';

const MOMO_LOGO = 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png';

const MoMoPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.order;
  const momoWindowRef = useRef(null);

  const [order, setOrder] = useState(orderData || null);
  const [loading, setLoading] = useState(true);
  const [payUrl, setPayUrl] = useState(null);
  const [status, setStatus] = useState('pending'); // pending | processing | success | failed
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState('loading'); // loading → gateway → success

  // Load order + create MoMo payment to get payUrl
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch order if not passed via state
        let currentOrder = orderData;
        if (!currentOrder && orderId) {
          const res = await ordersApi.getById(orderId);
          currentOrder = res.data;
          setOrder(currentOrder);
        }

        if (!currentOrder) {
          setStatus('failed');
          setLoading(false);
          return;
        }

        // Check if already paid
        if (currentOrder.paymentStatus === 'PAID') {
          setStatus('success');
          setStep('success');
          setLoading(false);
          return;
        }

        // Create real MoMo payment → get payUrl
        const momoRes = await paymentsApi.createMomoOrder(orderId);
        setPayUrl(momoRes.data.payUrl);
        setStep('gateway');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể tạo thanh toán MoMo');
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orderId, orderData]);

  // Open MoMo gateway + auto-confirm
  const openGatewayAndConfirm = useCallback(async () => {
    if (status !== 'pending' || !payUrl) return;
    setStatus('processing');

    // Open real MoMo gateway in popup
    momoWindowRef.current = window.open(
      payUrl,
      'momoGateway',
      'width=900,height=700,scrollbars=yes,resizable=yes'
    );

    try {
      // Wait 3s (user sees real MoMo gateway) + confirm in parallel
      const [, confirmRes] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 3000)),
        paymentsApi.mockMomo(orderId),
      ]);

      // Close MoMo popup
      if (momoWindowRef.current && !momoWindowRef.current.closed) {
        momoWindowRef.current.close();
      }

      setTransactionId(confirmRes.data.transactionId);
      setStatus('success');
      setStep('success');
      toast.success('Thanh toán thành công!');
    } catch (error) {
      if (momoWindowRef.current && !momoWindowRef.current.closed) {
        momoWindowRef.current.close();
      }
      setStatus('failed');
      toast.error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  }, [orderId, payUrl, status]);

  // Auto-open gateway when payUrl is ready
  useEffect(() => {
    if (step === 'gateway' && status === 'pending' && payUrl && !loading) {
      openGatewayAndConfirm();
    }
  }, [step, status, payUrl, loading, openGatewayAndConfirm]);

  // Auto redirect 5s after success
  useEffect(() => {
    if (step !== 'success') return;
    const timer = setTimeout(() => navigate('/my-orders'), 5000);
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
              <button onClick={() => navigate('/my-orders')}
                className="px-6 py-2.5 border-2 border-pink-500 text-pink-500 font-semibold rounded-full hover:bg-pink-50">
                Đơn hàng
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
              <p className="text-3xl font-bold text-gray-800">{formatPrice(order?.totalAmount)}đ</p>
            </div>
            <div className="mb-6"><span className="text-3xl">🎉</span></div>
            <p className="text-gray-500 text-sm mb-4">MoMo sẽ tự động đưa bạn về lại trang của Nhà cung cấp</p>
            <button onClick={() => navigate('/my-orders')} className="text-pink-500 font-medium hover:underline">
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
              <strong className="text-pink-600">Đơn hàng:</strong> {order?.orderCode}
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatPrice(order?.totalAmount)}đ</p>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-gray-400 text-xs">© 2023 - Cổng thanh toán MoMo</div>
    </div>
  );
};

export default MoMoPaymentPage;
