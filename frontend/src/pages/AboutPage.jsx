import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiAward, FiUsers, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const AboutPage = () => {
  const stats = [
    { number: '10+', label: 'Năm kinh nghiệm' },
    { number: '50K+', label: 'Khách hàng tin tưởng' },
    { number: '100+', label: 'Sản phẩm chất lượng' },
    { number: '20+', label: 'Chuyên gia thú y' },
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      role: 'Giám đốc điều hành',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      description: '15 năm kinh nghiệm trong ngành thú y',
    },
    {
      name: 'Trần Thị B',
      role: 'Trưởng phòng Spa',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      description: 'Chuyên gia chăm sóc thú cưng',
    },
    {
      name: 'Lê Văn C',
      role: 'Bác sĩ thú y',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
      description: 'Tiến sĩ Thú y, 10 năm kinh nghiệm',
    },
    {
      name: 'Phạm Thị D',
      role: 'Quản lý cửa hàng',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
      description: 'Chuyên gia tư vấn dinh dưỡng',
    },
  ];

  const values = [
    {
      icon: FiHeart,
      title: 'Yêu thương',
      description: 'Chúng tôi đối xử với mọi thú cưng như chính thành viên trong gia đình',
    },
    {
      icon: FiAward,
      title: 'Chất lượng',
      description: 'Cam kết cung cấp sản phẩm và dịch vụ chất lượng cao nhất',
    },
    {
      icon: FiUsers,
      title: 'Chuyên nghiệp',
      description: 'Đội ngũ nhân viên được đào tạo bài bản, giàu kinh nghiệm',
    },
    {
      icon: MdPets,
      title: 'Tận tâm',
      description: 'Luôn đặt sức khỏe và hạnh phúc của thú cưng lên hàng đầu',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-petshop-orange to-petshop-yellow py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Về PetShop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl max-w-2xl mx-auto opacity-90"
          >
            Nơi thú cưng của bạn được chăm sóc như những thành viên thực sự trong gia đình
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-gray-600 mb-4">
                PetShop được thành lập vào năm 2014 với tình yêu dành cho thú cưng và mong muốn mang đến 
                dịch vụ chăm sóc tốt nhất cho các bé thú cưng tại Việt Nam.
              </p>
              <p className="text-gray-600 mb-4">
                Qua hơn 10 năm hoạt động, chúng tôi đã phục vụ hơn 50,000 khách hàng và trở thành một trong 
                những địa chỉ uy tín hàng đầu trong lĩnh vực chăm sóc thú cưng.
              </p>
              <p className="text-gray-600">
                Với đội ngũ nhân viên giàu kinh nghiệm và trang thiết bị hiện đại, PetShop cam kết mang đến 
                trải nghiệm tốt nhất cho cả thú cưng và chủ nhân của chúng.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600"
                alt="PetShop Store"
                className="rounded-3xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-petshop-orange rounded-full flex items-center justify-center">
                    <FiHeart className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">10+</p>
                    <p className="text-gray-500">Năm kinh nghiệm</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-petshop-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-petshop-orange mb-2">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị chúng tôi theo đuổi mỗi ngày để mang đến dịch vụ tốt nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-petshop-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những người yêu thương và tận tâm với công việc chăm sóc thú cưng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  <p className="text-petshop-orange text-sm mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-petshop-orange to-petshop-yellow rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ghé thăm cửa hàng</h2>
                <p className="opacity-90 mb-6">
                  Đến với PetShop để trải nghiệm dịch vụ chăm sóc thú cưng tốt nhất
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-xl" />
                    <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-xl" />
                    <span>1900 1234 56</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMail className="text-xl" />
                    <span>contact@petshop.vn</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"
                  alt="Happy Pets"
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
