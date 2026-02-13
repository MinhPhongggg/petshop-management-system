import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiCheck, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import ProductCard from '../components/product/ProductCard';
import { productsApi } from '../services/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addItemLocal } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
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
      // Mock data
      setProduct({
        id: 1,
        name: 'Thức ăn hạt Royal Canin cho chó trưởng thành',
        slug: 'thuc-an-royal-canin',
        description: `<p>Thức ăn hạt Royal Canin được sản xuất tại Pháp, cung cấp đầy đủ dưỡng chất cho chó trưởng thành.</p>
        <h3>Thành phần dinh dưỡng:</h3>
        <ul>
          <li>Protein: 25%</li>
          <li>Chất béo: 14%</li>
          <li>Chất xơ: 2.9%</li>
          <li>Độ ẩm: 10%</li>
        </ul>
        <h3>Công dụng:</h3>
        <ul>
          <li>Cung cấp năng lượng cho hoạt động hàng ngày</li>
          <li>Hỗ trợ hệ tiêu hóa khỏe mạnh</li>
          <li>Tăng cường hệ miễn dịch</li>
          <li>Giúp lông bóng mượt</li>
        </ul>`,
        shortDescription: 'Thức ăn hạt cao cấp cho chó trưởng thành, giàu dinh dưỡng, được nhập khẩu từ Pháp.',
        basePrice: 450000,
        salePrice: 380000,
        images: [
          { id: 1, url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800' },
          { id: 2, url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800' },
          { id: 3, url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800' },
        ],
        category: { id: 1, name: 'Thức ăn', slug: 'thuc-an' },
        brand: { id: 1, name: 'Royal Canin' },
        variants: [
          { id: 1, name: '2kg', price: 380000, stock: 50 },
          { id: 2, name: '5kg', price: 850000, stock: 30 },
          { id: 3, name: '10kg', price: 1500000, stock: 20 },
        ],
        averageRating: 4.5,
        reviewCount: 128,
        soldCount: 1500,
        featured: true,
        reviews: [
          { id: 1, user: { fullName: 'Nguyễn Văn A' }, rating: 5, comment: 'Sản phẩm rất tốt, chó nhà mình rất thích!', createdAt: '2024-01-15' },
          { id: 2, user: { fullName: 'Trần Thị B' }, rating: 4, comment: 'Giao hàng nhanh, đóng gói cẩn thận.', createdAt: '2024-01-10' },
        ],
      });
      setSelectedVariant({ id: 1, name: '2kg', price: 380000, stock: 50 });
      setRelatedProducts([
        { id: 2, name: 'Thức ăn hữu cơ cho mèo', slug: 'thuc-an-huu-co-meo', basePrice: 320000, images: [{ url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400' }], category: { name: 'Thức ăn' }, averageRating: 4.7, reviewCount: 156, soldCount: 890 },
        { id: 3, name: 'Pate cho chó Pedigree', slug: 'pate-pedigree', basePrice: 45000, images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' }], category: { name: 'Thức ăn' }, averageRating: 4.3, reviewCount: 234 },
        { id: 4, name: 'Snack thưởng cho chó', slug: 'snack-thuong-cho', basePrice: 85000, images: [{ url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400' }], category: { name: 'Thức ăn' }, averageRating: 4.5, reviewCount: 189 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = () => {
    addItemLocal(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addItemLocal(product, selectedVariant, quantity);
    window.location.href = '/checkout';
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
                        src={image.url}
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
                      src={image.url}
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
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
