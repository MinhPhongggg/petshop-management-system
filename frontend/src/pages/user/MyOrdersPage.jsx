import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiEye, FiTruck, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { ordersApi } from '../../services/api';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      // Mock data
      setOrders([
        {
          id: 1,
          orderNumber: 'ORD-2024001',
          createdAt: '2024-01-15T10:30:00',
          status: 'DELIVERED',
          totalAmount: 850000,
          items: [
            { id: 1, productName: 'Royal Canin Adult Dog Food', quantity: 2, price: 350000, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=100' },
            { id: 2, productName: 'Pate cho mèo Whiskas', quantity: 3, price: 50000, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100' },
          ],
        },
        {
          id: 2,
          orderNumber: 'ORD-2024002',
          createdAt: '2024-01-18T14:20:00',
          status: 'SHIPPING',
          totalAmount: 1250000,
          items: [
            { id: 3, productName: 'Lồng vận chuyển thú cưng', quantity: 1, price: 800000, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100' },
          ],
        },
        {
          id: 3,
          orderNumber: 'ORD-2024003',
          createdAt: '2024-01-20T09:15:00',
          status: 'PENDING',
          totalAmount: 450000,
          items: [
            { id: 4, productName: 'Đồ chơi cho chó', quantity: 2, price: 150000, image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=100' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', icon: FiPackage },
    { id: 'PENDING', label: 'Chờ xác nhận', icon: FiClock },
    { id: 'SHIPPING', label: 'Đang giao', icon: FiTruck },
    { id: 'DELIVERED', label: 'Đã giao', icon: FiCheck },
    { id: 'CANCELLED', label: 'Đã hủy', icon: FiX },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đã xác nhận' },
      SHIPPING: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-600', label: 'Đã giao' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-600', label: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Không có đơn hàng</h3>
          <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào trong mục này</p>
          <Link to="/products" className="btn-primary">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-800">{order.orderCode || order.orderNumber}</span>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Order Items */}
              <div className="p-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <img
                      src={item.productImage || item.image}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.productName}</h4>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-petshop-orange">{formatPrice(item.unitPrice || item.price)}</p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                <div className="text-right">
                  <span className="text-gray-500">Tổng tiền: </span>
                  <span className="text-xl font-bold text-petshop-orange">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-petshop-orange text-petshop-orange rounded-xl hover:bg-petshop-orange hover:text-white transition-colors"
                  >
                    <FiEye /> Chi tiết
                  </Link>
                  {order.status === 'DELIVERED' && (
                    <button className="btn-primary">
                      Mua lại
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

export default MyOrdersPage;
