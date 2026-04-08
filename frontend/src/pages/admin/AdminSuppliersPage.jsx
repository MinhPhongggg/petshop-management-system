import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiEye, FiEyeOff, FiPhone, FiMail, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { suppliersApi } from '../../services/api';

const EMPTY_FORM = { name: '', contactPerson: '', phone: '', email: '', address: '', taxCode: '', notes: '' };

const AdminSuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [currentPage, searchTerm]); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await suppliersApi.getAll({ keyword: searchTerm || undefined, page: currentPage - 1, size: 15 });
      setSuppliers(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch { toast.error('Không thể tải danh sách nhà cung cấp'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, contactPerson: s.contactPerson || '', phone: s.phone || '', email: s.email || '', address: s.address || '', taxCode: s.taxCode || '', notes: s.notes || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await suppliersApi.update(editing.id, form);
        toast.success('Đã cập nhật nhà cung cấp');
      } else {
        await suppliersApi.create(form);
        toast.success('Đã thêm nhà cung cấp');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Thao tác thất bại'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) return;
    try { await suppliersApi.delete(id); toast.success('Đã xóa'); fetchData(); }
    catch { toast.error('Không thể xóa nhà cung cấp'); }
  };

  const handleToggle = async (s) => {
    try { await suppliersApi.toggleActive(s.id); toast.success(s.active ? 'Đã ẩn' : 'Đã kích hoạt'); fetchData(); }
    catch { toast.error('Thao tác thất bại'); }
  };

  if (loading && suppliers.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý nhà cung cấp</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Thêm NCC</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Tìm theo tên, mã, SĐT..." className="input-field pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mã</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên nhà cung cấp</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Liên hệ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">MST</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Không có dữ liệu</td></tr>
              ) : suppliers.map((s, idx) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{s.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{s.name}</p>
                    {s.contactPerson && <p className="text-sm text-gray-500">{s.contactPerson}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {s.phone && <div className="flex items-center gap-1 text-gray-600"><FiPhone className="w-3 h-3" /> {s.phone}</div>}
                    {s.email && <div className="flex items-center gap-1 text-gray-500"><FiMail className="w-3 h-3" /> {s.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.taxCode || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(s)} className={`p-2 rounded-lg ${s.active ? 'text-green-500 hover:bg-gray-50' : 'text-gray-400 hover:bg-green-50'}`} title={s.active ? 'Ẩn' : 'Kích hoạt'}>
                        {s.active ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(s)} className="p-2 text-gray-500 hover:text-petshop-orange hover:bg-orange-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
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

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà cung cấp *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                    <input type="text" value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                    <input type="text" value={form.taxCode} onChange={e => setForm(f => ({ ...f, taxCode: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" rows={2} />
                </div>
                <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSuppliersPage;
