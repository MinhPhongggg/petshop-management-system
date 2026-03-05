import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEye, FiCheck, FiX, FiTruck, FiPackage, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ordersApi } from '../../services/api';

const AdminOrdersPage = ({ pageTitle = 'Quản lý đơn hàng', allowDelete = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const response =
        activeTab === 'all'
          ? await ordersApi.getAll()
          : await ordersApi.getByStatus(activeTab);
      setOrders(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        'Không thể cập nhật trạng thái';
      toast.error(message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!allowDelete) return;
    const ok = window.confirm('Bạn có chắc muốn xoá đơn hàng này không? Hành động không thể hoàn tác.');
    if (!ok) return;

    try {
      await ordersApi.delete(orderId);
      toast.success('Đã xoá đơn hàng');
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('Không thể xoá đơn hàng');
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', icon: FiPackage },
    { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'PROCESSING', label: 'Đang chuẩn bị' },
    { id: 'SHIPPING', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Đã giao' },
    { id: 'COMPLETED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đã xác nhận' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đang chuẩn bị' },
      SHIPPING: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-600', label: 'Đã giao' },
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order =>
    String(order.orderCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(order.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(order.receiverName || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{pageTitle}</h1>

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

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã đơn hàng hoặc tên khách..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mã đơn</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thanh toán</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày đặt</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{order.orderCode}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{order.userName || order.receiverName}</p>
                      <p className="text-sm text-gray-500">{order.userPhone || order.receiverPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-petshop-orange">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.paymentMethod}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <FiEye />
                      </button>
                      {allowDelete && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          title="Xoá đơn"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                            className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg"
                            title="Xác nhận"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            title="Hủy"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                          className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                          title="Đang chuẩn bị"
                        >
                          <FiPackage />
                        </button>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                          className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg"
                          title="Giao hàng"
                        >
                          <FiTruck />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết đơn hàng {selectedOrder.orderCode}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Thông tin khách hàng</h3>
                  <p className="text-gray-600">{selectedOrder.userName || selectedOrder.receiverName}</p>
                  <p className="text-gray-600">{selectedOrder.userPhone || selectedOrder.receiverPhone}</p>
                  <p className="text-gray-600">{selectedOrder.userEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Địa chỉ giao hàng</h3>
                  <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-3">Sản phẩm</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-sm text-gray-500">{item.variantName}</p>
                        )}
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="font-medium text-petshop-orange">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-lg font-medium text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-petshop-orange">
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </div>

              <div className="flex gap-3">
                {selectedOrder.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                      className="flex-1 btn-primary"
                    >
                      Xác nhận đơn
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                      className="flex-1 px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      Hủy đơn
                    </button>
                  </>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                    className="flex-1 btn-primary"
                  >
                    Đang chuẩn bị
                  </button>
                )}

                {selectedOrder.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPING')}
                    className="flex-1 btn-primary"
                  >
                    Giao hàng
                  </button>
                )}
                {selectedOrder.status === 'SHIPPING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    className="flex-1 btn-primary"
                  >
                    Đã giao thành công
                  </button>
                )}
                {allowDelete && (
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    title="Xoá đơn"
                  >
                    Xoá đơn
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

export default AdminOrdersPage;
