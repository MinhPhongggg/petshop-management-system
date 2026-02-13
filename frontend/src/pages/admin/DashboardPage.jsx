import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiShoppingCart, FiUsers, FiCalendar, 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiEye 
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardApi.getDashboard();
      const data = response.data;
      setStats({
        totalProducts: data.totalProducts,
        totalOrders: data.totalOrders,
        totalBookings: data.totalBookings,
        totalUsers: data.totalUsers,
        totalRevenue: data.totalRevenue,
        orderGrowth: data.orderGrowth,
        bookingGrowth: data.bookingGrowth,
        revenueGrowth: data.revenueGrowth,
      });
      setRecentOrders(data.recentOrders || []);
      setRecentBookings(data.recentBookings || []);
    } catch (error) {
      // Mock data
      setStats({
        totalProducts: 156,
        totalOrders: 234,
        totalBookings: 89,
        totalUsers: 567,
        totalRevenue: 125500000,
        orderGrowth: 12.5,
        bookingGrowth: 8.3,
        revenueGrowth: 15.2,
      });
      setRecentOrders([
        { id: 1, orderNumber: 'ORD-001', customer: 'Nguyễn Văn A', amount: 850000, status: 'PENDING', createdAt: '2024-01-20' },
        { id: 2, orderNumber: 'ORD-002', customer: 'Trần Thị B', amount: 1250000, status: 'SHIPPING', createdAt: '2024-01-20' },
        { id: 3, orderNumber: 'ORD-003', customer: 'Lê Văn C', amount: 450000, status: 'DELIVERED', createdAt: '2024-01-19' },
      ]);
      setRecentBookings([
        { id: 1, bookingCode: 'BK-001', customer: 'Nguyễn Văn A', service: 'Tắm và Vệ sinh', status: 'CONFIRMED', bookingDate: '2024-01-25' },
        { id: 2, bookingCode: 'BK-002', customer: 'Phạm Thị D', service: 'Cắt tỉa lông', status: 'PENDING', bookingDate: '2024-01-26' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status, type = 'order') => {
    const orderConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đã xác nhận' },
      SHIPPING: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-600', label: 'Đã giao' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-600', label: 'Đã hủy' },
    };
    const config = orderConfig[status] || orderConfig.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatPrice(stats.totalRevenue),
      icon: FiDollarSign,
      growth: stats.revenueGrowth,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      growth: stats.orderGrowth,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Lịch hẹn',
      value: stats.totalBookings,
      icon: FiCalendar,
      growth: stats.bookingGrowth,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Khách hàng',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Cập nhật: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
              {stat.growth && (
                <div className={`flex items-center gap-1 text-sm ${stat.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.growth > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {Math.abs(stat.growth)}%
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders & Bookings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="text-petshop-orange hover:underline text-sm">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-petshop-orange">{formatPrice(order.amount)}</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Lịch hẹn gần đây</h2>
            <Link to="/admin/bookings" className="text-petshop-orange hover:underline text-sm">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {recentBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{booking.bookingCode}</p>
                  <p className="text-sm text-gray-500">{booking.customer} - {booking.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{booking.bookingDate}</p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-petshop-orange/10 transition-colors"
          >
            <FiPackage className="text-2xl text-petshop-orange" />
            <span className="text-sm font-medium text-gray-700">Thêm sản phẩm</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-petshop-orange/10 transition-colors"
          >
            <FiShoppingCart className="text-2xl text-petshop-orange" />
            <span className="text-sm font-medium text-gray-700">Xử lý đơn hàng</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-petshop-orange/10 transition-colors"
          >
            <FiCalendar className="text-2xl text-petshop-orange" />
            <span className="text-sm font-medium text-gray-700">Lịch hẹn hôm nay</span>
          </Link>
          <Link
            to="/admin/services"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-petshop-orange/10 transition-colors"
          >
            <MdPets className="text-2xl text-petshop-orange" />
            <span className="text-sm font-medium text-gray-700">Quản lý dịch vụ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
