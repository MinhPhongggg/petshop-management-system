import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiEye, FiUpload, FiDownload, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi, importApi } from '../../services/api';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, categoryFilter]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAllAdmin({ page: currentPage - 1, size: 10, categoryId: categoryFilter }),
        categoriesApi.getTree(),
      ]);
      setProducts(productsRes.data.content || productsRes.data);
      setTotalPages(productsRes.data.totalPages || 1);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Flatten categories for dropdown with indentation
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({
        ...cat,
        displayName: level > 0 ? `${'\u00A0\u00A0'.repeat(level)}\u2514 ${cat.name}` : cat.name
      });
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...flattenCategories(cat.children, level + 1)];
      }
    });
    return result;
  };

  const flattenedCategories = flattenCategories(categories);

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await productsApi.delete(productId);
        toast.success('Đã xóa sản phẩm');
        fetchData();
      } catch (error) {
        toast.error('Không thể xóa sản phẩm');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status, stock) => {
    if (stock === 0 || status === 'OUT_OF_STOCK') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Hết hàng</span>;
    }
    if (status === 'ACTIVE') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">Đang bán</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Ẩn</span>;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Import handlers
  const handleDownloadTemplate = async () => {
    try {
      const response = await importApi.downloadProductTemplate();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Đã tải file mẫu');
    } catch (error) {
      toast.error('Không thể tải file mẫu');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File không được vượt quá 10MB');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file để import');
      return;
    }

    setImporting(true);
    try {
      const response = await importApi.importProducts(selectedFile);
      setImportResult(response.data);
      if (response.data.successCount > 0) {
        toast.success(`Đã import ${response.data.successCount} sản phẩm`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể import sản phẩm');
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-petshop-green text-petshop-green rounded-lg hover:bg-petshop-green/5 flex items-center gap-2"
          >
            <FiUpload /> Import Excel
          </button>
          <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
            <FiPlus /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Tất cả danh mục</option>
            {flattenedCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.displayName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giá</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tồn kho</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    {product.salePrice ? (
                      <div>
                        <span className="font-medium text-petshop-orange">{formatPrice(product.salePrice)}</span>
                        <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.price)}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-800">{formatPrice(product.price)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={product.stock < 10 ? 'text-red-500 font-medium' : 'text-gray-600'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(product.status, product.stock)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <FiEye />
                      </Link>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-500 hover:text-petshop-orange hover:bg-orange-50 rounded-lg"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === page
                    ? 'bg-petshop-orange text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeImportModal}
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
                  <h2 className="text-xl font-bold text-gray-800">Import sản phẩm từ Excel</h2>
                  <button
                    onClick={closeImportModal}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Download Template */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Bước 1: Tải file mẫu</h3>
                  <p className="text-sm text-blue-600 mb-3">
                    Tải file Excel mẫu, điền thông tin sản phẩm theo hướng dẫn trong file
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <FiDownload /> Tải file mẫu
                  </button>
                </div>

                {/* Upload File */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Bước 2: Chọn file để import</h3>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls"
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-petshop-green hover:bg-green-50/50 transition-colors"
                  >
                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Kéo thả hoặc click để chọn file'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Hỗ trợ .xlsx, .xls (tối đa 10MB)
                    </span>
                  </label>
                </div>

                {/* Import Button */}
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importing}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang import...
                    </>
                  ) : (
                    <>
                      <FiUpload /> Import sản phẩm
                    </>
                  )}
                </button>

                {/* Import Result */}
                {importResult && (
                  <div className="border rounded-xl overflow-hidden">
                    <div className={`p-4 ${importResult.errorCount > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                      <div className="flex items-center gap-2">
                        {importResult.errorCount > 0 ? (
                          <FiAlertCircle className="text-yellow-500" />
                        ) : (
                          <FiCheckCircle className="text-green-500" />
                        )}
                        <span className="font-medium">{importResult.message}</span>
                      </div>
                    </div>
                    
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="p-4 max-h-48 overflow-auto">
                        <h4 className="font-medium text-red-600 mb-2">Chi tiết lỗi:</h4>
                        <div className="space-y-2">
                          {importResult.errors.map((err, idx) => (
                            <div key={idx} className="text-sm p-2 bg-red-50 rounded">
                              <span className="font-medium">Dòng {err.rowNumber}</span>
                              {err.productName && <span> - {err.productName}</span>}
                              : <span className="text-red-600">{err.errorMessage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {importResult.createdProducts && importResult.createdProducts.length > 0 && (
                      <div className="p-4 border-t max-h-32 overflow-auto">
                        <h4 className="font-medium text-green-600 mb-2">Sản phẩm đã tạo:</h4>
                        <div className="flex flex-wrap gap-2">
                          {importResult.createdProducts.map((name, idx) => (
                            <span key={idx} className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsPage;
