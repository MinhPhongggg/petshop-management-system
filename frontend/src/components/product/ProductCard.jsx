import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const ProductCard = ({ product }) => {
  const { addItemLocal } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItemLocal(product, product.variants?.[0], 1);
  };

  // Get display price - use minPrice from BE or fallback to basePrice
  const displayPrice = product.minPrice || product.basePrice;
  const originalPrice = product.basePrice;
  const hasDiscount = product.hasDiscount || (displayPrice && originalPrice && displayPrice < originalPrice);
  
  const discountPercent = hasDiscount && originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // Get product image - BE returns primaryImage or images array with imageUrl
  const getProductImage = () => {
    if (product.primaryImage) return product.primaryImage;
    if (product.images?.[0]?.imageUrl) return product.images[0].imageUrl;
    if (product.images?.[0]?.url) return product.images[0].url;
    return '/images/placeholder-product.jpg';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="card card-hover group"
    >
      <Link to={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={getProductImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
            {product.featured && (
              <span className="bg-petshop-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                Hot
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-petshop-orange hover:text-white transition-colors">
              <FiHeart className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-petshop-orange hover:text-white transition-colors">
              <FiEye className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-white text-petshop-orange font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-petshop-orange hover:text-white transition-colors"
            >
              <FiShoppingCart className="w-4 h-4" />
              Thêm vào giỏ
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category - BE returns categoryName instead of category.name */}
          <p className="text-sm text-petshop-orange font-medium mb-1">
            {product.categoryName || product.category?.name}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-petshop-orange transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price - BE returns minPrice/maxPrice instead of salePrice */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-petshop-orange">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && originalPrice > displayPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Sold Count */}
          {product.soldCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Đã bán {product.soldCount}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
