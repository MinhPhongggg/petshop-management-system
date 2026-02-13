import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiArrowRight } from 'react-icons/fi';

const ServiceCard = ({ service }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getMinPrice = () => {
    if (!service.pricingList || service.pricingList.length === 0) {
      return 'Liên hệ';
    }
    const minPrice = Math.min(...service.pricingList.map(p => p.price));
    return formatPrice(minPrice);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="card card-hover group"
    >
      <Link to={`/services/${service.slug}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={service.imageUrl || '/images/placeholder-service.jpg'}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Duration Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full">
              <FiClock className="w-4 h-4 text-petshop-orange" />
              {service.duration} phút
            </span>
          </div>

          {/* Pet Type Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center bg-petshop-orange text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {service.petType === 'DOG' ? '🐕 Chó' : 
               service.petType === 'CAT' ? '🐱 Mèo' : 
               '🐾 Tất cả'}
            </span>
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1">
              {service.name}
            </h3>
            <p className="text-white/80 text-sm line-clamp-2">
              {service.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Giá từ</p>
              <p className="text-xl font-bold text-petshop-orange">
                {getMinPrice()}
              </p>
            </div>
            <div className="flex items-center gap-2 text-petshop-green font-medium">
              <span>Đặt lịch</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {['Chuyên nghiệp', 'An toàn', 'Tận tâm'].map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-petshop-green/10 text-petshop-green text-xs font-medium rounded-full"
              >
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
