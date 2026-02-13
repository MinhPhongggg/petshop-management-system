import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: 'Địa chỉ',
      content: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    },
    {
      icon: FiPhone,
      title: 'Hotline',
      content: '1900 1234 56',
    },
    {
      icon: FiMail,
      title: 'Email',
      content: 'contact@petshop.vn',
    },
    {
      icon: FiClock,
      title: 'Giờ làm việc',
      content: '8:00 - 21:00 (Tất cả các ngày)',
    },
  ];

  const branches = [
    {
      name: 'Chi nhánh Quận 1',
      address: '123 Nguyễn Huệ, Quận 1',
      phone: '028 1234 5678',
    },
    {
      name: 'Chi nhánh Quận 7',
      address: '456 Nguyễn Thị Thập, Quận 7',
      phone: '028 2345 6789',
    },
    {
      name: 'Chi nhánh Bình Thạnh',
      address: '789 Điện Biên Phủ, Bình Thạnh',
      phone: '028 3456 7890',
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
            Liên hệ với chúng tôi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl max-w-2xl mx-auto opacity-90"
          >
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-petshop-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <info.icon className="text-petshop-orange text-2xl" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{info.title}</h3>
                <p className="text-gray-600">{info.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-petshop-cream">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="0901234567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="product">Tư vấn sản phẩm</option>
                    <option value="service">Tư vấn dịch vụ</option>
                    <option value="order">Hỗ trợ đơn hàng</option>
                    <option value="booking">Hỗ trợ đặt lịch</option>
                    <option value="feedback">Góp ý/Phản hồi</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="input-field"
                    placeholder="Nhập nội dung tin nhắn..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <FiSend /> {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </motion.div>

            {/* Map & Branches */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Google Map Embed */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4240397809685!2d106.70225!3d10.778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzQwLjgiTiAxMDbCsDQyJzA4LjEiRQ!5e0!3m2!1svi!2s!4v1600000000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="PetShop Location"
                />
              </div>

              {/* Branches */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Hệ thống chi nhánh</h3>
                <div className="space-y-4">
                  {branches.map((branch, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-petshop-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="text-petshop-orange" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{branch.name}</h4>
                        <p className="text-sm text-gray-500">{branch.address}</p>
                        <p className="text-sm text-petshop-orange">{branch.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Kết nối với chúng tôi</h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebook className="text-xl" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <FaInstagram className="text-xl" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <FaYoutube className="text-xl" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <FaTiktok className="text-xl" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Câu hỏi thường gặp</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Làm thế nào để đặt lịch dịch vụ spa cho thú cưng?',
                a: 'Bạn có thể đặt lịch trực tuyến trên website hoặc gọi điện trực tiếp đến hotline 1900 1234 56. Chúng tôi khuyến khích đặt lịch trước ít nhất 1 ngày để đảm bảo có chỗ.',
              },
              {
                q: 'Thời gian giao hàng là bao lâu?',
                a: 'Đối với nội thành TP.HCM, thời gian giao hàng từ 2-4 giờ. Các tỉnh thành khác từ 2-5 ngày tùy khu vực. Miễn phí giao hàng cho đơn từ 500.000đ.',
              },
              {
                q: 'Chính sách đổi trả sản phẩm như thế nào?',
                a: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên seal, chưa qua sử dụng. Đối với thực phẩm, vui lòng kiểm tra kỹ trước khi nhận hàng.',
              },
              {
                q: 'Có thể thanh toán bằng những hình thức nào?',
                a: 'PetShop hỗ trợ thanh toán COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng, ví điện tử MoMo, ZaloPay và thẻ tín dụng/ghi nợ.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h3 className="font-bold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
