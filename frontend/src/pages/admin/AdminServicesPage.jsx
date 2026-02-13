import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiClock, FiDollarSign } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { servicesApi } from '../../services/api';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    basePrice: '',
    image: '',
    petTypes: ['DOG', 'CAT'],
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getAll();
      setServices(response.data);
    } catch (error) {
      // Mock data
      setServices([
        {
          id: 1,
          name: 'Tắm và Vệ sinh',
          description: 'Dịch vụ tắm rửa, vệ sinh tai, cắt móng cho thú cưng',
          duration: 60,
          basePrice: 150000,
          image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300',
          petTypes: ['DOG', 'CAT'],
          status: 'ACTIVE',
          bookingsCount: 45,
        },
        {
          id: 2,
          name: 'Cắt tỉa lông',
          description: 'Cắt tỉa, tạo kiểu lông theo yêu cầu',
          duration: 90,
          basePrice: 250000,
          image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=300',
          petTypes: ['DOG', 'CAT'],
          status: 'ACTIVE',
          bookingsCount: 32,
        },
        {
          id: 3,
          name: 'Combo Spa VIP',
          description: 'Trọn gói tắm, cắt tỉa, massage thư giãn',
          duration: 120,
          basePrice: 450000,
          image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300',
          petTypes: ['DOG', 'CAT'],
          status: 'ACTIVE',
          bookingsCount: 28,
        },
        {
          id: 4,
          name: 'Khám sức khỏe',
          description: 'Kiểm tra sức khỏe tổng quát cho thú cưng',
          duration: 45,
          basePrice: 200000,
          image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=300',
          petTypes: ['DOG', 'CAT', 'BIRD', 'HAMSTER'],
          status: 'INACTIVE',
          bookingsCount: 15,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePetTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      petTypes: prev.petTypes.includes(type)
        ? prev.petTypes.filter(t => t !== type)
        : [...prev.petTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, formData);
        toast.success('Cập nhật dịch vụ thành công!');
      } else {
        await servicesApi.create(formData);
        toast.success('Thêm dịch vụ thành công!');
      }
      fetchServices();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      basePrice: service.basePrice,
      image: service.image,
      petTypes: service.petTypes,
      status: service.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      try {
        await servicesApi.delete(serviceId);
        toast.success('Đã xóa dịch vụ');
        fetchServices();
      } catch (error) {
        toast.error('Không thể xóa dịch vụ');
      }
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const newStatus = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await servicesApi.update(service.id, { ...service, status: newStatus });
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'ẩn'} dịch vụ`);
      fetchServices();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration: 60,
      basePrice: '',
      image: '',
      petTypes: ['DOG', 'CAT'],
      status: 'ACTIVE',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const petTypeOptions = [
    { value: 'DOG', label: 'Chó' },
    { value: 'CAT', label: 'Mèo' },
    { value: 'BIRD', label: 'Chim' },
    { value: 'HAMSTER', label: 'Hamster' },
    { value: 'RABBIT', label: 'Thỏ' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý dịch vụ</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Thêm dịch vụ
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-sm overflow-hidden ${service.status === 'INACTIVE' ? 'opacity-60' : ''}`}
          >
            <div className="relative h-40">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleToggleStatus(service)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    service.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}
                >
                  {service.status === 'ACTIVE' ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {service.status === 'INACTIVE' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">Đã ẩn</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{service.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.description}</p>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <FiClock className="text-petshop-green" />
                  {service.duration} phút
                </div>
                <div className="flex items-center gap-1 text-petshop-orange font-medium">
                  <FiDollarSign />
                  Từ {formatPrice(service.basePrice)}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {service.petTypes.map(type => (
                  <span key={type} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {petTypeOptions.find(p => p.value === type)?.label || type}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-500">{service.bookingsCount} lượt đặt</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-500 hover:text-petshop-orange hover:bg-orange-50 rounded-lg"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên dịch vụ *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VD: Tắm và Vệ sinh"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Mô tả chi tiết dịch vụ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá cơ bản (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="150000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại thú cưng áp dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {petTypeOptions.map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border-2 transition-colors ${
                        formData.petTypes.includes(type.value)
                          ? 'border-petshop-orange bg-petshop-orange/10 text-petshop-orange'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.petTypes.includes(type.value)}
                        onChange={() => handlePetTypeChange(type.value)}
                        className="hidden"
                      />
                      <MdPets />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingService ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;
