import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiEye, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { bookingsApi } from '../../services/api';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

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
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{booking.serviceName}</h3>
                  </div>
                  <p className="text-xl font-bold text-petshop-orange">
                    {formatPrice(booking.price || booking.totalAmount)}
                  </p>
                </div>

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
                    <button className="btn-primary flex items-center gap-2">
                      <FiRefreshCw /> Đặt lại
                    </button>
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
