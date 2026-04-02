import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiX, FiChevronLeft, FiChevronRight, FiCheck,
  FiSend, FiDownload, FiXCircle, FiTrash2, FiEye,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { purchaseOrdersApi, suppliersApi, productsApi } from '../../services/api';

const STATUS_MAP = {
  DRAFT: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700' },
  RECEIVED: { label: 'Đã nhận hàng', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-600' },
};

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const AdminPurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm] = useState({ supplierId: '', note: '', items: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage - 1, size: 15 };
      const res = statusFilter
        ? await purchaseOrdersApi.getByStatus(statusFilter, params)
        : await purchaseOrdersApi.getAll(params);
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch { toast.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  }, [currentPage, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadFormData = async () => {
    try {
      const [suppRes, prodRes] = await Promise.all([
        suppliersApi.getActive(),
        productsApi.getAllAdmin({ page: 0, size: 200 }),
      ]);
      setSuppliers(suppRes.data);
      setProducts(prodRes.data.content || prodRes.data);
    } catch { toast.error('Không thể tải dữ liệu form'); }
  };

  const openCreate = async () => {
    await loadFormData();
    setForm({ supplierId: '', note: '', items: [{ variantId: '', quantity: 1, unitPrice: '' }] });
    setModalOpen(true);
  };

  const allVariants = products.flatMap(p =>
    (p.variants || []).map(v => ({ ...v, productName: p.name }))
  );

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { variantId: '', quantity: 1, unitPrice: '' }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => setForm(f => ({
    ...f,
    items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
  }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.supplierId || form.items.length === 0 || form.items.some(i => !i.variantId)) {
      toast.error('Vui lòng điền đủ thông tin'); return;
    }
    setSubmitting(true);
    try {
      await purchaseOrdersApi.create({
        supplierId: Number(form.supplierId),
        note: form.note,
        items: form.items.map(i => ({ variantId: Number(i.variantId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      });
      toast.success('Đã tạo phiếu nhập kho');
      setModalOpen(false);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Tạo thất bại'); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (id, action, label) => {
    if (!window.confirm(`Bạn có chắc muốn ${label}?`)) return;
    try {
      await purchaseOrdersApi[action](id);
      toast.success(`Đã ${label}`);
      fetchOrders();
      if (detailModal?.id === id) {
        const res = await purchaseOrdersApi.getById(id);
        setDetailModal(res.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa phiếu nhập này?')) return;
    try { await purchaseOrdersApi.delete(id); toast.success('Đã xóa'); fetchOrders(); }
    catch (err) { toast.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  if (loading && orders.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phiếu nhập kho</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Tạo phiếu nhập</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        {['', ...Object.keys(STATUS_MAP)].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === s ? 'bg-petshop-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s ? STATUS_MAP[s].label : 'Tất cả'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mã phiếu</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Nhà cung cấp</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Không có phiếu nhập nào</td></tr>
              ) : orders.map((o, idx) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-800">{o.code}</td>
                  <td className="px-6 py-4 text-gray-700">{o.supplierName}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatPrice(o.totalAmount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[o.status]?.color}`}>{STATUS_MAP[o.status]?.label}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailModal(o)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Chi tiết"><FiEye className="w-4 h-4" /></button>
                      {o.status === 'DRAFT' && <button onClick={() => handleAction(o.id, 'submit', 'gửi duyệt')} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Gửi duyệt"><FiSend className="w-4 h-4" /></button>}
                      {o.status === 'PENDING' && <button onClick={() => handleAction(o.id, 'approve', 'duyệt phiếu')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Duyệt"><FiCheck className="w-4 h-4" /></button>}
                      {o.status === 'APPROVED' && <button onClick={() => handleAction(o.id, 'receive', 'nhận hàng vào kho')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Nhận hàng"><FiDownload className="w-4 h-4" /></button>}
                      {!['RECEIVED', 'CANCELLED'].includes(o.status) && <button onClick={() => handleAction(o.id, 'cancel', 'hủy phiếu')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Hủy"><FiXCircle className="w-4 h-4" /></button>}
                      {['DRAFT', 'CANCELLED'].includes(o.status) && <button onClick={() => handleDelete(o.id)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg" title="Xóa"><FiTrash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><FiChevronLeft /></button>
            <span className="text-sm text-gray-500">Trang {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><FiChevronRight /></button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Tạo phiếu nhập kho</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp *</label>
                  <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} className="input-field" required>
                    <option value="">Chọn NCC</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input-field" rows={2} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Sản phẩm nhập</label>
                    <button type="button" onClick={addItem} className="text-sm text-petshop-orange hover:underline flex items-center gap-1"><FiPlus className="w-3 h-3" /> Thêm dòng</button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
                        <div className="flex-1">
                          <select value={item.variantId} onChange={e => updateItem(idx, 'variantId', e.target.value)} className="input-field text-sm" required>
                            <option value="">Chọn sản phẩm</option>
                            {allVariants.map(v => <option key={v.id} value={v.id}>{v.productName} - {v.name} {v.sku ? `(${v.sku})` : ''}</option>)}
                          </select>
                        </div>
                        <div className="w-20">
                          <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="input-field text-sm" min={1} placeholder="SL" required />
                        </div>
                        <div className="w-32">
                          <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="input-field text-sm" min={0} placeholder="Đơn giá" required />
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600 mt-1"><FiX /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiPlus /> Tạo phiếu nhập</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Phiếu {detailModal.code}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[detailModal.status]?.color}`}>{STATUS_MAP[detailModal.status]?.label}</span>
                </div>
                <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">NCC:</span> <span className="font-medium">{detailModal.supplierName}</span></div>
                  <div><span className="text-gray-500">Tổng tiền:</span> <span className="font-bold text-petshop-orange">{formatPrice(detailModal.totalAmount)}</span></div>
                  <div><span className="text-gray-500">Người tạo:</span> {detailModal.createdByName}</div>
                  <div><span className="text-gray-500">Ngày tạo:</span> {formatDate(detailModal.createdAt)}</div>
                  {detailModal.approvedByName && <div><span className="text-gray-500">Duyệt bởi:</span> {detailModal.approvedByName} ({formatDate(detailModal.approvedAt)})</div>}
                  {detailModal.receivedByName && <div><span className="text-gray-500">Nhận bởi:</span> {detailModal.receivedByName} ({formatDate(detailModal.receivedAt)})</div>}
                </div>
                {detailModal.note && <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">{detailModal.note}</div>}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Sản phẩm</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">SL</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Đơn giá</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(detailModal.items || []).map(i => (
                      <tr key={i.id}>
                        <td className="px-4 py-3"><p className="font-medium">{i.productName}</p><p className="text-gray-500">{i.variantName} {i.sku ? `(${i.sku})` : ''}</p></td>
                        <td className="px-4 py-3 text-right">{i.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatPrice(i.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatPrice(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
                {detailModal.status === 'DRAFT' && <button onClick={() => handleAction(detailModal.id, 'submit', 'gửi duyệt')} className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">Gửi duyệt</button>}
                {detailModal.status === 'PENDING' && <button onClick={() => handleAction(detailModal.id, 'approve', 'duyệt phiếu')} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">Duyệt</button>}
                {detailModal.status === 'APPROVED' && <button onClick={() => handleAction(detailModal.id, 'receive', 'nhận hàng vào kho')} className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">Nhận hàng</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPurchaseOrdersPage;
