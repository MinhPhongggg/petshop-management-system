import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEye, FiCheck, FiX, FiCalendar, FiClock } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab, selectedDate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsApi.getAll({ status: activeTab === 'all' ? '' : activeTab, date: selectedDate });
      setBookings(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingsApi.updateStatus(bookingId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
<<<<<<< Updated upstream
      toast.error('Không thể cập nhật trạng thái');
=======
      toast.error(error.response?.data?.message || 'Không thể xác nhận lịch hẹn');
    }
  };

  const handleStart = async (bookingId) => {
    try {
      await bookingsApi.start(bookingId);
      toast.success('Đã bắt đầu thực hiện dịch vụ');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể bắt đầu dịch vụ');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await bookingsApi.complete(bookingId);
      toast.success('Đã hoàn thành dịch vụ');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hoàn thành dịch vụ');
    }
  };

  const handlePayBooking = async (booking) => {
    try {
      const previewRes = await bookingsApi.previewPayment(booking.id);
      const preview = previewRes.data;

      const confirmMessage = preview.willBeFree
        ? `Booking này đủ điều kiện khuyến mãi 3 tặng 1 (cùng dịch vụ). Số tiền thanh toán: ${formatPrice(preview.finalPrice)}. Xác nhận thanh toán?`
        : `Số tiền cần thanh toán: ${formatPrice(preview.finalPrice)}. Xác nhận thanh toán?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      await bookingsApi.pay(booking.id);
      toast.success(preview.willBeFree ? 'Đã áp dụng miễn phí và thanh toán thành công' : 'Thanh toán thành công');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thanh toán booking');
    }
  };

  const handleAdminCancel = async (bookingId) => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    try {
      await bookingsApi.adminCancel(bookingId, cancelReason);
      toast.success('Đã hủy lịch hẹn');
      setCancelReason('');
      setShowCancelModal(null);
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy lịch hẹn');
    }
  };

  const handleMarkNoShow = async (bookingId) => {
    try {
      await bookingsApi.markNoShow(bookingId);
      toast.success('Đã đánh dấu khách không đến');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
>>>>>>> Stashed changes
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'IN_PROGRESS', label: 'Đang thực hiện' },
    { id: 'COMPLETED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý lịch hẹn</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-petshop-orange text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã booking hoặc tên khách..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field pl-10 w-auto"
            />
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <span className="font-medium text-gray-800">{booking.bookingCode}</span>
              {getStatusBadge(booking.status)}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-petshop-orange/10 rounded-full flex items-center justify-center">
                  <MdPets className="text-petshop-orange" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{booking.pet.name}</p>
                  <p className="text-sm text-gray-500">{booking.pet.breed} - {booking.pet.weight}kg</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Dịch vụ:</span> {booking.service.name}</p>
                <p><span className="font-medium">Khách:</span> {booking.customer.name} - {booking.customer.phone}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <FiCalendar className="text-petshop-green" />
                  {booking.bookingDate}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <FiClock className="text-petshop-yellow" />
                  {booking.bookingTime}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-bold text-petshop-orange">{formatPrice(booking.totalAmount)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <FiEye />
                  </button>
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiX />
                      </button>
                    </>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm"
                    >
                      Bắt đầu
                    </button>
                  )}
                  {booking.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                      className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm"
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
<<<<<<< Updated upstream
=======

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <FiCalendar className="text-petshop-green" />
                    {formatDate(booking.bookingDate)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <FiClock className="text-petshop-yellow" />
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="font-bold text-petshop-orange">{formatPrice(booking.price)}</span>
                    <p className={`text-xs mt-1 ${booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <FiEye />
                    </button>
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg"
                          title="Xác nhận"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => setShowCancelModal(booking.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          title="Hủy"
                        >
                          <FiX />
                        </button>
                      </>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleStart(booking.id)}
                          className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm"
                          title="Bắt đầu dịch vụ"
                        >
                          <FiPlay className="inline mr-1" /> Bắt đầu
                        </button>
                        <button
                          onClick={() => handleMarkNoShow(booking.id)}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs"
                          title="Khách không đến"
                        >
                          No show
                        </button>
                      </>
                    )}
                    {booking.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleComplete(booking.id)}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm"
                      >
                        <FiCheck className="inline mr-1" /> Hoàn thành
                      </button>
                    )}
                    {booking.status === 'COMPLETED' && booking.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => handlePayBooking(booking)}
                        className="px-3 py-1 bg-petshop-orange/10 text-petshop-orange rounded-lg text-sm"
                      >
                        Thanh toán
                      </button>
                    )}
                  </div>
                </div>
>>>>>>> Stashed changes
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết lịch hẹn {selectedBooking.bookingCode}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">Thông tin thú cưng</h3>
                <p><span className="text-gray-500">Tên:</span> {selectedBooking.pet.name}</p>
                <p><span className="text-gray-500">Loại:</span> {selectedBooking.pet.type}</p>
                <p><span className="text-gray-500">Giống:</span> {selectedBooking.pet.breed}</p>
                <p><span className="text-gray-500">Cân nặng:</span> {selectedBooking.pet.weight} kg</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">Thông tin khách hàng</h3>
                <p><span className="text-gray-500">Tên:</span> {selectedBooking.customer.name}</p>
                <p><span className="text-gray-500">SĐT:</span> {selectedBooking.customer.phone}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">Chi tiết dịch vụ</h3>
                <p><span className="text-gray-500">Dịch vụ:</span> {selectedBooking.service.name}</p>
                <p><span className="text-gray-500">Thời gian:</span> {selectedBooking.service.duration} phút</p>
                <p><span className="text-gray-500">Ngày hẹn:</span> {selectedBooking.bookingDate}</p>
                <p><span className="text-gray-500">Giờ hẹn:</span> {selectedBooking.bookingTime}</p>
              </div>

              {selectedBooking.notes && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Ghi chú</h3>
                  <p className="text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-lg font-medium text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-petshop-orange">
                  {formatPrice(selectedBooking.totalAmount)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
