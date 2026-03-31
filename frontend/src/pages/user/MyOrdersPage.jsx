import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage } from 'react-icons/fi';
import { ordersApi } from '../../services/api';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders(true);

    const refreshOnFocus = () => fetchOrders();
    const intervalId = setInterval(() => {
      if (!document.hidden) fetchOrders();
    }, 15000);

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, []);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await ordersApi.getMyOrders();
      const data = response.data;
      const content = Array.isArray(data) ? data : data?.content;
      setOrders(content || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalized = (status || '').toUpperCase();
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      PROCESSING: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Đang chuẩn bị' },
      SHIPPING: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang giao' },
      DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã giao' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
    };
    const config = statusConfig[normalized] || statusConfig.PENDING;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Không có đơn hàng</h3>
          <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-800">
                    {order.orderCode || order.orderNumber || `#${order.id}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {order.createdAt ? formatDate(order.createdAt) : ''}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center justify-between p-4">
                <span className="text-gray-500">Tổng tiền</span>
                <span className="text-xl font-bold text-petshop-orange">
                  {formatPrice(order.totalAmount || 0)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
