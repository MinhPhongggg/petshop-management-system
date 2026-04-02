import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiX, FiChevronLeft, FiChevronRight, FiCheck, FiPlay,
  FiXCircle, FiTrash2, FiEye, FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { stockAuditsApi, productsApi } from '../../services/api';

const STATUS_MAP = {
  DRAFT: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'Đang kiểm', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Hoàn tất', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-600' },
};

const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const AdminStockAuditPage = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [products, setProducts] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [createForm, setCreateForm] = useState({ note: '', variantIds: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockAuditsApi.getAll({ page: currentPage - 1, size: 15 });
      setAudits(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch { toast.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  }, [currentPage]);

  useEffect(() => { fetchAudits(); }, [fetchAudits]);

  const allVariants = products.flatMap(p => (p.variants || []).map(v => ({ ...v, productName: p.name })));

  const openCreate = async () => {
    try {
      const res = await productsApi.getAllAdmin({ page: 0, size: 200 });
      setProducts(res.data.content || res.data);
      setCreateForm({ note: '', variantIds: [] });
      setCreateModal(true);
    } catch { toast.error('Không thể tải sản phẩm'); }
  };

  const toggleVariant = (id) => setCreateForm(f => ({
    ...f, variantIds: f.variantIds.includes(id) ? f.variantIds.filter(v => v !== id) : [...f.variantIds, id]
  }));

  const selectAll = () => setCreateForm(f => ({ ...f, variantIds: allVariants.map(v => v.id) }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (createForm.variantIds.length === 0) { toast.error('Chọn ít nhất 1 sản phẩm'); return; }
    setSubmitting(true);
    try {
      await stockAuditsApi.create({
        note: createForm.note,
        items: createForm.variantIds.map(id => ({ variantId: id })),
      });
      toast.success('Đã tạo phiếu kiểm kê');
      setCreateModal(false);
      fetchAudits();
    } catch (err) { toast.error(err.response?.data?.message || 'Tạo thất bại'); }
    finally { setSubmitting(false); }
  };

  const openDetail = async (audit) => {
    try {
      const res = await stockAuditsApi.getById(audit.id);
      setDetailModal(res.data);
    } catch { toast.error('Không thể tải chi tiết'); }
  };

  const handleAction = async (id, action, label) => {
    if (!window.confirm(`Bạn có chắc muốn ${label}?`)) return;
    try {
      await stockAuditsApi[action](id);
      toast.success(`Đã ${label}`);
      fetchAudits();
      if (detailModal?.id === id) { const res = await stockAuditsApi.getById(id); setDetailModal(res.data); }
    } catch (err) { toast.error(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const updateActualQty = (variantId, value) => {
    if (!detailModal) return;
    setDetailModal(d => ({
      ...d, items: d.items.map(i =>
        i.variantId === variantId ? { ...i, actualQuantity: value === '' ? null : Number(value), difference: (value === '' ? 0 : Number(value)) - i.systemQuantity } : i
      )
    }));
  };

  const saveCounts = async () => {
    try {
      const res = await stockAuditsApi.updateCounts(detailModal.id, {
        items: detailModal.items.map(i => ({ variantId: i.variantId, actualQuantity: i.actualQuantity, note: i.note })),
      });
      setDetailModal(res.data);
      toast.success('Đã lưu số liệu');
    } catch (err) { toast.error(err.response?.data?.message || 'Lưu thất bại'); }
  };

  if (loading && audits.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kiểm kê kho</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Tạo phiếu kiểm kê</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mã phiếu</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">SP kiểm</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Chênh lệch</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {audits.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Chưa có phiếu kiểm kê</td></tr>
              ) : audits.map((a, idx) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium">{a.code}</td>
                  <td className="px-6 py-4 text-center">{a.totalItems}</td>
                  <td className="px-6 py-4 text-center">
                    {a.diffItems > 0 ? <span className="text-red-500 font-medium flex items-center justify-center gap-1"><FiAlertTriangle className="w-3 h-3" />{a.diffItems}</span> : <span className="text-green-600">0</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[a.status]?.color}`}>{STATUS_MAP[a.status]?.label}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(a.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetail(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEye className="w-4 h-4" /></button>
                      {a.status === 'DRAFT' && <button onClick={() => handleAction(a.id, 'start', 'bắt đầu kiểm kê')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiPlay className="w-4 h-4" /></button>}
                      {a.status === 'IN_PROGRESS' && <button onClick={() => handleAction(a.id, 'complete', 'hoàn tất và cập nhật tồn kho')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><FiCheck className="w-4 h-4" /></button>}
                      {!['COMPLETED', 'CANCELLED'].includes(a.status) && <button onClick={() => handleAction(a.id, 'cancel', 'hủy phiếu')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiXCircle className="w-4 h-4" /></button>}
                      {['DRAFT', 'CANCELLED'].includes(a.status) && <button onClick={() => { if (window.confirm('Xóa phiếu?')) stockAuditsApi.delete(a.id).then(() => { toast.success('Đã xóa'); fetchAudits(); }).catch(() => toast.error('Không thể xóa')); }} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>}
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
        {createModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCreateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Tạo phiếu kiểm kê</h2>
                <button onClick={() => setCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="flex-1 overflow-auto p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label><textarea value={createForm.note} onChange={e => setCreateForm(f => ({ ...f, note: e.target.value }))} className="input-field" rows={2} /></div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Chọn sản phẩm kiểm kê ({createForm.variantIds.length})</label>
                    <button type="button" onClick={selectAll} className="text-sm text-petshop-orange hover:underline">Chọn tất cả</button>
                  </div>
                  <div className="max-h-64 overflow-auto border rounded-xl divide-y">
                    {allVariants.map(v => (
                      <label key={v.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={createForm.variantIds.includes(v.id)} onChange={() => toggleVariant(v.id)} className="rounded text-petshop-orange" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{v.productName} - {v.name}</p>
                          <p className="text-xs text-gray-500">Tồn: {v.stock} {v.sku ? `| SKU: ${v.sku}` : ''}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiPlus /> Tạo phiếu</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail / Count Modal */}
      <AnimatePresence>
        {detailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{detailModal.code}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[detailModal.status]?.color}`}>{STATUS_MAP[detailModal.status]?.label}</span>
                </div>
                <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Sản phẩm</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Hệ thống</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Thực tế</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(detailModal.items || []).map(i => (
                      <tr key={i.id} className={i.difference !== 0 ? 'bg-red-50/50' : ''}>
                        <td className="px-4 py-3"><p className="font-medium">{i.productName}</p><p className="text-gray-500">{i.variantName}</p></td>
                        <td className="px-4 py-3 text-center font-mono">{i.systemQuantity}</td>
                        <td className="px-4 py-3 text-center">
                          {detailModal.status === 'IN_PROGRESS' ? (
                            <input type="number" value={i.actualQuantity ?? ''} onChange={e => updateActualQty(i.variantId, e.target.value)} className="w-20 text-center border rounded-lg px-2 py-1" min={0} />
                          ) : (
                            <span className="font-mono">{i.actualQuantity ?? '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${i.difference > 0 ? 'text-green-600' : i.difference < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {i.difference > 0 ? '+' : ''}{i.difference}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
                {detailModal.status === 'DRAFT' && <button onClick={() => handleAction(detailModal.id, 'start', 'bắt đầu kiểm kê')} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">Bắt đầu</button>}
                {detailModal.status === 'IN_PROGRESS' && (
                  <>
                    <button onClick={saveCounts} className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">Lưu số liệu</button>
                    <button onClick={() => handleAction(detailModal.id, 'complete', 'hoàn tất và cập nhật tồn kho')} className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">Hoàn tất</button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStockAuditPage;
