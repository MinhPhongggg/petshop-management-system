import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiCalendar } from 'react-icons/fi';
import { servicesApi } from '../services/api';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const response = await servicesApi.getBySlug(slug);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-petshop-green border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy dịch vụ</h2>
        <Link to="/services" className="btn-primary mt-4">
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
          <Link to="/" className="hover:text-petshop-green">Trang chủ</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-petshop-green">Dịch vụ</Link>
          <span>/</span>
          <span className="text-gray-800">{service.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden mb-8"
            >
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{service.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <FiClock />
                    {service.duration} phút
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    {service.petType === 'DOG' ? '🐕 Chó' :
                     service.petType === 'CAT' ? '🐱 Mèo' :
                     '🐾 Tất cả'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 lg:p-8">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sticky top-32">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Bảng giá</h3>
              
              <div className="space-y-3 mb-6">
                {service.pricingList?.map((pricing, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-petshop-cream rounded-xl"
                  >
                    <span className="text-gray-700">
                      {pricing.minWeight !== undefined
                        ? `${pricing.minWeight} - ${pricing.maxWeight} kg`
                        : 'Tất cả'}
                    </span>
                    <span className="font-bold text-petshop-green text-lg">
                      {formatPrice(pricing.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-petshop-green" />
                  <span>Sử dụng sản phẩm cao cấp</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-petshop-green" />
                  <span>Nhân viên chuyên nghiệp</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-petshop-green" />
                  <span>Tặng kèm xịt thơm</span>
                </div>
              </div>

              <Link
                to={`/booking?service=${service.slug}`}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FiCalendar />
                Đặt lịch ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
