import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPackage, FiAlertTriangle, FiXCircle, FiPlus,
  FiClock, FiX, FiArrowUp, FiArrowDown, FiRefreshCw, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi, inventoryApi } from '../../services/api';

const TABS = [
  { key: 'all', label: 'Tổng quan kho', icon: FiPackage },
  { key: 'low', label: 'Sắp hết hàng', icon: FiAlertTriangle },
  { key: 'over', label: 'Vượt định mức', icon: FiArrowUp },
  { key: 'out', label: 'Hết hàng', icon: FiXCircle },
  { key: 'expiring', label: 'Sắp hết hạn', icon: FiClock },
];

const MOVEMENT_LABELS = {
  IMPORT: { label: 'Nhập kho', color: 'text-green-600 bg-green-50', icon: FiArrowDown },
  EXPORT_SALE: { label: 'Xuất bán', color: 'text-blue-600 bg-blue-50', icon: FiArrowUp },
  EXPORT_DAMAGE: { label: 'Xuất hủy', color: 'text-red-600 bg-red-50', icon: FiXCircle },
  EXPORT_RETURN_SUPPLIER: { label: 'Trả NCC', color: 'text-purple-600 bg-purple-50', icon: FiArrowUp },
  ADJUST_IN: { label: 'Điều chỉnh tăng', color: 'text-yellow-700 bg-yellow-50', icon: FiArrowDown },
  ADJUST_OUT: { label: 'Điều chỉnh giảm', color: 'text-amber-700 bg-amber-50', icon: FiArrowUp },
};

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const AdminInventoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // All-products tab
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Low/out-of-stock/expiring tabs
  const [lowStock, setLowStock] = useState([]);
  const [overStock, setOverStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [expiring, setExpiring] = useState([]);

  // Modals
  const [stockModal, setStockModal] = useState(null); // { type: 'import'|'export'|'adjust', variant }
  const [historyModal, setHistoryModal] = useState(null); // { variant, movements, page, totalPages }
  const [stockForm, setStockForm] = useState({ quantity: '', note: '', exportType: 'EXPORT_DAMAGE' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAllAdmin({ page: currentPage - 1, size: 20 });
      setProducts(res.data.content || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getLowStock();
      setLowStock(res.data);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOutOfStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getOutOfStock();
      setOutOfStock(res.data);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOverStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getOverStock();
      setOverStock(res.data);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpiring = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getExpiring();
      setExpiring(res.data);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'all') fetchProducts();
    else if (activeTab === 'low') fetchLowStock();
    else if (activeTab === 'over') fetchOverStock();
    else if (activeTab === 'out') fetchOutOfStock();
    else if (activeTab === 'expiring') fetchExpiring();
  }, [activeTab, fetchProducts, fetchLowStock, fetchOverStock, fetchOutOfStock, fetchExpiring]);

  const flattenVariants = (prods) => {
    const result = [];
    prods.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          result.push({
            ...v,
            productName: p.name,
            productImage: p.primaryImage,
            categoryName: p.categoryName,
          });
        });
      }
    });
    return result;
  };

  const allVariants = flattenVariants(products);

  const filterVariants = (list) =>
    list.filter(
      (v) =>
        (v.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const currentVariants =
    activeTab === 'all' ? filterVariants(allVariants) :
    activeTab === 'low' ? filterVariants(lowStock) :
    activeTab === 'over' ? filterVariants(overStock) :
    activeTab === 'out' ? filterVariants(outOfStock) :
    filterVariants(expiring);

  // Stock import / adjust
  const openStockModal = (type, variant) => {
    setStockModal({ type, variant });
    setStockForm({ quantity: '', note: '', exportType: 'EXPORT_DAMAGE' });
  };

  const handleStockSubmit = async () => {
    const qty = parseInt(stockForm.quantity, 10);
    if (!qty || qty === 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ');
      return;
    }
    if (stockModal.type === 'import' && qty < 0) {
      toast.error('Số lượng nhập kho phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        variantId: stockModal.variant.id,
        movementType:
          stockModal.type === 'import'
            ? 'IMPORT'
            : stockModal.type === 'export'
              ? stockForm.exportType
              : qty > 0
                ? 'ADJUST_IN'
                : 'ADJUST_OUT',
        quantity: qty,
        note: stockForm.note || null,
      };

      if (stockModal.type === 'import') {
        await inventoryApi.importStock(payload);
        toast.success(`Đã nhập ${qty} sản phẩm vào kho`);
      } else if (stockModal.type === 'export') {
        await inventoryApi.exportStock(payload);
        toast.success('Đã xuất kho thành công');
      } else {
        await inventoryApi.adjustStock(payload);
        toast.success('Đã điều chỉnh tồn kho');
      }

      setStockModal(null);
      if (activeTab === 'all') fetchProducts();
      else if (activeTab === 'low') fetchLowStock();
      else if (activeTab === 'over') fetchOverStock();
      else fetchOutOfStock();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Movement history
  const openHistory = async (variant, page = 0) => {
    try {
      const res = await inventoryApi.getMovements(variant.id, { page, size: 10 });
      setHistoryModal({
        variant,
        movements: res.data.content || res.data,
        page: (res.data.number ?? page),
        totalPages: res.data.totalPages || 1,
      });
    } catch {
      toast.error('Không thể tải lịch sử');
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">Hết hàng</span>;
    if (stock <= 10) return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Sắp hết</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">Còn hàng</span>;
  };

  // Summary stats
  const totalVariants = allVariants.length;
  const totalStock = allVariants.reduce((s, v) => s + (v.stock || 0), 0);
  const lowCount = allVariants.filter((v) => v.stock > 0 && v.stock <= 10).length;
  const outCount = allVariants.filter((v) => v.stock === 0).length;

  if (loading && currentVariants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý kho hàng</h1>
      </div>

      {/* Summary cards */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng biến thể', value: totalVariants, color: 'from-blue-500 to-blue-600', icon: FiPackage },
            { label: 'Tổng tồn kho', value: totalStock.toLocaleString('vi-VN'), color: 'from-green-500 to-green-600', icon: FiArrowDown },
            { label: 'Sắp hết hàng', value: lowCount, color: 'from-yellow-500 to-yellow-600', icon: FiAlertTriangle },
            { label: 'Hết hàng', value: outCount, color: 'from-red-500 to-red-600', icon: FiXCircle },
          ].map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm opacity-80">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="flex border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchTerm(''); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-petshop-orange text-petshop-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'low' && lowStock.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">{lowStock.length}</span>
              )}
              {tab.key === 'out' && outOfStock.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">{outOfStock.length}</span>
              )}
              {tab.key === 'over' && overStock.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{overStock.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, biến thể, SKU..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Sản phẩm / Biến thể</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giá</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Tồn kho</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentVariants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
                  </td>
                </tr>
              ) : (
                currentVariants.map((v, idx) => (
                  <motion.tr
                    key={`${v.productId || v.id}-${v.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {v.productImage && (
                          <img
                            src={v.productImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{v.productName}</p>
                          <p className="text-sm text-gray-500">{v.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{v.sku || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{formatPrice(v.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${v.stock === 0 ? 'text-red-500' : v.stock <= 10 ? 'text-yellow-600' : 'text-gray-800'}`}>
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{getStockBadge(v.stock)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openStockModal('import', v)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Nhập kho"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStockModal('export', v)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Xuất kho"
                        >
                          <FiArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStockModal('adjust', v)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                          title="Điều chỉnh"
                        >
                          <FiRefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openHistory(v)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Lịch sử"
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (all tab only) */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === p ? 'bg-petshop-orange text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ===== Stock Import/Adjust Modal ===== */}
      <AnimatePresence>
        {stockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setStockModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {stockModal.type === 'import' ? 'Nhập kho' : 'Điều chỉnh tồn kho'}
                </h2>
                <button onClick={() => setStockModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Variant info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-gray-800">{stockModal.variant.productName}</p>
                  <p className="text-sm text-gray-500">{stockModal.variant.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {stockModal.variant.sku && <span className="text-gray-500">SKU: <span className="font-mono">{stockModal.variant.sku}</span></span>}
                    <span className="text-gray-500">Tồn kho: <span className="font-bold text-gray-800">{stockModal.variant.stock}</span></span>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {stockModal.type === 'import' ? 'Số lượng nhập' : stockModal.type === 'export' ? 'Số lượng xuất' : 'Số lượng điều chỉnh'}
                  </label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder={stockModal.type === 'import' ? 'Nhập số lượng (VD: 50)' : stockModal.type === 'export' ? 'Nhập số lượng xuất (VD: 5)' : 'Dương = thêm, Âm = giảm (VD: -5)'}
                    className="input-field"
                    min={stockModal.type === 'import' || stockModal.type === 'export' ? 1 : undefined}
                    autoFocus
                  />
                  {stockModal.type === 'adjust' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Nhập số dương để tăng, số âm để giảm. Tồn kho sau: {stockModal.variant.stock + (parseInt(stockForm.quantity, 10) || 0)}
                    </p>
                  )}
                </div>

                {stockModal.type === 'export' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại xuất kho</label>
                    <select
                      value={stockForm.exportType}
                      onChange={(e) => setStockForm((f) => ({ ...f, exportType: e.target.value }))}
                      className="input-field"
                    >
                      <option value="EXPORT_DAMAGE">Xuất hủy / hàng lỗi</option>
                      <option value="EXPORT_RETURN_SUPPLIER">Trả nhà cung cấp</option>
                    </select>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={stockForm.note}
                    onChange={(e) => setStockForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="Lý do nhập kho / điều chỉnh..."
                    className="input-field"
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleStockSubmit}
                  disabled={submitting || !stockForm.quantity}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50 ${
                    stockModal.type === 'import'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : stockModal.type === 'import' ? (
                    <><FiPlus /> Nhập kho</>
                    ) : stockModal.type === 'export' ? (
                      <><FiArrowUp /> Xuất kho</>
                  ) : (
                    <><FiRefreshCw /> Điều chỉnh</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Movement History Modal ===== */}
      <AnimatePresence>
        {historyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setHistoryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Lịch sử kho</h2>
                  <p className="text-sm text-gray-500">
                    {historyModal.variant.productName} — {historyModal.variant.name}
                  </p>
                </div>
                <button onClick={() => setHistoryModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {historyModal.movements.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Chưa có lịch sử thay đổi</p>
                ) : (
                  <div className="space-y-3">
                    {historyModal.movements.map((m) => {
                      const meta = MOVEMENT_LABELS[m.movementType] || MOVEMENT_LABELS.ADJUSTMENT;
                      const Icon = meta.icon;
                      return (
                        <div key={m.id} className="flex items-start gap-4 p-4 border rounded-xl hover:bg-gray-50">
                          <div className={`p-2 rounded-lg ${meta.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>{meta.label}</span>
                              <span className="text-sm text-gray-400">{formatDate(m.createdAt)}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-700">
                              <span className="font-mono">{m.quantityBefore}</span>
                              <span className="mx-1">&rarr;</span>
                              <span className="font-mono font-bold">{m.quantityAfter}</span>
                              <span className="text-gray-400 ml-2">
                                ({m.movementType === 'IMPORT' || (m.quantityAfter > m.quantityBefore) ? '+' : ''}{m.quantityAfter - m.quantityBefore})
                              </span>
                            </div>
                            {m.note && <p className="text-sm text-gray-500 mt-1">{m.note}</p>}
                            {m.createdByName && <p className="text-xs text-gray-400 mt-1">Bởi: {m.createdByName}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {historyModal.totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openHistory(historyModal.variant, historyModal.page - 1)}
                    disabled={historyModal.page === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="text-sm text-gray-500">
                    Trang {historyModal.page + 1} / {historyModal.totalPages}
                  </span>
                  <button
                    onClick={() => openHistory(historyModal.variant, historyModal.page + 1)}
                    disabled={historyModal.page + 1 >= historyModal.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInventoryPage;
