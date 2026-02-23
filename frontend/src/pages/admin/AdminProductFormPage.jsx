import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiSave, FiPlus, FiTrash2, FiImage, FiChevronRight,
  FiX, FiUpload, FiDollarSign, FiPackage, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi } from '../../services/api';

const AdminProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    basePrice: '',
    salePrice: '',
    featured: false,
    variants: [{ name: '', sku: '', price: '', stock: 0 }],
    images: [{ imageUrl: '', isPrimary: true, sortOrder: 0 }],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getTree();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh mục');
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getById(id);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        basePrice: product.basePrice || '',
        salePrice: product.salePrice || '',
        featured: product.featured || false,
        variants: product.variants?.length > 0 
          ? product.variants.map(v => ({
              id: v.id,
              name: v.name || '',
              sku: v.sku || '',
              price: v.price || '',
              stock: v.stock || 0,
            }))
          : [{ name: '', sku: '', price: '', stock: 0 }],
        images: product.images?.length > 0 
          ? product.images.map(img => ({
              id: img.id,
              imageUrl: img.imageUrl || '',
              isPrimary: img.isPrimary || false,
              sortOrder: img.sortOrder || 0,
            }))
          : [{ imageUrl: '', isPrimary: true, sortOrder: 0 }],
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tạo slug từ tên
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      // Auto-generate slug khi thay đổi name
      ...(name === 'name' && !isEditing ? { slug: generateSlug(value) } : {}),
    }));

    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Variants handlers
  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', sku: '', price: '', stock: 0 }],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    }
  };

  // Images handlers
  const handleImageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => {
        if (field === 'isPrimary' && value === true) {
          // Chỉ cho phép 1 ảnh primary
          return i === index ? { ...img, isPrimary: true } : { ...img, isPrimary: false };
        }
        return i === index ? { ...img, [field]: value } : img;
      }),
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { imageUrl: '', isPrimary: false, sortOrder: prev.images.length }],
    }));
  };

  const removeImage = (index) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  // Category tree handlers
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Flatten categories for display
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({
        ...cat,
        level,
        displayName: level > 0 ? `${'  '.repeat(level)}└ ${cat.name}` : cat.name,
      });
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...flattenCategories(cat.children, level + 1)];
      }
    });
    return result;
  };

  const flattenedCategories = flattenCategories(categories);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug là bắt buộc';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục';
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Giá gốc phải lớn hơn 0';
    }

    // Validate variants
    const validVariants = formData.variants.filter(v => v.name.trim());
    if (validVariants.length === 0) {
      newErrors.variants = 'Cần ít nhất 1 biến thể';
    } else {
      validVariants.forEach((v, i) => {
        if (!v.price || parseFloat(v.price) <= 0) {
          newErrors[`variant_${i}_price`] = 'Giá biến thể phải lớn hơn 0';
        }
      });
    }

    // Validate images
    const validImages = formData.images.filter(img => img.imageUrl.trim());
    if (validImages.length === 0) {
      newErrors.images = 'Cần ít nhất 1 ảnh sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId),
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        featured: formData.featured,
        variants: formData.variants
          .filter(v => v.name.trim())
          .map(v => ({
            ...(v.id ? { id: v.id } : {}),
            name: v.name.trim(),
            sku: v.sku.trim(),
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
          })),
        images: formData.images
          .filter(img => img.imageUrl.trim())
          .map((img, index) => ({
            ...(img.id ? { id: img.id } : {}),
            imageUrl: img.imageUrl.trim(),
            isPrimary: img.isPrimary,
            sortOrder: index,
          })),
      };

      if (isEditing) {
        await productsApi.update(id, submitData);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await productsApi.create(submitData);
        toast.success('Đã tạo sản phẩm mới');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      const message = error.response?.data?.message || 'Không thể lưu sản phẩm';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Format price input
  const formatPriceInput = (value) => {
    const number = value.replace(/\D/g, '');
    return number ? parseInt(number).toLocaleString('vi-VN') : '';
  };

  const parsePriceInput = (formattedValue) => {
    return formattedValue.replace(/\D/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin để tạo sản phẩm mới'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiInfo className="text-petshop-blue" />
            Thông tin cơ bản
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="VD: Thức ăn cho chó Royal Canin"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`input-field ${errors.slug ? 'border-red-500' : ''}`}
                placeholder="thuc-an-cho-cho-royal-canin"
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`input-field ${errors.categoryId ? 'border-red-500' : ''}`}
              >
                <option value="">-- Chọn danh mục --</option>
                {flattenedCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả ngắn
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="input-field"
                placeholder="Mô tả ngắn gọn về sản phẩm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Mô tả chi tiết sản phẩm..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-petshop-orange rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Sản phẩm nổi bật
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Giá */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiDollarSign className="text-petshop-green" />
            Giá sản phẩm
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá gốc (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="basePrice"
                value={formatPriceInput(String(formData.basePrice))}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  basePrice: parsePriceInput(e.target.value) 
                }))}
                className={`input-field ${errors.basePrice ? 'border-red-500' : ''}`}
                placeholder="450,000"
              />
              {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá khuyến mãi (VNĐ)
              </label>
              <input
                type="text"
                name="salePrice"
                value={formatPriceInput(String(formData.salePrice))}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  salePrice: parsePriceInput(e.target.value) 
                }))}
                className="input-field"
                placeholder="380,000"
              />
            </div>
          </div>
        </div>

        {/* Biến thể */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiPackage className="text-petshop-orange" />
              Biến thể sản phẩm
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-sm text-petshop-blue hover:underline flex items-center gap-1"
            >
              <FiPlus /> Thêm biến thể
            </button>
          </div>

          {errors.variants && (
            <p className="text-red-500 text-sm mb-4">{errors.variants}</p>
          )}

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tên biến thể *</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                      className="input-field text-sm"
                      placeholder="VD: 2kg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="input-field text-sm"
                      placeholder="RC-DOG-2KG"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Giá (VNĐ) *</label>
                    <input
                      type="text"
                      value={formatPriceInput(String(variant.price))}
                      onChange={(e) => handleVariantChange(index, 'price', parsePriceInput(e.target.value))}
                      className={`input-field text-sm ${errors[`variant_${index}_price`] ? 'border-red-500' : ''}`}
                      placeholder="450,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tồn kho</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="input-field text-sm"
                      min="0"
                    />
                  </div>
                </div>
                
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-5"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiImage className="text-purple-500" />
              Hình ảnh sản phẩm
            </h2>
            <button
              type="button"
              onClick={addImage}
              className="text-sm text-petshop-blue hover:underline flex items-center gap-1"
            >
              <FiPlus /> Thêm ảnh
            </button>
          </div>

          {errors.images && (
            <p className="text-red-500 text-sm mb-4">{errors.images}</p>
          )}

          <div className="space-y-4">
            {formData.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl"
              >
                {/* Preview */}
                <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/64?text=Error';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiImage className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="url"
                    value={image.imageUrl}
                    onChange={(e) => handleImageChange(index, 'imageUrl', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Nhập URL hình ảnh"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer px-3">
                  <input
                    type="checkbox"
                    checked={image.isPrimary}
                    onChange={(e) => handleImageChange(index, 'isPrimary', e.target.checked)}
                    className="w-4 h-4 text-petshop-orange rounded"
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">Ảnh chính</span>
                </label>

                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <FiSave /> {isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
