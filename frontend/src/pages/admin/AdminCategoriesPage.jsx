import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiChevronRight, FiChevronDown, 
  FiFolder, FiFolderPlus, FiImage, FiSave, FiX 
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../services/api';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    parentId: null,
    petType: 'ALL',
    displayOrder: 0,
    active: true,
  });

  const petTypes = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'DOG', label: 'Chó' },
    { value: 'CAT', label: 'Mèo' },
    { value: 'BIRD', label: 'Chim' },
    { value: 'FISH', label: 'Cá' },
    { value: 'OTHER', label: 'Khác' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getTree();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const getAllIds = (cats) => {
      let ids = [];
      cats.forEach(cat => {
        ids.push(cat.id);
        if (cat.children) {
          ids = [...ids, ...getAllIds(cat.children)];
        }
      });
      return ids;
    };
    setExpandedIds(new Set(getAllIds(categories)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleAdd = (parentId = null) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      parentId: parentId,
      petType: 'ALL',
      displayOrder: 0,
      active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      parentId: category.parentId,
      petType: category.petType || 'ALL',
      displayOrder: category.displayOrder || 0,
      active: category.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try {
        await categoriesApi.delete(id);
        toast.success('Đã xóa danh mục');
        fetchCategories();
      } catch (error) {
        toast.error('Không thể xóa danh mục');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoriesApi.create(formData);
        toast.success('Đã thêm danh mục');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const getAllCategoriesFlat = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...getAllCategoriesFlat(cat.children, level + 1)];
      }
    });
    return result;
  };

  const CategoryNode = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    
    return (
      <div className="select-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 group ${
            level > 0 ? 'ml-6 border-l-2 border-gray-200' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse button */}
          <button
            onClick={() => hasChildren && toggleExpand(category.id)}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              hasChildren ? 'hover:bg-gray-200 cursor-pointer' : 'cursor-default'
            }`}
          >
            {hasChildren ? (
              isExpanded ? <FiChevronDown /> : <FiChevronRight />
            ) : (
              <span className="w-4 h-4"></span>
            )}
          </button>
          
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            hasChildren ? 'bg-petshop-green/10 text-petshop-green' : 'bg-petshop-orange/10 text-petshop-orange'
          }`}>
            {category.imageUrl ? (
              <img src={category.imageUrl} alt={category.name} className="w-8 h-8 rounded object-cover" />
            ) : (
              hasChildren ? <FiFolder size={20} /> : <MdPets size={20} />
            )}
          </div>
          
          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 truncate">{category.name}</span>
              {category.petType && category.petType !== 'ALL' && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                  {petTypes.find(p => p.value === category.petType)?.label}
                </span>
              )}
              {!category.active && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                  Ẩn
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {category.productCount || 0} sản phẩm
              {hasChildren && ` • ${category.children.length} danh mục con`}
            </div>
          </div>
          
          {/* Actions */}
          <div className="hidden group-hover:flex items-center gap-1">
            <button
              onClick={() => handleAdd(category.id)}
              className="p-2 text-gray-500 hover:text-petshop-green hover:bg-green-50 rounded-lg"
              title="Thêm danh mục con"
            >
              <FiFolderPlus size={18} />
            </button>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-gray-500 hover:text-petshop-orange hover:bg-orange-50 rounded-lg"
              title="Chỉnh sửa"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
              title="Xóa"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </motion.div>
        
        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.children.map(child => (
                <CategoryNode key={child.id} category={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          <p className="text-gray-500 mt-1">Quản lý danh mục sản phẩm theo cấu trúc cây</p>
        </div>
        <button 
          onClick={() => handleAdd(null)} 
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Thêm danh mục gốc
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={expandAll}
            className="text-sm text-petshop-green hover:underline"
          >
            Mở rộng tất cả
          </button>
          <button
            onClick={collapseAll}
            className="text-sm text-gray-500 hover:underline"
          >
            Thu gọn tất cả
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">
            {categories.length} danh mục gốc
          </span>
        </div>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FiFolder className="mx-auto text-gray-300 w-16 h-16 mb-4" />
            <p className="text-gray-500">Chưa có danh mục nào</p>
            <button
              onClick={() => handleAdd(null)}
              className="mt-4 btn-primary"
            >
              Thêm danh mục đầu tiên
            </button>
          </div>
        ) : (
          categories.map(cat => (
            <CategoryNode key={cat.id} category={cat} />
          ))
        )}
      </div>

      {/* Modal Form */}
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
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL hình ảnh
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="input-field flex-1"
                      placeholder="https://..."
                    />
                    {formData.imageUrl && (
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục cha
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                    className="input-field"
                  >
                    <option value="">Không có (danh mục gốc)</option>
                    {getAllCategoriesFlat(categories).map(cat => (
                      <option 
                        key={cat.id} 
                        value={cat.id}
                        disabled={editingCategory && cat.id === editingCategory.id}
                      >
                        {'—'.repeat(cat.level)} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại thú cưng
                    </label>
                    <select
                      value={formData.petType}
                      onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                      className="input-field"
                    >
                      {petTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-petshop-green focus:ring-petshop-green border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Hiển thị danh mục
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiSave /> {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                      </>
                    )}
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

export default AdminCategoriesPage;
