import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPackage, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { ordersApi, reviewsApi } from "../../services/api";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    orderItem: null,
    productId: null,
    productName: "",
    rating: 5,
    content: "",
  });

  useEffect(() => {
    fetchOrders(true);

    const refreshOnFocus = () => fetchOrders();
    const intervalId = setInterval(() => {
      if (!document.hidden) fetchOrders();
    }, 15000);

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
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
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalized = (status || "").toUpperCase();
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Chờ xác nhận",
      },
      CONFIRMED: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Đã xác nhận",
      },
      PROCESSING: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Đang chuẩn bị",
      },
      SHIPPING: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        label: "Đang giao",
      },
      DELIVERED: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Đã giao - chờ bạn xác nhận",
      },
      COMPLETED: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Hoàn thành",
      },
      CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
    };
    const config = statusConfig[normalized] || statusConfig.PENDING;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleConfirmReceived = async (orderId) => {
    const ok = window.confirm("Xác nhận bạn đã nhận được hàng cho đơn này?");
    if (!ok) return;

    try {
      setConfirmingOrderId(orderId);
      await ordersApi.confirmReceived(orderId);
      toast.success("Đã xác nhận nhận hàng thành công");
      await fetchOrders();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        "Không thể xác nhận nhận hàng";
      toast.error(message);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const canReviewOrder = (status) =>
    String(status || "").toUpperCase() === "COMPLETED";

  const openReviewModal = (item) => {
    const productId = item.productId || item.variant?.productId;
    if (!productId) {
      toast.error("Không tìm thấy sản phẩm để đánh giá");
      return;
    }

    setReviewModal({
      open: true,
      orderItem: item,
      productId,
      productName: item.productName,
      rating: 5,
      content: "",
    });
  };

  const submitReview = async () => {
    if (!reviewModal.orderItem) return;

    try {
      await reviewsApi.create({
        productId: reviewModal.productId,
        orderItemId: reviewModal.orderItem.id,
        rating: reviewModal.rating,
        content: reviewModal.content,
      });
      toast.success("Đánh giá đã gửi, chờ admin duyệt hiển thị.");
      setReviewModal({
        open: false,
        orderItem: null,
        productId: null,
        productName: "",
        rating: 5,
        content: "",
      });
      await fetchOrders();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        "Không thể gửi đánh giá";
      toast.error(message);
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Đơn hàng của tôi
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Không có đơn hàng
          </h3>
          <p className="text-gray-500 mb-6">
            Bạn chưa có đơn hàng nào trong mục này
          </p>
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
                    {order.createdAt ? formatDate(order.createdAt) : ""}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <span className="text-gray-500">Tổng tiền</span>
                  {String(order.status || "").toUpperCase() === "DELIVERED" && (
                    <p className="text-xs text-amber-600 mt-1">
                      Đơn đã giao
                      {order.deliveredAt
                        ? ` lúc ${formatDate(order.deliveredAt)}`
                        : ""}
                      , vui lòng xác nhận đã nhận hàng.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {String(order.status || "").toUpperCase() === "DELIVERED" && (
                    <button
                      type="button"
                      onClick={() => handleConfirmReceived(order.id)}
                      disabled={confirmingOrderId === order.id}
                      className="px-4 py-2 rounded-lg bg-petshop-orange text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {confirmingOrderId === order.id
                        ? "Đang xử lý..."
                        : "Đã nhận hàng"}
                    </button>
                  )}
                  <span className="text-xl font-bold text-petshop-orange">
                    {formatPrice(order.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border rounded-xl px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-sm text-gray-500">
                            {item.variantName}
                          </p>
                        )}
                      </div>
                      {canReviewOrder(order.status) && !item.reviewed && (
                        <button
                          onClick={() => openReviewModal(item)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-petshop-orange text-white rounded-lg hover:opacity-90"
                        >
                          <FiStar /> Đánh giá
                        </button>
                      )}
                      {canReviewOrder(order.status) && item.reviewed && (
                        <span className="text-sm text-green-600 font-medium">
                          Đã đánh giá
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Đánh giá sản phẩm
            </h3>
            <p className="text-gray-600 mb-4">{reviewModal.productName}</p>

            <label className="block text-sm font-medium mb-2">Số sao</label>
            <select
              value={reviewModal.rating}
              onChange={(e) =>
                setReviewModal((prev) => ({
                  ...prev,
                  rating: Number(e.target.value),
                }))
              }
              className="input-field mb-4"
            >
              <option value={5}>5 sao</option>
              <option value={4}>4 sao</option>
              <option value={3}>3 sao</option>
              <option value={2}>2 sao</option>
              <option value={1}>1 sao</option>
            </select>

            <label className="block text-sm font-medium mb-2">
              Nội dung đánh giá
            </label>
            <textarea
              rows={4}
              value={reviewModal.content}
              onChange={(e) =>
                setReviewModal((prev) => ({ ...prev, content: e.target.value }))
              }
              className="input-field w-full mb-4"
              placeholder="Nhập cảm nhận của bạn về sản phẩm..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setReviewModal({
                    open: false,
                    orderItem: null,
                    productId: null,
                    productName: "",
                    rating: 5,
                    content: "",
                  })
                }
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button onClick={submitReview} className="btn-primary">
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
