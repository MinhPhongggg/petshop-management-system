import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import ServiceCard from '../components/service/ServiceCard';
import { servicesApi } from '../services/api';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getActive();
      setServices(response.data);
    } catch (error) {
      // Mock data
      setServices([
        {
          id: 1,
          name: 'Tắm Spa toàn thân',
          slug: 'tam-spa-toan-than',
          description: 'Dịch vụ tắm spa chuyên nghiệp với các sản phẩm cao cấp, giúp thú cưng thư giãn và sạch sẽ.',
          imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600',
          duration: 60,
          petType: 'ALL',
          pricingList: [
            { minWeight: 0, maxWeight: 5, price: 150000 },
            { minWeight: 5, maxWeight: 10, price: 200000 },
            { minWeight: 10, maxWeight: 20, price: 280000 },
            { minWeight: 20, maxWeight: 50, price: 350000 },
          ],
        },
        {
          id: 2,
          name: 'Cắt tỉa tạo kiểu',
          slug: 'cat-tia-tao-kieu',
          description: 'Cắt tỉa và tạo kiểu lông theo yêu cầu, phù hợp với từng giống chó mèo khác nhau.',
          imageUrl: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=600',
          duration: 90,
          petType: 'DOG',
          pricingList: [
            { minWeight: 0, maxWeight: 5, price: 200000 },
            { minWeight: 5, maxWeight: 10, price: 280000 },
            { minWeight: 10, maxWeight: 20, price: 350000 },
            { minWeight: 20, maxWeight: 50, price: 450000 },
          ],
        },
        {
          id: 3,
          name: 'Massage thư giãn',
          slug: 'massage-thu-gian',
          description: 'Massage giúp thú cưng thư giãn cơ bắp, giảm stress và tăng cường tuần hoàn máu.',
          imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
          duration: 45,
          petType: 'ALL',
          pricingList: [
            { minWeight: 0, maxWeight: 10, price: 100000 },
            { minWeight: 10, maxWeight: 30, price: 150000 },
            { minWeight: 30, maxWeight: 50, price: 200000 },
          ],
        },
        {
          id: 4,
          name: 'Vệ sinh tai & mắt',
          slug: 've-sinh-tai-mat',
          description: 'Vệ sinh sạch sẽ tai và mắt, ngăn ngừa viêm nhiễm và bệnh về mắt cho thú cưng.',
          imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
          duration: 30,
          petType: 'ALL',
          pricingList: [{ price: 80000 }],
        },
        {
          id: 5,
          name: 'Cắt móng',
          slug: 'cat-mong',
          description: 'Cắt và mài móng an toàn, tránh móng dài gây khó chịu và ảnh hưởng đến việc đi lại.',
          imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
          duration: 20,
          petType: 'ALL',
          pricingList: [{ price: 50000 }],
        },
        {
          id: 6,
          name: 'Combo Spa cao cấp',
          slug: 'combo-spa-cao-cap',
          description: 'Trọn gói dịch vụ: Tắm spa + Cắt tỉa + Massage + Vệ sinh tai mắt + Cắt móng.',
          imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600',
          duration: 180,
          petType: 'ALL',
          pricingList: [
            { minWeight: 0, maxWeight: 5, price: 450000 },
            { minWeight: 5, maxWeight: 10, price: 580000 },
            { minWeight: 10, maxWeight: 20, price: 720000 },
            { minWeight: 20, maxWeight: 50, price: 900000 },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: '🏆',
      title: 'Đội ngũ chuyên nghiệp',
      description: 'Nhân viên được đào tạo bài bản, có nhiều năm kinh nghiệm',
    },
    {
      icon: '🧴',
      title: 'Sản phẩm cao cấp',
      description: 'Sử dụng sản phẩm nhập khẩu, an toàn cho thú cưng',
    },
    {
      icon: '🏠',
      title: 'Không gian thoải mái',
      description: 'Phòng spa rộng rãi, sạch sẽ, điều hòa mát mẻ',
    },
    {
      icon: '💝',
      title: 'Tận tâm yêu thương',
      description: 'Chăm sóc thú cưng như người thân trong gia đình',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-petshop-green to-teal-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('/images/paw-pattern.svg')", backgroundRepeat: 'repeat'}} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium mb-4">
              🐾 Dịch vụ chăm sóc thú cưng
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Spa & Grooming<br />Chuyên Nghiệp
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Mang đến cho boss yêu của bạn trải nghiệm spa tuyệt vời nhất
              với đội ngũ chuyên gia giàu kinh nghiệm
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/booking" className="btn-primary bg-white text-petshop-green hover:bg-gray-100">
                Đặt lịch ngay
              </Link>
              <a href="#services" className="btn-outline border-white text-white hover:bg-white/20">
                Xem dịch vụ
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services List */}
      <section id="services" className="py-16 bg-petshop-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Dịch vụ của chúng tôi
            </motion.h2>
            <p className="section-subtitle">
              Đa dạng dịch vụ chăm sóc, phù hợp với mọi nhu cầu
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Bảng giá dịch vụ</h2>
              <p className="section-subtitle">
                Giá có thể thay đổi tùy theo cân nặng và giống thú cưng
              </p>
            </div>

            <div className="bg-petshop-cream rounded-3xl p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-petshop-orange/20">
                      <th className="text-left py-4 px-2 font-bold text-gray-800">Dịch vụ</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-800">&lt; 5kg</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-800">5-10kg</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-800">10-20kg</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-800">&gt; 20kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-2 font-medium">Tắm Spa toàn thân</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">150K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">200K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">280K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">350K</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-2 font-medium">Cắt tỉa tạo kiểu</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">200K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">280K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">350K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">450K</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-2 font-medium">Combo Spa cao cấp</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">450K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">580K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">720K</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold">900K</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-2 font-medium">Cắt móng</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold" colSpan={4}>50K</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-2 font-medium">Vệ sinh tai & mắt</td>
                      <td className="py-4 px-2 text-center text-petshop-orange font-semibold" colSpan={4}>80K</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                <FiCheck className="w-4 h-4 text-petshop-green" />
                <span>Giá đã bao gồm VAT. Áp dụng cho các giống phổ biến.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-petshop-orange to-petshop-yellow text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Đặt lịch ngay hôm nay!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Nhận ngay ưu đãi giảm 10% cho lần đặt lịch đầu tiên
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-petshop-orange font-bold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Đặt lịch ngay
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
