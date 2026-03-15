import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiTag,
  FiPercent, FiDollarSign, FiCalendar,
  FiCopy, FiGift, FiUsers, FiShoppingCart,
  FiHeart, FiRefreshCw, FiStar,
} from 'react-icons/fi';
import { MdSpa } from 'react-icons/md';
import toast from 'react-hot-toast';
import { vouchersApi } from '../../services/api';

const AdminVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const initialFormData = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscount: '',
    minOrderAmount: '0',
    usageLimit: '',
    usageLimitPerUser: '1',
    startDate: '',
    endDate: '',
    applyTo: 'ALL',
    active: true,
    voucherCategory: 'GENERAL',
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vouchersApi.getAll({ page, size: 10, sort: 'createdAt,desc' });
      setVouchers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      discountType: voucher.discountType,
      discountValue: voucher.discountValue?.toString() || '',
      maxDiscount: voucher.maxDiscount?.toString() || '',
      minOrderAmount: voucher.minOrderAmount?.toString() || '0',
      usageLimit: voucher.usageLimit?.toString() || '',
      usageLimitPerUser: voucher.usageLimitPerUser?.toString() || '1',
      startDate: voucher.startDate ? formatDateTimeForInput(voucher.startDate) : '',
      endDate: voucher.endDate ? formatDateTimeForInput(voucher.endDate) : '',
      applyTo: voucher.applyTo || 'ALL',
      active: voucher.active,
      voucherCategory: voucher.voucherCategory || 'GENERAL',
    });
    setShowModal(true);
  };

  const formatDateTimeForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        minOrderAmount: parseFloat(formData.minOrderAmount || '0'),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        usageLimitPerUser: parseInt(formData.usageLimitPerUser || '1'),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      if (editingVoucher) {
        await vouchersApi.update(editingVoucher.id, payload);
        toast.success('Cập nhật voucher thành công!');
      } else {
        await vouchersApi.create(payload);
        toast.success('Tạo voucher thành công!');
      }
      setShowModal(false);
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await vouchersApi.delete(id);
      toast.success('Đã xoá voucher');
      setDeleteConfirm(null);
      fetchVouchers();
    } catch (err) {
      toast.error('Không thể xoá voucher');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép: ${code}`);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusInfo = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);
    if (!voucher.active) return { label: 'Vô hiệu', color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
    if (now < start) return { label: 'Chưa bắt đầu', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400' };
    if (now > end) return { label: 'Hết hạn', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' };
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return { label: 'Hết lượt', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' };
    return { label: 'Đang hoạt động', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' };
  };

  const getApplyToLabel = (applyTo) => {
    return { ALL: 'Tất cả', PRODUCTS: 'Sản phẩm', SERVICES: 'Dịch vụ' }[applyTo] || applyTo;
  };

  const getApplyToIcon = (applyTo) => {
    if (applyTo === 'PRODUCTS') return <FiShoppingCart className="text-blue-500" />;
    if (applyTo === 'SERVICES') return <MdSpa className="text-violet-500" />;
    return <FiGift className="text-orange-500" />;
  };

  const getCategoryInfo = (category) => {
    const map = {
      GENERAL: { label: 'Chung', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FiTag size={12} /> },
      WELCOME: { label: 'Chào mừng', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <FiStar size={12} /> },
      SERVICE: { label: 'Dịch vụ', color: 'bg-violet-50 text-violet-700 border-violet-200', icon: <MdSpa size={12} /> },
      LOYALTY: { label: 'Tri ân', color: 'bg-pink-50 text-pink-700 border-pink-200', icon: <FiHeart size={12} /> },
      RECURRING: { label: 'Định kỳ', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: <FiRefreshCw size={12} /> },
    };
    return map[category] || map.GENERAL;
  };

  const filteredVouchers = vouchers.filter(v =>
    v.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Voucher</h1>
          <p className="text-gray-500 mt-1">Tạo và quản lý mã giảm giá cho khách hàng</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
        >
          <FiPlus className="text-lg" />
          Tạo Voucher
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Voucher List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200" />
            <div className="absolute top-0 w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <FiTag className="mx-auto text-5xl text-gray-200 mb-4" />
          <p className="text-xl font-bold text-gray-600">
            {searchTerm ? 'Không tìm thấy voucher phù hợp' : 'Chưa có voucher nào'}
          </p>
          <p className="text-gray-400 mt-2">
            {searchTerm ? 'Thử tìm kiếm với từ khoá khác' : 'Tạo voucher đầu tiên ngay!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredVouchers.map((voucher, i) => {
            const status = getStatusInfo(voucher);
            return (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Code & Discount */}
                  <div className="flex items-center gap-5 p-6 lg:w-80 lg:border-r border-gray-50 bg-gradient-to-br from-gray-50 to-white">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      voucher.discountType === 'PERCENTAGE'
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      {voucher.discountType === 'PERCENTAGE' ? (
                        <FiPercent className="text-white text-2xl" />
                      ) : (
                        <FiDollarSign className="text-white text-2xl" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-gray-900 tracking-wide font-mono">{voucher.code}</h3>
                        <button onClick={() => copyCode(voucher.code)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Sao chép mã">
                          <FiCopy size={14} />
                        </button>
                      </div>
                      <p className="text-2xl font-extrabold mt-1">
                        {voucher.discountType === 'PERCENTAGE' ? (
                          <span className="text-violet-600">Giảm {voucher.discountValue}%</span>
                        ) : (
                          <span className="text-emerald-600">{formatPrice(voucher.discountValue)}</span>
                        )}
                      </p>
                      {voucher.maxDiscount && voucher.discountType === 'PERCENTAGE' && (
                        <p className="text-xs text-gray-500 mt-0.5">Tối đa {formatPrice(voucher.maxDiscount)}</p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 p-6">
                    {voucher.description && (
                      <p className="text-gray-600 text-sm mb-3">{voucher.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiCalendar size={14} />
                        <span>{formatDate(voucher.startDate)} — {formatDate(voucher.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiUsers size={14} />
                        <span>
                          Đã dùng: <span className="font-bold text-gray-700">{voucher.usedCount || 0}</span>
                          {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ' (Không giới hạn)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        {getApplyToIcon(voucher.applyTo)}
                        <span>{getApplyToLabel(voucher.applyTo)}</span>
                      </div>
                      {voucher.voucherCategory && voucher.voucherCategory !== 'GENERAL' && (() => {
                        const catInfo = getCategoryInfo(voucher.voucherCategory);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${catInfo.color}`}>
                            {catInfo.icon}
                            {catInfo.label}
                          </span>
                        );
                      })()}
                      {voucher.minOrderAmount > 0 && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <FiShoppingCart size={14} />
                          <span>Đơn tối thiểu: {formatPrice(voucher.minOrderAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center gap-3 p-6 lg:border-l border-gray-50">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(voucher)}
                      className="p-2.5 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors"
                      title="Chỉnh sửa"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(voucher.id)}
                      className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                      title="Xoá"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                page === i
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <FiTrash2 className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xoá voucher?</h3>
              <p className="text-gray-500 mb-6">Hành động này không thể hoàn tác</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Xoá
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                    <FiTag className="text-white text-lg" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <FiX className="text-gray-500 text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Row 1: Code & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mã Voucher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VD: SALE10, NEWYEAR2026"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none font-mono text-lg tracking-wider uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                          formData.discountType === 'PERCENTAGE'
                            ? 'border-violet-400 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <FiPercent /> Giảm %
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'FIXED_AMOUNT' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                          formData.discountType === 'FIXED_AMOUNT'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <FiDollarSign /> Số tiền
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả voucher..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                  />
                </div>

                {/* Row 2: Value & Max Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Giá trị giảm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        placeholder={formData.discountType === 'PERCENTAGE' ? 'VD: 10' : 'VD: 50000'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none pr-12"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        {formData.discountType === 'PERCENTAGE' ? '%' : 'VNĐ'}
                      </span>
                    </div>
                  </div>
                  {formData.discountType === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Giảm tối đa</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                          placeholder="VD: 100000"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">VNĐ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Min Order & Apply To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Đơn hàng tối thiểu</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">VNĐ</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Áp dụng cho</label>
                    <select
                      value={formData.applyTo}
                      onChange={(e) => setFormData({ ...formData, applyTo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none bg-white"
                    >
                      <option value="ALL">Tất cả (Sản phẩm + Dịch vụ)</option>
                      <option value="PRODUCTS">Chỉ sản phẩm</option>
                      <option value="SERVICES">Chỉ dịch vụ</option>
                    </select>
                  </div>
                </div>

                {/* Voucher Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Loại voucher chiến lược</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { value: 'GENERAL', label: 'Chung', icon: <FiTag size={14} />, desc: 'Voucher thông thường' },
                      { value: 'WELCOME', label: 'Chào mừng', icon: <FiStar size={14} />, desc: 'Cho khách hàng mới' },
                      { value: 'SERVICE', label: 'Dịch vụ', icon: <MdSpa size={14} />, desc: 'Giảm giá dịch vụ' },
                      { value: 'LOYALTY', label: 'Tri ân', icon: <FiHeart size={14} />, desc: 'Sinh nhật thú cưng' },
                      { value: 'RECURRING', label: 'Định kỳ', icon: <FiRefreshCw size={14} />, desc: 'Nhắc mua lại' },
                    ].map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, voucherCategory: cat.value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          formData.voucherCategory === cat.value
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Usage Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tổng lượt sử dụng</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="Không giới hạn"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giới hạn / Khách hàng</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimitPerUser}
                      onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                    />
                  </div>
                </div>

                {/* Row 5: Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      formData.active ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.active ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                  <div>
                    <p className="font-semibold text-gray-800">{formData.active ? 'Đang hoạt động' : 'Vô hiệu'}</p>
                    <p className="text-xs text-gray-500">Voucher {formData.active ? 'có thể sử dụng ngay' : 'sẽ không thể áp dụng'}</p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingVoucher ? 'Cập nhật' : 'Tạo Voucher'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVouchersPage;
