import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEye, FiCheck, FiX, FiCalendar, FiClock, FiPlay } from 'react-icons/fi';
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
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab, selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let response;

      if (selectedDate) {
        // Lấy lịch theo ngày cụ thể
        response = await bookingsApi.getByDate(selectedDate);
        const data = response.data;
        let list = Array.isArray(data) ? data : (data.content || []);
        if (activeTab !== 'all') {
          list = list.filter(b => b.status === activeTab);
        }
        setBookings(list);
      } else if (activeTab !== 'all') {
        // Lấy lịch theo trạng thái
        response = await bookingsApi.getByStatus(activeTab, { size: 100 });
        const data = response.data;
        setBookings(data.content || (Array.isArray(data) ? data : []));
      } else {
        // Lấy tất cả
        response = await bookingsApi.getAll({ size: 100 });
        const data = response.data;
        setBookings(data.content || (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải danh sách lịch hẹn');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await bookingsApi.confirm(bookingId);
      toast.success('Đã xác nhận lịch hẹn');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
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
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'IN_PROGRESS', label: 'Đang thực hiện' },
    { id: 'COMPLETED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
    { id: 'NO_SHOW', label: 'Không đến' },
  ];

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Chưa có giá';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (booking.bookingCode || '').toLowerCase().includes(term) ||
      (booking.userName || '').toLowerCase().includes(term) ||
      (booking.userPhone || '').includes(term) ||
      (booking.petName || '').toLowerCase().includes(term) ||
      (booking.serviceName || '').toLowerCase().includes(term)
    );
  });

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
                placeholder="Tìm mã booking, tên khách, SĐT, tên pet..."
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
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Xóa bộ lọc ngày"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Không có lịch hẹn</h3>
          <p className="text-gray-500">Không tìm thấy lịch hẹn nào phù hợp</p>
        </div>
      ) : (
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
                <span className="font-medium text-gray-800 text-sm">{booking.bookingCode}</span>
                {getStatusBadge(booking.status)}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-petshop-orange/10 rounded-full flex items-center justify-center">
                    <MdPets className="text-petshop-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{booking.petName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      {booking.petType || ''} {booking.petWeight ? `- ${booking.petWeight}kg` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Dịch vụ:</span> {booking.serviceName}</p>
                  <p><span className="font-medium">Khách:</span> {booking.userName} {booking.userPhone ? `- ${booking.userPhone}` : ''}</p>
                  {booking.staffName && (
                    <p><span className="font-medium">NV phụ trách:</span> {booking.staffName}</p>
                  )}
                </div>

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
                  <span className="font-bold text-petshop-orange">{formatPrice(booking.price)}</span>
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
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Hủy lịch hẹn</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="3"
                className="input-field"
                placeholder="Nhập lý do hủy lịch hẹn..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => handleAdminCancel(showCancelModal)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Xác nhận hủy
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết lịch hẹn
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              {/* Booking Code & Status */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <span className="font-medium text-gray-800">{selectedBooking.bookingCode}</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Pet Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">Thông tin thú cưng</h3>
                <p><span className="text-gray-500">Tên:</span> {selectedBooking.petName}</p>
                <p><span className="text-gray-500">Loại:</span> {selectedBooking.petType || 'N/A'}</p>
                {selectedBooking.petBreed && (
                  <p><span className="text-gray-500">Giống:</span> {selectedBooking.petBreed}</p>
                )}
                <p><span className="text-gray-500">Cân nặng:</span> {selectedBooking.petWeight ? `${selectedBooking.petWeight} kg` : 'N/A'}</p>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">Thông tin khách hàng</h3>
                <p><span className="text-gray-500">Tên:</span> {selectedBooking.userName}</p>
                <p><span className="text-gray-500">SĐT:</span> {selectedBooking.userPhone || 'N/A'}</p>
                {selectedBooking.userEmail && (
                  <p><span className="text-gray-500">Email:</span> {selectedBooking.userEmail}</p>
                )}
              </div>

              {/* Service Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">Chi tiết dịch vụ</h3>
                <p><span className="text-gray-500">Dịch vụ:</span> {selectedBooking.serviceName}</p>
                <p><span className="text-gray-500">Thời gian:</span> {selectedBooking.duration} phút</p>
                <p><span className="text-gray-500">Ngày hẹn:</span> {formatDate(selectedBooking.bookingDate)}</p>
                <p><span className="text-gray-500">Giờ:</span> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
              </div>

              {/* Staff Info */}
              {selectedBooking.staffName && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Nhân viên phụ trách</h3>
                  <p>{selectedBooking.staffName}</p>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.customerNote && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Ghi chú khách hàng</h3>
                  <p className="text-gray-600">{selectedBooking.customerNote}</p>
                </div>
              )}

              {selectedBooking.staffNote && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Ghi chú nhân viên</h3>
                  <p className="text-gray-600">{selectedBooking.staffNote}</p>
                </div>
              )}

              {selectedBooking.cancelReason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h3 className="font-medium text-red-800 mb-2">Lý do hủy</h3>
                  <p className="text-red-600">{selectedBooking.cancelReason}</p>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-lg font-medium text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-petshop-orange">
                  {formatPrice(selectedBooking.price)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleConfirm(selectedBooking.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => { setShowCancelModal(selectedBooking.id); }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                    >
                      Hủy lịch
                    </button>
                  </>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleStart(selectedBooking.id)}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
                    >
                      Bắt đầu dịch vụ
                    </button>
                    <button
                      onClick={() => handleMarkNoShow(selectedBooking.id)}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
                    >
                      Khách không đến
                    </button>
                  </>
                )}
                {selectedBooking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleComplete(selectedBooking.id)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
