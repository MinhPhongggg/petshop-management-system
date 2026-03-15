import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { FiArrowRight, FiCalendar, FiTruck, FiShield, FiHeart, FiPhone } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import ProductCard from '../components/product/ProductCard';
import ServiceCard from '../components/service/ServiceCard';
import { productsApi, servicesApi } from '../services/api';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, servicesRes] = await Promise.all([
          productsApi.getFeatured(),
          productsApi.getNew(8),
          servicesApi.getActive(),
        ]);
        setFeaturedProducts(featuredRes.data);
        setNewProducts(newRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set mock data for demo
        setFeaturedProducts([
          { id: 1, name: 'Thức ăn hạt Royal Canin', slug: 'thuc-an-royal-canin', basePrice: 450000, salePrice: 380000, images: [{ url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400' }], category: { name: 'Thức ăn' }, averageRating: 4.5, reviewCount: 128, soldCount: 1500, featured: true },
          { id: 2, name: 'Vòng cổ cho chó', slug: 'vong-co-cho-cho', basePrice: 150000, salePrice: 120000, images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' }], category: { name: 'Phụ kiện' }, averageRating: 4.2, reviewCount: 89, soldCount: 850 },
          { id: 3, name: 'Chuồng mèo cao cấp', slug: 'chuong-meo-cao-cap', basePrice: 1200000, salePrice: 950000, images: [{ url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400' }], category: { name: 'Chuồng' }, averageRating: 4.8, reviewCount: 56, soldCount: 234, featured: true },
          { id: 4, name: 'Đồ chơi cho thú cưng', slug: 'do-choi-thu-cung', basePrice: 80000, salePrice: 65000, images: [{ url: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400' }], category: { name: 'Đồ chơi' }, averageRating: 4.0, reviewCount: 234, soldCount: 2100 },
        ]);
        setNewProducts([
          { id: 5, name: 'Sữa tắm dưỡng lông', slug: 'sua-tam-duong-long', basePrice: 180000, images: [{ url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400' }], category: { name: 'Chăm sóc' }, averageRating: 4.3, reviewCount: 67, soldCount: 456 },
          { id: 6, name: 'Bát ăn tự động', slug: 'bat-an-tu-dong', basePrice: 650000, salePrice: 550000, images: [{ url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400' }], category: { name: 'Phụ kiện' }, averageRating: 4.6, reviewCount: 45, soldCount: 189 },
          { id: 7, name: 'Thức ăn hữu cơ cho mèo', slug: 'thuc-an-huu-co-meo', basePrice: 320000, images: [{ url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400' }], category: { name: 'Thức ăn' }, averageRating: 4.7, reviewCount: 156, soldCount: 890 },
          { id: 8, name: 'Dây dắt chó cao cấp', slug: 'day-dat-cho-cao-cap', basePrice: 200000, salePrice: 160000, images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' }], category: { name: 'Phụ kiện' }, averageRating: 4.4, reviewCount: 98, soldCount: 567 },
        ]);
        setServices([
          { id: 1, name: 'Tắm Spa thú cưng', slug: 'tam-spa-thu-cung', description: 'Dịch vụ tắm spa chuyên nghiệp cho thú cưng', imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400', duration: 60, petType: 'ALL', pricingList: [{ price: 200000 }] },
          { id: 2, name: 'Cắt tỉa lông', slug: 'cat-tia-long', description: 'Cắt tỉa và tạo kiểu lông chuyên nghiệp', imageUrl: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=400', duration: 90, petType: 'DOG', pricingList: [{ price: 300000 }] },
          { id: 3, name: 'Massage thư giãn', slug: 'massage-thu-gian', description: 'Massage giúp thú cưng thư giãn', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', duration: 45, petType: 'ALL', pricingList: [{ price: 150000 }] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroSlides = [
    {
      title: 'Chăm sóc thú cưng',
      subtitle: 'Yêu thương từng khoảnh khắc',
      description: 'Dịch vụ spa, grooming chuyên nghiệp. Sản phẩm chất lượng cao cho boss yêu của bạn.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200',
      cta: { text: 'Đặt lịch ngay', link: '/booking' },
    },
    {
      title: 'Sản phẩm chất lượng',
      subtitle: 'Cho thú cưng của bạn',
      description: 'Thức ăn, phụ kiện, đồ chơi được chọn lọc kỹ càng từ các thương hiệu uy tín.',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200',
      cta: { text: 'Mua sắm', link: '/products' },
    },
    {
      title: 'Ưu đãi đặc biệt',
      subtitle: 'Giảm đến 50%',
      description: 'Chương trình khuyến mãi hấp dẫn dành cho thành viên mới. Đăng ký ngay!',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200',
      cta: { text: 'Xem ưu đãi', link: '/products?sale=true' },
    },
  ];

  const features = [
    { icon: FiTruck, title: 'Miễn phí vận chuyển', description: 'Đơn hàng từ 500K', color: 'text-petshop-orange' },
    { icon: FiShield, title: 'Bảo hành chính hãng', description: '100% sản phẩm chính hãng', color: 'text-petshop-green' },
    { icon: FiHeart, title: 'Chăm sóc tận tâm', description: 'Đội ngũ chuyên nghiệp', color: 'text-petshop-pink' },
    { icon: FiPhone, title: 'Hỗ trợ 24/7', description: 'Tư vấn mọi lúc mọi nơi', color: 'text-petshop-blue' },
  ];

  const stats = [
    { number: '10K+', label: 'Khách hàng tin tưởng' },
    { number: '5K+', label: 'Sản phẩm đa dạng' },
    { number: '500+', label: 'Lịch đặt mỗi tuần' },
    { number: '4.9', label: 'Đánh giá trung bình' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-16 lg:-mt-28">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="h-[500px] md:h-[600px] lg:h-[700px]"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="max-w-2xl text-white"
                    >
                      <span className="inline-block px-4 py-2 bg-petshop-orange/20 backdrop-blur-sm rounded-full text-petshop-yellow font-medium mb-4">
                        {slide.subtitle}
                      </span>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-white/80 mb-8">
                        {slide.description}
                      </p>
                      <div className="flex gap-4">
                        <Link to={slide.cta.link} className="btn-primary text-lg">
                          {slide.cta.text}
                          <FiArrowRight className="ml-2" />
                        </Link>
                        <Link to="/services" className="btn-outline border-white text-white hover:bg-white hover:text-petshop-orange">
                          Khám phá dịch vụ
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Features */}
      <section className="py-8 bg-white shadow-lg relative z-10 -mt-8 mx-4 lg:mx-auto lg:max-w-6xl rounded-2xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-white to-petshop-cream">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="section-title"
              >
                Sản phẩm <span className="gradient-text">nổi bật</span>
              </motion.h2>
              <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
            </div>
            <Link to="/products?featured=true" className="btn-outline hidden md:inline-flex">
              Xem tất cả
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/products?featured=true" className="btn-primary">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-petshop-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-petshop-green/10 text-petshop-green font-medium rounded-full mb-4"
            >
              🐾 Dịch vụ chăm sóc
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Dịch vụ <span className="gradient-text">Spa & Grooming</span>
            </motion.h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm chăm sóc thú cưng của bạn như người thân trong gia đình
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/booking" className="btn-secondary text-lg">
              <FiCalendar className="mr-2" />
              Đặt lịch ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-petshop-orange to-petshop-yellow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="section-title"
              >
                Sản phẩm <span className="gradient-text">mới</span>
              </motion.h2>
              <p className="text-gray-600">Cập nhật những sản phẩm mới nhất</p>
            </div>
            <Link to="/products?sort=newest" className="btn-outline hidden md:inline-flex">
              Xem tất cả
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('/images/paw-pattern.svg')", backgroundRepeat: 'repeat'}} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <MdPets className="text-6xl text-petshop-orange mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Bạn đã sẵn sàng chăm sóc boss yêu chưa?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Đăng ký tài khoản ngay để nhận ưu đãi 10% cho đơn hàng đầu tiên
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg">
                  Đăng ký ngay
                </Link>
                <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900">
                  Liên hệ tư vấn
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
