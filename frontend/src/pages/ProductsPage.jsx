import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiChevronRight, FiX, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { productsApi, categoriesApi } from '../services/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, categories]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getTree();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Toggle expand/collapse danh mục
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

  // Helper function to find category by slug (including nested children)
  const findCategoryBySlug = (categories, slug) => {
    for (const cat of categories) {
      if (cat.slug === slug) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryBySlug(cat.children, slug);
        if (found) return found;
      }
    }
    return null;
  };

  // Component hiển thị một danh mục
  const CategoryItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = filters.category === category.slug;

    return (
      <div>
        <div 
          className={`flex items-center py-2 px-2 rounded-lg cursor-pointer transition-all
            ${isSelected ? 'bg-petshop-orange/10' : 'hover:bg-gray-50'}
          `}
          style={{ paddingLeft: level > 0 ? `${level * 20 + 8}px` : '8px' }}
        >
          {/* Icon expand/collapse - kích thước cố định */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleCategory(category.id);
            }}
            className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded transition-colors
              ${hasChildren ? 'hover:bg-gray-200 cursor-pointer' : 'cursor-default'}
            `}
          >
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronRight className="w-4 h-4 text-gray-500" />
              </motion.div>
            )}
          </button>

          {/* Radio - kích thước cố định */}
          <input
            type="radio"
            name="category"
            checked={isSelected}
            onChange={() => handleFilterChange('category', category.slug)}
            className="w-4 h-4 text-petshop-orange flex-shrink-0 mx-2"
          />

          {/* Tên danh mục */}
          <span 
            className={`${level === 0 ? 'font-medium' : ''} ${isSelected ? 'text-petshop-orange' : 'text-gray-700'}`}
            onClick={() => handleFilterChange('category', category.slug)}
          >
            {category.name}
            {hasChildren && (
              <span className="text-xs text-gray-400 ml-1">({category.children.length})</span>
            )}
          </span>
        </div>

        {/* Danh mục con */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {category.children.map(child => (
                <CategoryItem key={child.id} category={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: 12,
        sort: filters.sort === 'newest' ? 'createdAt,desc' : 
              filters.sort === 'price-asc' ? 'basePrice,asc' :
              filters.sort === 'price-desc' ? 'basePrice,desc' : 'soldCount,desc',
      };

      let response;
      if (filters.search) {
        response = await productsApi.search(filters.search, params);
      } else if (filters.category || filters.minPrice || filters.maxPrice) {
        // Tìm categoryId từ slug nếu có
        let categoryId = null;
        if (filters.category && categories.length > 0) {
          const foundCategory = findCategoryBySlug(categories, filters.category);
          categoryId = foundCategory ? foundCategory.id : null;
        }
        
        response = await productsApi.filter({
          ...params,
          categoryId: categoryId,
          minPrice: filters.minPrice || null,
          maxPrice: filters.maxPrice || null,
        });
      } else {
        response = await productsApi.getAll(params);
      }

      setProducts(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 0 };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handlePriceRangeChange = (min, max) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max, page: 0 };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: '',
      page: 0,
    });
    setSearchParams({});
  };

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'bestselling', label: 'Bán chạy' },
    { value: 'price-asc', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' },
  ];

  const priceRanges = [
    { label: 'Dưới 100K', min: '', max: '100000' },
    { label: '100K - 300K', min: '100000', max: '300000' },
    { label: '300K - 500K', min: '300000', max: '500000' },
    { label: '500K - 1 triệu', min: '500000', max: '1000000' },
    { label: 'Trên 1 triệu', min: '1000000', max: '' },
  ];

  return (
    <div className="min-h-screen bg-petshop-cream py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-petshop-orange">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-800">Sản phẩm</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {filters.search ? `Kết quả tìm kiếm: "${filters.search}"` : 'Tất cả sản phẩm'}
            </h1>
            <p className="text-gray-600 mt-1">{products.length} sản phẩm</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-petshop-orange/50"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="appearance-none bg-white border rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-petshop-orange/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="hidden md:flex items-center gap-1 bg-white rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-petshop-orange text-white' : 'text-gray-500'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-petshop-orange text-white' : 'text-gray-500'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border rounded-xl"
            >
              <FiFilter />
              Lọc
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            fixed lg:static inset-0 z-50 lg:z-auto bg-white lg:bg-transparent
            w-80 lg:w-64 flex-shrink-0 transform transition-transform duration-300
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="h-full lg:h-auto overflow-y-auto p-6 lg:p-0">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-xl font-bold">Bộ lọc</h2>
                <button onClick={() => setShowFilters(false)}>
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Danh mục</h3>
                  <div className="space-y-1">
                    {/* Tất cả */}
                    <div 
                      className={`flex items-center py-2 px-2 rounded-lg cursor-pointer transition-all
                        ${!filters.category ? 'bg-petshop-orange/10' : 'hover:bg-gray-50'}
                      `}
                    >
                      <span className="w-6 h-6 flex-shrink-0" />
                      <input
                        type="radio"
                        name="category"
                        checked={!filters.category}
                        onChange={() => handleFilterChange('category', '')}
                        className="w-4 h-4 text-petshop-orange flex-shrink-0 mx-2"
                      />
                      <span 
                        className={`font-medium ${!filters.category ? 'text-petshop-orange' : 'text-gray-700'}`}
                        onClick={() => handleFilterChange('category', '')}
                      >
                        Tất cả
                      </span>
                    </div>
                    
                    {/* Danh mục */}
                    {categories.map(category => (
                      <CategoryItem key={category.id} category={category} />
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Khoảng giá</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                      <label key={index} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                          onChange={() => handlePriceRangeChange(range.min, range.max)}
                          className="w-4 h-4 text-petshop-orange"
                        />
                        <span className="text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-petshop-orange hover:text-petshop-orange transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleFilterChange('page', i)}
                    className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                      filters.page === i
                        ? 'bg-petshop-orange text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
