import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCamera, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authApi.updateProfile(formData);
      setUser(response.data);
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-petshop-orange to-petshop-yellow rounded-3xl p-8 mb-6 text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <FiUser className="text-4xl" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-petshop-orange shadow-lg">
                  <FiCamera />
                </button>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{formData.fullName || 'Người dùng'}</h1>
              <p className="opacity-90">{formData.email}</p>
              <p className="text-sm opacity-75 mt-1">Thành viên từ {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-petshop-orange hover:underline"
              >
                <FiEdit2 /> Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Hủy
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-11 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="input-field pl-11 bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-11 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-11 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Bảo mật</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="font-medium text-gray-800">Đổi mật khẩu</h3>
                <p className="text-sm text-gray-500">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
              </div>
              <button className="text-petshop-orange hover:underline">
                Thay đổi
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium text-gray-800">Xác thực 2 bước</h3>
                <p className="text-sm text-gray-500">Tăng cường bảo mật cho tài khoản của bạn</p>
              </div>
              <button className="text-petshop-orange hover:underline">
                Thiết lập
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
