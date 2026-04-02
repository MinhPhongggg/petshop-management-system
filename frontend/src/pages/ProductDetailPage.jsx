import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import ProductCard from '../components/product/ProductCard';
import { productsApi, rewardsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [watchVoucherClaimed, setWatchVoucherClaimed] = useState(false);
  const [claimingWatchVoucher, setClaimingWatchVoucher] = useState(false);
  
  const { addItem, addItemLocal } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const isCustomer = user?.role === 'CUSTOMER';

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsApi.getBySlug(slug);
      setProduct(response.data);
      if (response.data.variants?.length > 0) {
        setSelectedVariant(response.data.variants[0]);
      }
      // Fetch related products
      if (response.data.category?.id) {
        const relatedRes = await productsApi.getByCategory(response.data.category.id, { size: 4 });
        setRelatedProducts(relatedRes.data.content?.filter(p => p.id !== response.data.id) || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    setWatchSeconds(0);
    setWatchVoucherClaimed(false);
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer || !product?.id || watchVoucherClaimed) {
      return undefined;
    }

    const timer = setInterval(() => {
      setWatchSeconds((prev) => Math.min(prev + 1, 30));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, isCustomer, product?.id, watchVoucherClaimed]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = () => {
    if (isAuthenticated) {
      addItem(product, selectedVariant, quantity);
    } else {
      addItemLocal(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (isAuthenticated) {
      await addItem(product, selectedVariant, quantity);
      navigate('/checkout');
    } else {
      addItemLocal(product, selectedVariant, quantity);
      navigate('/checkout');
    }
  };

  const handleClaimWatchVoucher = async () => {
    if (!product?.id || watchSeconds < 30 || watchVoucherClaimed || claimingWatchVoucher) {
      return;
    }
    try {
      setClaimingWatchVoucher(true);
      const res = await rewardsApi.claimWatchVoucher(product.id, watchSeconds);
      setWatchVoucherClaimed(true);
      toast.success(`Đã nhận voucher ${res.data.code}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể nhận voucher');
    } finally {
      setClaimingWatchVoucher(false);
    }
  };

  const discountPercent = product?.salePrice && product?.basePrice
    ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-petshop-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="btn-primary mt-4">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petshop-cream py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-petshop-orange">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-petshop-orange">Sản phẩm</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category?.slug}`} className="hover:text-petshop-orange">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-10">
            {/* Images */}
            <div className="space-y-4">
              <Swiper
                modules={[Navigation, Thumbs, Zoom]}
                navigation
                thumbs={{ swiper: thumbsSwiper }}
                zoom
                className="aspect-square rounded-2xl overflow-hidden"
              >
                {product.images?.map((image, index) => (
                  <SwiperSlide key={image.id || index}>
                    <div className="swiper-zoom-container">
                      <img
                        src={image.imageUrl}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <Swiper
                modules={[Thumbs]}
                watchSlidesProgress
                onSwiper={setThumbsSwiper}
                slidesPerView={4}
                spaceBetween={12}
                className="h-24"
              >
                {product.images?.map((image, index) => (
                  <SwiperSlide key={image.id || index}>
                    <img
                      src={image.imageUrl}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-petshop-orange transition-colors"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Info */}
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {product.featured && (
                  <span className="px-3 py-1 bg-petshop-orange/10 text-petshop-orange text-sm font-medium rounded-full">
                    🔥 Hot
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                    -{discountPercent}%
                  </span>
                )}
                <span className="px-3 py-1 bg-petshop-green/10 text-petshop-green text-sm font-medium rounded-full">
                  {product.brand?.name}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Rating & Sold */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{product.averageRating}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{product.reviewCount} đánh giá</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{product.soldCount} đã bán</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-petshop-orange">
                    {formatPrice(selectedVariant?.price || product.salePrice || product.basePrice)}
                  </span>
                  {product.salePrice && product.salePrice < product.basePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-gray-600 mb-6">
                {product.shortDescription}
              </p>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Kích thước</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-petshop-orange bg-petshop-orange/10 text-petshop-orange'
                            : 'border-gray-200 hover:border-petshop-orange'
                        }`}
                      >
                        {variant.name}
                        {variant.stock <= 5 && variant.stock > 0 && (
                          <span className="ml-1 text-xs text-red-500">Còn {variant.stock}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Số lượng</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setQuantity(Math.max(1, parseInt(numericValue, 10) || 1));
                      }}
                      className="w-16 text-center border-x-2 border-gray-200 py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-gray-500">
                    {selectedVariant?.stock || 100} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-outline flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 btn-primary"
                >
                  Mua ngay
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-full hover:border-red-500 hover:text-red-500 transition-colors">
                  <FiHeart className="w-5 h-5" />
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-full hover:border-petshop-blue hover:text-petshop-blue transition-colors">
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>

              {isAuthenticated && isCustomer && (
                <div className="mb-8 p-4 rounded-2xl border border-amber-200 bg-amber-50">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    Xem sản phẩm đủ 30 giây để nhận voucher thưởng
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-amber-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${Math.min((watchSeconds / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-amber-700 font-semibold">{watchSeconds}/30s</span>
                  </div>
                  <button
                    onClick={handleClaimWatchVoucher}
                    disabled={watchSeconds < 30 || watchVoucherClaimed || claimingWatchVoucher}
                    className={`mt-3 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      watchVoucherClaimed
                        ? 'bg-green-100 text-green-700'
                        : watchSeconds < 30 || claimingWatchVoucher
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {watchVoucherClaimed
                      ? 'Đã nhận voucher'
                      : claimingWatchVoucher
                        ? 'Đang nhận...'
                        : 'Nhận voucher 30s'}
                  </button>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiTruck className="w-5 h-5 text-petshop-green" />
                  <span>Miễn phí giao hàng</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiShield className="w-5 h-5 text-petshop-green" />
                  <span>Bảo hành chính hãng</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiRefreshCw className="w-5 h-5 text-petshop-green" />
                  <span>Đổi trả 7 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex border-b">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-petshop-orange'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'description' ? 'Mô tả sản phẩm' : `Đánh giá (${product.reviewCount})`}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-petshop-orange"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 lg:p-10">
              {activeTab === 'description' ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="space-y-6">
                  {product.reviews?.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-petshop-orange/20 rounded-full flex items-center justify-center text-petshop-orange font-bold">
                          {review.user?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{review.user?.fullName}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 ml-auto">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="section-title mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
