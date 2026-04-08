import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiShoppingCart, FiUsers, FiCalendar, 
  FiTrendingUp, FiTrendingDown, FiDollarSign,
  FiAlertTriangle, FiBarChart2, FiClock, FiStar, FiHeart,
  FiCheckCircle, FiXCircle, FiActivity, FiAward, FiTarget
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { dashboardApi, analyticsApi } from '../../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashResult, analyticsResult] = await Promise.allSettled([
        dashboardApi.getDashboard(),
        analyticsApi.getFullAnalytics(),
      ]);
      if (dashResult.status === 'fulfilled') {
        const data = dashResult.value.data;
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
      } else {
        console.error('Dashboard API failed:', dashResult.reason);
      }

      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value.data);
      } else {
        console.error('Analytics API failed:', analyticsResult.reason);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} triệu`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatPriceFull = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Chờ xác nhận', dot: 'bg-amber-400' },
      CONFIRMED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Đã xác nhận', dot: 'bg-blue-400' },
      PROCESSING: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'Đang xử lý', dot: 'bg-indigo-400' },
      SHIPPING: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Đang giao', dot: 'bg-purple-400' },
      DELIVERED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Đã giao', dot: 'bg-emerald-400' },
      COMPLETED: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Hoàn thành', dot: 'bg-green-400' },
      IN_PROGRESS: { bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700', label: 'Đang thực hiện', dot: 'bg-cyan-400' },
      CANCELLED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Đã hủy', dot: 'bg-red-400' },
      NO_SHOW: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Không đến', dot: 'bg-gray-400' },
    }[status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', label: status, dot: 'bg-gray-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-petshop-orange border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Tổng doanh thu', value: formatPrice(stats?.totalRevenue || 0), icon: FiDollarSign, growth: stats?.revenueGrowth, gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50' },
    { title: 'Đơn hàng', value: stats?.totalOrders || 0, icon: FiShoppingCart, growth: stats?.orderGrowth, gradient: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50' },
    { title: 'Lịch hẹn', value: stats?.totalBookings || 0, icon: FiCalendar, growth: stats?.bookingGrowth, gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50' },
    { title: 'Khách hàng', value: stats?.totalUsers || 0, icon: FiUsers, gradient: 'from-orange-500 to-rose-500', bgLight: 'bg-orange-50' },
  ];

  const tabs = [
    { key: 'overview', label: 'Tổng quan', icon: FiBarChart2 },
    { key: 'services', label: 'Dịch vụ Spa', icon: FiCalendar },
    { key: 'inventory', label: 'Kho hàng & Bán lẻ', icon: FiPackage },
    { key: 'pets', label: 'Hồ sơ thú cưng', icon: MdPets },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Thống kê & Báo cáo
          </h1>
          <p className="text-gray-500 mt-1">Tổng quan hoạt động kinh doanh Pet Shop</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <FiClock className="text-gray-400" />
          <span className="text-sm text-gray-600">Cập nhật: <span className="font-semibold text-gray-800">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && renderServiceAnalytics()}
          {activeTab === 'inventory' && renderInventoryAnalytics()}
          {activeTab === 'pets' && renderPetAnalytics()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // ==================== TAB 1: TỔNG QUAN ====================
  function renderOverview() {
    return (
      <div className="space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
                {stat.growth !== undefined && stat.growth !== null && (
                  <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                    stat.growth > 0 ? 'text-emerald-600 bg-emerald-50' : stat.growth < 0 ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'
                  }`}>
                    {stat.growth > 0 ? <FiTrendingUp size={14} /> : stat.growth < 0 ? <FiTrendingDown size={14} /> : null}
                    {stat.growth > 0 ? '+' : ''}{stat.growth}%
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders & Bookings */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FiShoppingCart className="text-blue-600 text-lg" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
              </div>
              <Link to="/admin/orders" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Xem tất cả →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FiShoppingCart className="mx-auto text-4xl text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                recentOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">#</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="font-bold text-orange-600 text-sm">{formatPriceFull(order.amount)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <FiCalendar className="text-violet-600 text-lg" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Lịch hẹn gần đây</h2>
              </div>
              <Link to="/admin/bookings" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Xem tất cả →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FiCalendar className="mx-auto text-4xl text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Chưa có lịch hẹn nào</p>
                </div>
              ) : (
                recentBookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <MdPets className="text-lg text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{booking.bookingCode}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{booking.customer} — {booking.service}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="text-xs text-gray-500 font-medium">{booking.bookingDate}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { to: '/admin/products/new', icon: FiPackage, label: 'Thêm sản phẩm', gradient: 'from-blue-500 to-cyan-500' },
              { to: '/admin/orders', icon: FiShoppingCart, label: 'Xử lý đơn hàng', gradient: 'from-emerald-500 to-teal-500' },
              { to: '/admin/bookings', icon: FiCalendar, label: 'Lịch hẹn hôm nay', gradient: 'from-violet-500 to-purple-500' },
              { to: '/admin/services', icon: MdPets, label: 'Quản lý dịch vụ', gradient: 'from-orange-500 to-rose-500' },
            ].map((action, i) => (
              <Link key={i} to={action.to} className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="text-white text-xl" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== TAB 2: DỊCH VỤ SPA ====================
  function renderServiceAnalytics() {
    const sa = analytics?.serviceAnalytics;
    if (!sa) return <EmptyState message="Chưa có dữ liệu dịch vụ" />;

    const maxBookingInHour = Math.max(...(sa.hourlyBookingRates || []).map(h => h.bookingCount), 1);

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard icon={FiCalendar} title="Tổng booking" value={sa.totalBookings || 0} color="blue" description="Tất cả lịch hẹn" />
          <SummaryCard icon={FiCheckCircle} title="Hoàn thành" value={sa.completedBookings || 0} color="green" description={`${sa.completionRate || 0}% tỷ lệ thành công`} />
          <SummaryCard icon={FiXCircle} title="Đã hủy" value={sa.cancelledBookings || 0} color="red" description="Lịch hẹn bị hủy" />
          <SummaryCard icon={FiTarget} title="Tỷ lệ hoàn thành" value={`${sa.completionRate || 0}%`} color="yellow" description="Mục tiêu: 85%">
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{ width: `${Math.min(sa.completionRate || 0, 100)}%` }} />
            </div>
          </SummaryCard>
        </div>

        {/* Hourly Booking Chart - FIXED with flex layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FiClock className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Lượng booking theo giờ trong ngày</h3>
              <p className="text-sm text-gray-500">Tỷ lệ lấp đầy slot (tối đa 3 slot/giờ × 30 ngày)</p>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end gap-2 sm:gap-3" style={{ height: '220px' }}>
            {(sa.hourlyBookingRates || []).map((h, i) => {
              const barHeight = maxBookingInHour > 0 ? (h.bookingCount / maxBookingInHour) * 100 : 0;
              const barColor = h.fillRate > 80 ? 'from-red-400 to-rose-500' 
                : h.fillRate > 50 ? 'from-amber-400 to-orange-500' 
                : h.bookingCount > 0 ? 'from-emerald-400 to-teal-500' 
                : 'from-gray-200 to-gray-300';
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none">
                    {h.bookingCount} booking • {h.fillRate}%
                  </div>
                  {/* Count label */}
                  {h.bookingCount > 0 && (
                    <div className="text-xs font-bold text-gray-700 mb-1">{h.bookingCount}</div>
                  )}
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(barHeight, 4)}%` }}
                    transition={{ delay: i * 0.04, duration: 0.5, type: 'spring' }}
                    className={`w-full rounded-t-xl bg-gradient-to-t ${barColor} group-hover:shadow-lg group-hover:brightness-110 transition-all`}
                    style={{ maxWidth: '42px', minHeight: '6px' }}
                  />
                  {/* Hour label */}
                  <div className="mt-2 text-xs font-bold text-gray-500">{h.hour}h</div>
                  {/* Fill rate */}
                  <div className="text-[10px] text-gray-400">{h.fillRate}%</div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-gray-100">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span className="w-4 h-3 rounded bg-gradient-to-r from-emerald-400 to-teal-500" /> Thấp (&lt;50%)
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span className="w-4 h-3 rounded bg-gradient-to-r from-amber-400 to-orange-500" /> Trung bình (50-80%)
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span className="w-4 h-3 rounded bg-gradient-to-r from-red-400 to-rose-500" /> Cao (&gt;80%)
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span className="w-4 h-3 rounded bg-gradient-to-r from-gray-200 to-gray-300" /> Không có
            </span>
          </div>
        </div>

        {/* Daily Booking - 7 days */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <FiActivity className="text-violet-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Booking 7 ngày gần nhất</h3>
              <p className="text-sm text-gray-500">Tỷ lệ lấp đầy slot theo ngày</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(sa.dailyBookingRates || []).map((d, i) => {
              const dateObj = new Date(d.date);
              const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
              const dayNum = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
              const fillColor = d.fillRate > 80 ? 'border-red-200 bg-red-50' : d.fillRate > 50 ? 'border-amber-200 bg-amber-50' : d.fillRate > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50';
              const textColor = d.fillRate > 80 ? 'text-red-600' : d.fillRate > 50 ? 'text-amber-600' : d.fillRate > 0 ? 'text-emerald-600' : 'text-gray-400';
              return (
                <motion.div
                  key={d.date}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`text-center rounded-2xl p-4 border-2 ${fillColor} transition-all hover:shadow-md`}
                >
                  <div className="text-xs font-medium text-gray-400 uppercase">{dayName}</div>
                  <div className="text-xs text-gray-500 mb-2">{dayNum}</div>
                  <div className={`text-3xl font-extrabold ${textColor}`}>{d.bookingCount}</div>
                  <div className="text-xs text-gray-500 mt-1">booking</div>
                  <div className={`mt-2 inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                    d.fillRate > 80 ? 'bg-red-100 text-red-700' : d.fillRate > 50 ? 'bg-amber-100 text-amber-700' : d.fillRate > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>{d.fillRate}%</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Groomer Performance & Popular Services */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Groomer Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <FiUsers className="text-orange-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hiệu suất Groomer</h3>
                <p className="text-sm text-gray-500">Nhân viên thực hiện dịch vụ</p>
              </div>
            </div>
            <div className="p-6">
              {(sa.groomerPerformances || []).length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-4xl text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Chưa có dữ liệu nhân viên</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sa.groomerPerformances.map((g, i) => (
                    <motion.div
                      key={g.staffId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold shadow ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' : 
                        i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' : 
                        i === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-400 text-white' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{g.staffName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{g.completedBookings}/{g.totalBookings} ca</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                            {g.totalBookings > 0 ? Math.round((g.completedBookings / g.totalBookings) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm">{formatPrice(g.totalRevenue)}</p>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-1 justify-end">
                          <FiStar className="fill-current" size={12} />
                          {g.averageRating ? g.averageRating.toFixed(1) : 'N/A'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <FiAward className="text-rose-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dịch vụ phổ biến nhất</h3>
                <p className="text-sm text-gray-500">So sánh mức độ sử dụng</p>
              </div>
            </div>
            <div className="p-6">
              {(sa.popularServices || []).length === 0 ? (
                <div className="text-center py-8">
                  <FiAward className="mx-auto text-4xl text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {sa.popularServices.map((s, i) => {
                    const colors = ['from-orange-400 to-rose-500', 'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-violet-400 to-purple-500', 'from-amber-400 to-yellow-500'];
                    const dotColors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];
                    return (
                      <motion.div
                        key={s.serviceId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${dotColors[i % dotColors.length]}`} />
                            <p className="font-bold text-gray-900">{s.serviceName}</p>
                          </div>
                          <span className="text-sm font-extrabold text-orange-600">{s.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.percentage}%` }}
                            transition={{ delay: i * 0.1 + 0.3, duration: 0.8, type: 'spring' }}
                            className={`h-3 rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1.5 font-medium">
                          <span>{s.bookingCount} lượt đặt</span>
                          <span className="text-emerald-600 font-semibold">{formatPrice(s.totalRevenue)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TAB 3: KHO HÀNG & BÁN LẺ ====================
  function renderInventoryAnalytics() {
    const ri = analytics?.retailInventoryAnalytics;
    if (!ri) return <EmptyState message="Chưa có dữ liệu kho hàng" />;

    return (
      <div className="space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard icon={FiPackage} title="Tổng biến thể" value={ri.totalVariants || 0} color="blue" description="Sản phẩm đang bán" />
          <SummaryCard icon={FiDollarSign} title="Giá trị tồn kho" value={formatPrice(ri.totalInventoryValue || 0)} color="green" description="Tổng giá trị" />
          <SummaryCard icon={FiAlertTriangle} title="Sắp hết hàng" value={ri.lowStockCount || 0} color="yellow" description="Cần nhập thêm" />
          <SummaryCard icon={FiXCircle} title="Đã hết hàng" value={ri.outOfStockCount || 0} color="red" description="Ngừng bán tạm thời" />
        </div>

        {/* Low Stock Alert Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FiAlertTriangle className="text-red-600 text-lg" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Cảnh báo tồn kho thấp</h3>
              <p className="text-sm text-gray-500">Sản phẩm cần nhập hàng bổ sung</p>
            </div>
            {(ri.lowStockAlerts || []).length > 0 && (
              <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                {ri.lowStockAlerts.length} sản phẩm
              </span>
            )}
          </div>
          <div className="p-6">
            {(ri.lowStockAlerts || []).length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-emerald-500 text-3xl" />
                </div>
                <p className="text-emerald-700 font-bold text-lg">Tất cả sản phẩm có đủ hàng!</p>
                <p className="text-gray-400 text-sm mt-1">Không cần nhập thêm hàng</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Biến thể</th>
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="pb-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tồn kho</th>
                      <th className="pb-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ri.lowStockAlerts.map((item, i) => (
                      <motion.tr
                        key={item.variantId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 font-semibold text-gray-900">{item.productName}</td>
                        <td className="py-4 text-gray-600">{item.variantName}</td>
                        <td className="py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-mono">{item.sku || '—'}</code>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`text-xl font-extrabold ${item.currentStock === 0 ? 'text-red-600' : item.currentStock <= 5 ? 'text-amber-600' : 'text-orange-500'}`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            item.urgency === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                            item.urgency === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              item.urgency === 'CRITICAL' ? 'bg-red-500 animate-pulse' : item.urgency === 'WARNING' ? 'bg-amber-500' : 'bg-orange-500'
                            }`} />
                            {item.urgency === 'CRITICAL' ? 'Nguy hiểm' : item.urgency === 'WARNING' ? 'Cảnh báo' : 'Thấp'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sales Velocity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FiTrendingUp className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top sản phẩm bán chạy</h3>
              <p className="text-sm text-gray-500">Xếp hạng theo số lượng đã bán</p>
            </div>
          </div>
          <div className="p-6">
            {(ri.salesVelocities || []).length === 0 ? (
              <div className="text-center py-10">
                <FiTrendingUp className="mx-auto text-4xl text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">Chưa có dữ liệu bán hàng</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ri.salesVelocities.map((item, i) => {
                  const maxSold = ri.salesVelocities[0]?.soldCount || 1;
                  const pct = (item.soldCount / maxSold) * 100;
                  const medalColors = ['from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-orange-300 to-amber-400'];
                  return (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shadow flex-shrink-0 ${
                        i < 3 ? `bg-gradient-to-br ${medalColors[i]} text-white` : 'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-gray-900 truncate">{item.productName}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{item.categoryName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm flex-shrink-0">
                            <span className="font-bold text-gray-900">{item.soldCount} <span className="text-gray-400 font-normal">đã bán</span></span>
                            <span className="text-gray-400">~{item.dailyAvgSales}/ngày</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: i * 0.06 + 0.3, duration: 0.6 }}
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-emerald-600 w-32 text-right flex-shrink-0">
                        {formatPrice(item.revenue)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== TAB 4: HỒ SƠ THÚ CƯNG ====================
  function renderPetAnalytics() {
    const pp = analytics?.petProfileAnalytics;
    if (!pp) return <EmptyState message="Chưa có dữ liệu thú cưng" />;

    const petTypeConfig = {
      DOG:     { emoji: '🐕', label: 'Chó',     color: 'from-blue-400 to-blue-600',     bgLight: 'bg-blue-50',   textColor: 'text-blue-600' },
      CAT:     { emoji: '🐈', label: 'Mèo',     color: 'from-pink-400 to-pink-600',     bgLight: 'bg-pink-50',   textColor: 'text-pink-600' },
      BIRD:    { emoji: '🐦', label: 'Chim',    color: 'from-green-400 to-green-600',   bgLight: 'bg-green-50',  textColor: 'text-green-600' },
      FISH:    { emoji: '🐟', label: 'Cá',      color: 'from-cyan-400 to-cyan-600',     bgLight: 'bg-cyan-50',   textColor: 'text-cyan-600' },
      HAMSTER: { emoji: '🐹', label: 'Hamster', color: 'from-amber-400 to-amber-600',   bgLight: 'bg-amber-50',  textColor: 'text-amber-600' },
      RABBIT:  { emoji: '🐰', label: 'Thỏ',    color: 'from-purple-400 to-purple-600', bgLight: 'bg-purple-50', textColor: 'text-purple-600' },
      OTHER:   { emoji: '🐾', label: 'Khác',   color: 'from-gray-400 to-gray-600',     bgLight: 'bg-gray-50',   textColor: 'text-gray-600' },
    };

    return (
      <div className="space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SummaryCard icon={MdPets} title="Tổng thú cưng" value={pp.totalPets || 0} color="blue" description="Đăng ký trong hệ thống" />
          <SummaryCard icon={FiClock} title="TB ngày quay lại" value={`${pp.averageReturnDays || 0} ngày`} color="green" description="Chu kỳ chăm sóc trung bình" />
          <SummaryCard icon={FiHeart} title="Khách trung thành" value={(pp.customerRetentions || []).length} color="pink" description="Khách có ≥ 2 lần booking" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pet Type Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MdPets className="text-indigo-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Phân bố giống loài</h3>
                <p className="text-sm text-gray-500">Tỷ lệ theo loại thú cưng</p>
              </div>
            </div>
            <div className="p-6">
              {(pp.petTypeDistribution || []).length === 0 ? (
                <div className="text-center py-8">
                  <MdPets className="mx-auto text-4xl text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Chưa có thú cưng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pp.petTypeDistribution.map((pt, i) => {
                    const cfg = petTypeConfig[pt.petType] || petTypeConfig.OTHER;
                    return (
                      <motion.div
                        key={pt.petType}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className={`w-12 h-12 rounded-xl ${cfg.bgLight} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {cfg.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-gray-900">{cfg.emoji} {cfg.label}</span>
                            <div className="text-right">
                              <span className="text-lg font-extrabold text-gray-800">{pt.count}</span>
                              <span className="text-sm text-gray-400 ml-1">({pt.percentage}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(pt.percentage, 3)}%` }}
                              transition={{ delay: i * 0.1 + 0.3, duration: 0.7, type: 'spring' }}
                              className={`h-3.5 rounded-full bg-gradient-to-r ${cfg.color}`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* VIP Pets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiStar className="text-amber-600 text-lg fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Thú cưng VIP</h3>
                <p className="text-sm text-gray-500">Top chi tiêu dịch vụ cao nhất</p>
              </div>
            </div>
            <div className="p-6">
              {(pp.vipPets || []).length === 0 ? (
                <div className="text-center py-8">
                  <FiStar className="mx-auto text-4xl text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Chưa có dữ liệu VIP</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pp.vipPets.slice(0, 5).map((pet, i) => {
                    const cfg = petTypeConfig[pet.petType] || petTypeConfig.OTHER;
                    const medalBg = i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200' 
                      : i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' 
                      : i === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-400 text-white' 
                      : 'bg-gray-100 text-gray-500';
                    return (
                      <motion.div
                        key={pet.petId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${medalBg}`}>
                          {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                          {cfg.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{pet.petName}</p>
                          <p className="text-xs text-gray-500 truncate">{pet.ownerName} • {pet.breed} • {pet.totalBookings} lần</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-emerald-600">{formatPrice(pet.totalServiceSpending)}</p>
                          <p className="text-xs text-gray-400">dịch vụ</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Retention */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <FiHeart className="text-teal-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chu kỳ chăm sóc (Retention)</h3>
                <p className="text-sm text-gray-500">Trung bình quay lại sau <span className="font-bold text-orange-500">{pp.averageReturnDays || 0} ngày</span></p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {(pp.customerRetentions || []).length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <FiHeart className="text-gray-300 text-3xl" />
                </div>
                <p className="text-gray-500 font-medium">Cần ít nhất 2 lần booking để tính chu kỳ</p>
                <p className="text-gray-400 text-sm mt-1">Dữ liệu sẽ hiển thị khi khách quay lại</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thú cưng</th>
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="pb-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Số lần</th>
                      <th className="pb-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">TB ngày giữa lần</th>
                      <th className="pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lần cuối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pp.customerRetentions.slice(0, 10).map((cr, i) => {
                      const cfg = petTypeConfig[cr.petType] || petTypeConfig.OTHER;
                      return (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 font-semibold text-gray-900">{cr.customerName}</td>
                          <td className="py-4 text-gray-700">{cr.petName}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${cfg.bgLight} ${cfg.textColor} text-xs font-semibold`}>
                              {cfg.emoji} {cfg.label}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-lg font-extrabold text-gray-800">{cr.totalVisits}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                              cr.avgDaysBetweenVisits <= 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              cr.avgDaysBetweenVisits <= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {cr.avgDaysBetweenVisits} ngày
                            </span>
                          </td>
                          <td className="py-4 text-gray-500 text-sm">{cr.lastVisitDate}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

// ==================== SHARED COMPONENTS ====================
const SummaryCard = ({ icon: Icon, title, value, color, description, children }) => {
  const gradients = {
    blue:   'from-blue-500 to-indigo-600',
    green:  'from-emerald-500 to-teal-600',
    yellow: 'from-amber-500 to-orange-500',
    red:    'from-red-500 to-rose-600',
    pink:   'from-pink-500 to-rose-500',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color] || gradients.blue} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="text-white text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-0.5 truncate">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
      <FiBarChart2 className="text-4xl text-gray-300" />
    </div>
    <p className="text-gray-600 text-xl font-bold">{message}</p>
    <p className="text-gray-400 mt-2">Dữ liệu sẽ hiển thị khi có hoạt động trong hệ thống</p>
  </motion.div>
);

export default DashboardPage;
