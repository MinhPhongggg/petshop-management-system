import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiArrowLeft, FiX, FiRefreshCw, FiUser, FiFileText } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [promotionProgress, setPromotionProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await bookingsApi.getById(id);
      const bookingData = response.data;
      setBooking(bookingData);

      if (bookingData?.petId && bookingData?.serviceId) {
        try {
          const progressRes = await bookingsApi.getPromotionProgress(bookingData.petId, bookingData.serviceId);
          setPromotionProgress(progressRes.data);
        } catch (progressError) {
          setPromotionProgress(null);
        }
      } else {
        setPromotionProgress(null);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Không thể tải thông tin lịch hẹn');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await bookingsApi.cancel(booking.id, 'Khách hàng tự hủy');
      toast.success('Đã hủy lịch hẹn');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy lịch hẹn');
    }
  };

  const handleRebook = () => {
    navigate(`/booking?service=${booking.serviceId}`);
  };

  const handlePayBooking = async () => {
    try {
      const previewRes = await bookingsApi.previewPayment(booking.id);
      const preview = previewRes.data;

      const confirmMessage = preview.willBeFree
        ? `Bạn đủ điều kiện Khuyến mãi 3 tặng 1 (cùng dịch vụ). Số tiền thanh toán: ${formatPrice(preview.finalPrice)}. Xác nhận thanh toán?`
        : `Số tiền cần thanh toán: ${formatPrice(preview.finalPrice)}. Xác nhận thanh toán?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      await bookingsApi.pay(booking.id);
      toast.success(preview.willBeFree ? 'Thanh toán thành công - Booking này được miễn phí 100%' : 'Thanh toán thành công');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thanh toán booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đã xác nhận' },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Đang thực hiện' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-600', label: 'Hoàn thành' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-600', label: 'Đã hủy' },
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Không đến' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy lịch hẹn</p>
        <Link to="/my-bookings" className="text-petshop-orange hover:underline mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/my-bookings"
          className="flex items-center gap-2 text-gray-600 hover:text-petshop-orange transition-colors"
        >
          <FiArrowLeft /> Quay lại
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Booking header */}
        <div className="p-6 border-b bg-gradient-to-r from-petshop-orange/5 to-petshop-green/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Mã lịch hẹn</p>
              <p className="text-lg font-bold text-gray-800 mb-2">{booking.bookingCode}</p>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-2xl font-bold text-petshop-orange">{formatPrice(booking.price)}</p>
          </div>
        </div>

        {/* Service info */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Dịch vụ</h3>
          <p className="text-xl font-bold text-gray-800">{booking.serviceName}</p>
          {booking.duration && (
            <p className="text-sm text-gray-500 mt-1">Thời gian: {booking.duration} phút</p>
          )}
        </div>

        {/* Schedule info */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Lịch hẹn</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-petshop-green/10 flex items-center justify-center">
                <FiCalendar className="text-petshop-green" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày hẹn</p>
                <p className="font-medium text-gray-800">{formatDate(booking.bookingDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-petshop-yellow/10 flex items-center justify-center">
                <FiClock className="text-petshop-yellow" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Giờ hẹn</p>
                <p className="font-medium text-gray-800">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pet info */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Thông tin thú cưng</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-petshop-orange/10 flex items-center justify-center">
                <MdPets className="text-petshop-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tên</p>
                <p className="font-medium text-gray-800">{booking.petName}</p>
              </div>
            </div>
            {booking.petType && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MdPets className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loại</p>
                  <p className="font-medium text-gray-800">
                    {booking.petType === 'DOG' ? 'Chó' : booking.petType === 'CAT' ? 'Mèo' : booking.petType}
                  </p>
                </div>
              </div>
            )}
            {booking.petWeight && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <span className="text-purple-500 text-sm font-bold">kg</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cân nặng</p>
                  <p className="font-medium text-gray-800">{booking.petWeight} kg</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staff info */}
        {booking.staffName && (
          <div className="p-6 border-b">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Nhân viên phụ trách</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FiUser className="text-indigo-500" />
              </div>
              <p className="font-medium text-gray-800">{booking.staffName}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {(booking.customerNote || booking.staffNote || booking.cancelReason) && (
          <div className="p-6 border-b">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Ghi chú</h3>
            <div className="space-y-3">
              {booking.customerNote && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ghi chú khách hàng</p>
                    <p className="text-gray-800">{booking.customerNote}</p>
                  </div>
                </div>
              )}
              {booking.staffNote && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ghi chú nhân viên</p>
                    <p className="text-gray-800">{booking.staffNote}</p>
                  </div>
                </div>
              )}
              {booking.cancelReason && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FiX className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lý do hủy</p>
                    <p className="text-red-600">{booking.cancelReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Thời gian</h3>
          <div className="space-y-2 text-sm">
            {booking.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày tạo</span>
                <span className="text-gray-800">{formatDateTime(booking.createdAt)}</span>
              </div>
            )}
            {booking.confirmedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày xác nhận</span>
                <span className="text-gray-800">{formatDateTime(booking.confirmedAt)}</span>
              </div>
            )}
            {booking.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày hoàn thành</span>
                <span className="text-gray-800">{formatDateTime(booking.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex items-center justify-end gap-3">
          {booking.status === 'PENDING' && (
            <button
              onClick={handleCancelBooking}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium"
            >
              <FiX /> Hủy lịch hẹn
            </button>
          )}
          {booking.status === 'COMPLETED' && (
            <>
              {booking.paymentStatus !== 'PAID' && (
                <div className="flex items-center gap-2">
                  {promotionProgress?.canApplyFreeBooking && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Đủ điều kiện miễn phí
                    </span>
                  )}
                  <button
                    onClick={handlePayBooking}
                    className="px-6 py-2.5 bg-petshop-orange/10 text-petshop-orange rounded-xl hover:bg-petshop-orange/20 transition-colors font-medium"
                  >
                    Thanh toán
                  </button>
                </div>
              )}
              <button
                onClick={handleRebook}
                className="btn-primary flex items-center gap-2"
              >
                <FiRefreshCw /> Đặt lại
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingDetailPage;
