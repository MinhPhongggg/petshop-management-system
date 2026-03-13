import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiChevronRight, FiChevronDown, 
  FiFolder, FiFolderPlus, FiSave, FiX, FiSearch,
  FiEye, FiEyeOff, FiPackage, FiTag, FiLayers
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../services/api';

const MAX_LEVEL = 2; // 0, 1, 2 = 3 tầng

const LEVEL_CONFIG = {
  0: {
    label: 'Loại thú cưng',
    addLabel: 'Thêm loại thú cưng',
    addChildLabel: 'Thêm nhóm sản phẩm',
    icon: MdPets,
    bgActive: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    bgInactive: 'bg-gray-200 text-gray-400',
    rowBg: 'bg-white',
    rowBorder: 'border-l-4 border-indigo-500',
    textStyle: 'text-base font-bold text-gray-900',
  },
  1: {
    label: 'Nhóm sản phẩm',
    addLabel: 'Thêm nhóm sản phẩm',
    addChildLabel: 'Thêm loại sản phẩm',
    icon: FiFolder,
    bgActive: 'bg-amber-100 text-amber-600',
    bgInactive: 'bg-gray-100 text-gray-400',
    rowBg: 'bg-gray-50/50',
    rowBorder: 'border-l-4 border-amber-400',
    textStyle: 'text-sm font-semibold text-gray-800',
  },
  2: {
    label: 'Loại sản phẩm',
    addLabel: 'Thêm loại sản phẩm',
    addChildLabel: null,
    icon: FiTag,
    bgActive: 'bg-emerald-100 text-emerald-600',
    bgInactive: 'bg-gray-100 text-gray-400',
    rowBg: 'bg-white',
    rowBorder: 'border-l-4 border-emerald-400',
    textStyle: 'text-sm font-medium text-gray-700',
  },
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [addingLevel, setAddingLevel] = useState(0);
  
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
    { value: 'ALL', label: 'Tất cả', color: 'bg-gray-100 text-gray-700' },
    { value: 'DOG', label: 'Chó', color: 'bg-amber-100 text-amber-700' },
    { value: 'CAT', label: 'Mèo', color: 'bg-purple-100 text-purple-700' },
    { value: 'BIRD', label: 'Chim', color: 'bg-sky-100 text-sky-700' },
    { value: 'FISH', label: 'Cá', color: 'bg-blue-100 text-blue-700' },
    { value: 'OTHER', label: 'Khác', color: 'bg-gray-100 text-gray-600' },
  ];

  const getPetTypeInfo = (value) => petTypes.find(p => p.value === value) || petTypes[0];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAdminTree();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const countAll = (cats, lvl = 0) => {
      let total = 0, active = 0, inactive = 0, products = 0, byLevel = { 0: 0, 1: 0, 2: 0 };
      cats.forEach(cat => {
        total++;
        byLevel[lvl] = (byLevel[lvl] || 0) + 1;
        if (cat.active) active++; else inactive++;
        products += cat.productCount || 0;
        if (cat.children) {
          const sub = countAll(cat.children, lvl + 1);
          total += sub.total;
          active += sub.active;
          inactive += sub.inactive;
          products += sub.products;
          Object.keys(sub.byLevel).forEach(k => {
            byLevel[k] = (byLevel[k] || 0) + sub.byLevel[k];
          });
        }
      });
      return { total, active, inactive, products, byLevel };
    };
    return countAll(categories);
  }, [categories]);

  // Filter logic
  const filterCategories = (cats) => {
    return cats.reduce((acc, cat) => {
      const matchesSearch = !searchTerm || 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || 
        (filterStatus === 'active' ? cat.active : !cat.active);
      
      const filteredChildren = cat.children ? filterCategories(cat.children) : [];
      
      if (matchesSearch && matchesStatus) {
        acc.push({ ...cat, children: filteredChildren });
      } else if (filteredChildren.length > 0) {
        acc.push({ ...cat, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm && !filterStatus) return categories;
    return filterCategories(categories);
  }, [categories, searchTerm, filterStatus]);

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

  const handleAdd = (parentId = null, parentLevel = -1) => {
    const newLevel = parentLevel + 1;
    setEditingCategory(null);
    setAddingLevel(newLevel);
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
    // Auto-expand parent
    if (parentId) {
      setExpandedIds(prev => new Set([...prev, parentId]));
    }
  };

  const handleEdit = (category, level) => {
    setEditingCategory(category);
    setAddingLevel(level);
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

  // Get flat categories but only up to maxLevel for parent selection
  const getParentOptions = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      if (level <= MAX_LEVEL - 1) {
        result.push({ ...cat, level });
      }
      if (cat.children && cat.children.length > 0 && level < MAX_LEVEL - 1) {
        result = [...result, ...getParentOptions(cat.children, level + 1)];
      }
    });
    return result;
  };

  const CategoryNode = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[2];
    const canAddChild = level < MAX_LEVEL;
    const IconComponent = config.icon;
    
    return (
      <div>
        {/* Category Row */}
        <div
          className={`group flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all
            ${!category.active ? 'opacity-60' : ''}
            ${config.rowBg} ${level > 0 ? config.rowBorder : 'border-l-4 border-indigo-500'}
            hover:shadow-sm`}
          style={{ paddingLeft: `${level * 32 + 16}px` }}
        >
          {/* Expand/Collapse */}
          <button
            onClick={() => hasChildren && toggleExpand(category.id)}
            className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md transition-colors
              ${hasChildren 
                ? 'hover:bg-gray-200 text-gray-600 cursor-pointer' 
                : 'text-gray-300 cursor-default'}`}
          >
            {hasChildren ? (
              isExpanded 
                ? <FiChevronDown size={16} /> 
                : <FiChevronRight size={16} />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            )}
          </button>
          
          {/* Icon */}
          <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center
            ${category.active ? config.bgActive : config.bgInactive}`}
          >
            {category.imageUrl ? (
              <img src={category.imageUrl} alt="" className="w-7 h-7 rounded object-cover" />
            ) : (
              <IconComponent size={level === 0 ? 20 : 16} />
            )}
          </div>
          
          {/* Name & Breadcrumb */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`truncate ${category.active ? config.textStyle : 'text-gray-400 line-through text-sm'}`}>
                {category.name}
              </span>
              {level === 0 && category.petType && category.petType !== 'ALL' && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPetTypeInfo(category.petType).color}`}>
                  {getPetTypeInfo(category.petType).label}
                </span>
              )}
              {/* Level badge */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                ${level === 0 ? 'bg-indigo-100 text-indigo-600' : level === 1 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                T{level + 1}
              </span>
            </div>
            {category.description && (
              <p className="text-xs text-gray-400 truncate mt-0.5 max-w-md">{category.description}</p>
            )}
          </div>

          {/* Product count - only meaningful for leaf or level 2 */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 min-w-[70px]">
            <FiPackage size={14} className="text-gray-400" />
            <span>{category.productCount || 0}</span>
          </div>

          {/* Children count */}
          {hasChildren && (
            <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 min-w-[50px]">
              <FiLayers size={14} className="text-gray-400" />
              <span>{category.children.length}</span>
            </div>
          )}
          {!hasChildren && <div className="hidden md:block min-w-[50px]"></div>}

          {/* Status */}
          <div className="min-w-[56px] flex justify-center">
            {category.active ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                <FiEye size={11} /> Hiện
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">
                <FiEyeOff size={11} /> Ẩn
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {canAddChild && (
              <button
                onClick={() => handleAdd(category.id, level)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title={config.addChildLabel}
              >
                <FiFolderPlus size={15} />
              </button>
            )}
            <button
              onClick={() => handleEdit(category, level)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Chỉnh sửa"
            >
              <FiEdit2 size={15} />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Xóa"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>
        
        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.children.map((child) => (
                <CategoryNode 
                  key={child.id} 
                  category={child} 
                  level={level + 1}
                />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          <p className="text-gray-500 mt-1">Cấu trúc 3 tầng: Loại thú cưng → Nhóm sản phẩm → Loại sản phẩm</p>
        </div>
        <button 
          onClick={() => handleAdd(null, -1)} 
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <FiPlus size={18} /> Thêm loại thú cưng
        </button>
      </div>

      {/* Level Legend + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map(lvl => {
          const config = LEVEL_CONFIG[lvl];
          const IconComp = config.icon;
          return (
            <div key={lvl} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${lvl === 0 ? 'bg-indigo-100 text-indigo-600' : lvl === 1 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <IconComp size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                      ${lvl === 0 ? 'bg-indigo-100 text-indigo-600' : lvl === 1 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      Tầng {lvl + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.byLevel[lvl] || 0}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            >
              <option value="">Trạng thái</option>
              <option value="active">Đang hiện</option>
              <option value="inactive">Đang ẩn</option>
            </select>

            {(searchTerm || filterStatus) && (
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
                className="text-sm text-red-500 hover:text-red-700 px-2 py-1"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Expand/Collapse */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={expandAll}
              className="text-sm px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Mở tất cả
            </button>
            <button
              onClick={collapseAll}
              className="text-sm px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Thu gọn
            </button>
          </div>
        </div>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="w-7 flex-shrink-0"></div>
          <div className="w-9 flex-shrink-0"></div>
          <div className="flex-1">Tên danh mục</div>
          <div className="hidden sm:block min-w-[70px]">Sản phẩm</div>
          <div className="hidden md:block min-w-[50px]">Con</div>
          <div className="min-w-[56px] text-center">Trạng thái</div>
          <div className="w-[90px]"></div>
        </div>

        {/* Tree Content */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <MdPets className="text-indigo-300" size={28} />
            </div>
            <p className="text-gray-500 font-medium">
              {searchTerm || filterStatus 
                ? 'Không tìm thấy danh mục phù hợp' 
                : 'Chưa có danh mục nào'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Bắt đầu bằng cách thêm loại thú cưng (VD: Chó, Mèo)</p>
            {!searchTerm && !filterStatus && (
              <button
                onClick={() => handleAdd(null, -1)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <FiPlus size={16} /> Thêm loại thú cưng đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredCategories.map((cat) => (
              <CategoryNode key={cat.id} category={cat} />
            ))}
          </div>
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
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-800">
                        {editingCategory ? 'Chỉnh sửa' : LEVEL_CONFIG[addingLevel]?.addLabel || 'Thêm danh mục'}
                      </h2>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                        ${addingLevel === 0 ? 'bg-indigo-100 text-indigo-600' : addingLevel === 1 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        Tầng {addingLevel + 1}
                      </span>
                    </div>
                    {formData.parentId && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Thuộc: {getParentOptions(categories).find(c => c.id === formData.parentId)?.name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tên {LEVEL_CONFIG[addingLevel]?.label?.toLowerCase() || 'danh mục'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                    placeholder={
                      addingLevel === 0 ? 'VD: Chó, Mèo, Chim...' :
                      addingLevel === 1 ? 'VD: Thức ăn, Đồ chơi, Phụ kiện...' :
                      'VD: Thức ăn hạt, Thức ăn ướt...'
                    }
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm resize-none"
                    rows={2}
                    placeholder="Mô tả ngắn"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL hình ảnh
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                      <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent Category - only show for level 1 and 2 */}
                {addingLevel > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Danh mục cha
                    </label>
                    <select
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
                    >
                      <option value="">— Chọn danh mục cha —</option>
                      {getParentOptions(categories).map(cat => (
                        <option 
                          key={cat.id} 
                          value={cat.id}
                          disabled={editingCategory && cat.id === editingCategory.id}
                        >
                          {'  '.repeat(cat.level)}{cat.level > 0 ? '└ ' : ''}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Pet Type - primarily for root level */}
                {addingLevel === 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Loại thú cưng
                    </label>
                    <select
                      value={formData.petType}
                      onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
                    >
                      {petTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Display Order */}
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                    min={0}
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hiển thị danh mục</p>
                    <p className="text-xs text-gray-500">Ẩn sẽ không hiển thị trên trang chủ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${formData.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                      ${formData.active ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiSave size={16} /> {editingCategory ? 'Cập nhật' : 'Thêm mới'}
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
