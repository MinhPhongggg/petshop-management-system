import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-petshop-orange to-petshop-yellow py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Đăng ký nhận tin khuyến mãi
              </h3>
              <p className="text-white/80">
                Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên!
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 md:w-80 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-xl flex items-center justify-center">
                  <MdPets className="text-white text-2xl" />
                </div>
                <span className="font-display font-bold text-2xl text-white">
                  Pet<span className="text-petshop-orange">Shop</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-4">
                PetShop - Nơi yêu thương thú cưng của bạn. Chúng tôi cung cấp các sản phẩm và dịch vụ chăm sóc thú cưng chất lượng cao nhất.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-petshop-orange transition-colors">
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-petshop-orange transition-colors">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-petshop-orange transition-colors">
                  <FiYoutube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Dịch vụ Spa
                  </Link>
                </li>
                <li>
                  <Link to="/booking" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Đặt lịch hẹn
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-4">Dịch vụ</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/services/grooming" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Cắt tỉa lông
                  </Link>
                </li>
                <li>
                  <Link to="/services/bathing" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Tắm rửa thú cưng
                  </Link>
                </li>
                <li>
                  <Link to="/services/spa" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Spa thư giãn
                  </Link>
                </li>
                <li>
                  <Link to="/services/nail" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Cắt móng
                  </Link>
                </li>
                <li>
                  <Link to="/services/health-check" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    Kiểm tra sức khỏe
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4">Liên hệ</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-petshop-orange mt-1" />
                  <span className="text-gray-400">
                    123 Đường ABC, Quận XYZ,<br />TP. Hồ Chí Minh
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5 text-petshop-orange" />
                  <a href="tel:19001234" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    1900 1234
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-petshop-orange" />
                  <a href="mailto:support@petshop.vn" className="text-gray-400 hover:text-petshop-orange transition-colors">
                    support@petshop.vn
                  </a>
                </li>
              </ul>

              {/* Working Hours */}
              <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                <h5 className="font-semibold mb-2">Giờ làm việc</h5>
                <p className="text-gray-400 text-sm">
                  Thứ 2 - Thứ 6: 8:00 - 20:00<br />
                  Thứ 7 - CN: 9:00 - 18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <p>© 2024 PetShop. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-petshop-orange transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="hover:text-petshop-orange transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/refund" className="hover:text-petshop-orange transition-colors">
                Chính sách đổi trả
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
