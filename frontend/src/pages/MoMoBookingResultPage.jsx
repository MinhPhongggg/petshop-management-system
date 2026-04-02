import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { paymentsApi } from '../services/api';

const MOMO_LOGO = 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png';

const MoMoBookingResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const response = await paymentsApi.getRedirectResult(params);
        setResult(response.data);
      } catch {
        setResult({ success: false, message: 'Không thể xác nhận kết quả thanh toán' });
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [searchParams]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isSuccess = result?.success;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isSuccess ? 'bg-green-50' : 'bg-pink-50'}`}>
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <img src={MOMO_LOGO} alt="MoMo" className="h-14 w-14 object-contain bg-white rounded-full p-1 shadow-md mx-auto mb-5" />
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSuccess ? 'bg-green-100' : 'bg-pink-100'
        }`}>
          {isSuccess
            ? <FiCheck className="w-10 h-10 text-green-600" />
            : <FiAlertCircle className="w-10 h-10 text-pink-500" />
          }
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isSuccess ? 'Đặt cọc thành công!' : 'Thanh toán thất bại'}
        </h2>
        <p className="text-gray-500 mb-6">{result?.message}</p>

        {isSuccess && result && (
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left text-sm">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã lịch hẹn</span>
                <span className="font-bold text-pink-600">{result.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dịch vụ</span>
                <span className="font-semibold">{result.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày hẹn</span>
                <span className="font-semibold">{result.bookingDate} - {result.startTime}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-500">Đã cọc</span>
                <span className="font-bold text-pink-600">{formatPrice(result.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Còn lại</span>
                <span className="font-semibold">{formatPrice(result.remainingAmount)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="flex-1 btn-outline">
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(isSuccess ? '/my-bookings' : '/booking')}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl"
          >
            {isSuccess ? 'Xem lịch hẹn' : 'Đặt lại'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoMoBookingResultPage;
