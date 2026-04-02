import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiEye, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { bookingsApi } from '../../services/api';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [promotionProgressByPair, setPromotionProgressByPair] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
<<<<<<< Updated upstream
      const response = await bookingsApi.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
=======
      const response = await bookingsApi.getMyBookings({ size: 100 });
      const data = response.data;
      // Xử lý cả 2 trường hợp: dữ liệu phân trang (Page) hoặc mảng thường
      const bookingList = data.content || (Array.isArray(data) ? data : []);
      setBookings(bookingList);

      const uniquePairs = [
        ...new Set(
          bookingList
            .filter((b) => b.petId && b.serviceId)
            .map((b) => `${b.petId}-${b.serviceId}`)
        )
      ];
      if (uniquePairs.length > 0) {
        const progressEntries = await Promise.all(
          uniquePairs.map(async (pairKey) => {
            const [petIdRaw, serviceIdRaw] = pairKey.split('-');
            const petId = Number(petIdRaw);
            const serviceId = Number(serviceIdRaw);
            try {
              const progressRes = await bookingsApi.getPromotionProgress(petId, serviceId);
              return [pairKey, progressRes.data];
            } catch (err) {
              return [pairKey, null];
            }
          })
        );

        setPromotionProgressByPair(Object.fromEntries(progressEntries));
      } else {
        setPromotionProgressByPair({});
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setPromotionProgressByPair({});
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

<<<<<<< Updated upstream
=======
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await bookingsApi.cancel(bookingId, 'Khách hàng tự hủy');
      toast.success('Đã hủy lịch hẹn');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy lịch hẹn');
    }
  };

  const handleRebook = (booking) => {
    navigate(`/booking?service=${booking.serviceId}`);
  };

  const handlePayBooking = async (booking) => {
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
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thanh toán booking');
    }
  };

>>>>>>> Stashed changes
  const tabs = [
    { id: 'all', label: 'Tất cả', icon: FiCalendar },
    { id: 'PENDING', label: 'Chờ xác nhận', icon: FiClock },
    { id: 'CONFIRMED', label: 'Đã xác nhận', icon: FiCheck },
    { id: 'COMPLETED', label: 'Hoàn thành', icon: FiCheck },
    { id: 'CANCELLED', label: 'Đã hủy', icon: FiX },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đã xác nhận' },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Đang thực hiện' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-600', label: 'Hoàn thành' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-600', label: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPetIcon = (petType) => {
    return <MdPets className="text-petshop-orange" />;
  };

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch hẹn của tôi</h1>
        <Link to="/booking" className="btn-primary">
          + Đặt lịch mới
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-petshop-orange text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Không có lịch hẹn</h3>
          <p className="text-gray-500 mb-6">Bạn chưa có lịch hẹn nào trong mục này</p>
          <Link to="/booking" className="btn-primary">
            Đặt lịch ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">{booking.bookingCode}</span>
                      {getStatusBadge(booking.status)}
                      {booking.promotionReward && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                          Lần này miễn phí
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{booking.serviceName}</h3>
                    {promotionProgressByPair[`${booking.petId}-${booking.serviceId}`] && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tiến trình khuyến mãi:{' '}
                        <span className="font-semibold text-petshop-orange">
                          {Math.min(
                            promotionProgressByPair[`${booking.petId}-${booking.serviceId}`].eligibleCompletedCount,
                            promotionProgressByPair[`${booking.petId}-${booking.serviceId}`].requiredCount
                          )}
                          /
                          {promotionProgressByPair[`${booking.petId}-${booking.serviceId}`].requiredCount}
                        </span>
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold text-petshop-orange">
                    {formatPrice(booking.price || booking.totalAmount)}
                  </p>
                </div>

                {booking.status === 'COMPLETED' && (
                  <p className={`text-sm mb-3 ${booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                )}

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {getPetIcon(booking.petType)}
                    <div>
                      <p className="text-sm text-gray-500">Thú cưng</p>
                      <p className="font-medium text-gray-800">{booking.petName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-petshop-green" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày hẹn</p>
                      <p className="font-medium text-gray-800">{formatDate(booking.bookingDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiClock className="text-petshop-yellow" />
                    <div>
                      <p className="text-sm text-gray-500">Giờ hẹn</p>
                      <p className="font-medium text-gray-800">{booking.startTime || booking.bookingTime}</p>
                    </div>
                  </div>
                </div>

                {(booking.customerNote || booking.notes) && (
                  <p className="text-sm text-gray-500 italic mb-4">
                    Ghi chú: {booking.customerNote || booking.notes}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Link
                    to={`/bookings/${booking.id}`}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-petshop-orange text-petshop-orange rounded-xl hover:bg-petshop-orange hover:text-white transition-colors"
                  >
                    <FiEye /> Chi tiết
                  </Link>
                  {booking.status === 'PENDING' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">
                      <FiX /> Hủy lịch
                    </button>
                  )}
                  {booking.status === 'COMPLETED' && (
<<<<<<< Updated upstream
                    <button className="btn-primary flex items-center gap-2">
                      <FiRefreshCw /> Đặt lại
                    </button>
=======
                    <>
                      {booking.paymentStatus !== 'PAID' && (
                        <div className="flex items-center gap-2">
                          {promotionProgressByPair[`${booking.petId}-${booking.serviceId}`]?.canApplyFreeBooking && (
                            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                              Đủ điều kiện miễn phí
                            </span>
                          )}
                          <button
                            onClick={() => handlePayBooking(booking)}
                            className="px-4 py-2 bg-petshop-orange/10 text-petshop-orange rounded-xl hover:bg-petshop-orange/20 transition-colors"
                          >
                            Thanh toán
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleRebook(booking)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <FiRefreshCw /> Đặt lại
                      </button>
                    </>
>>>>>>> Stashed changes
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
