import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiClock, FiDollarSign, FiX } from 'react-icons/fi';

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
    image: '',
    petType: 'ALL',
    pricings: [
      { petType: 'DOG', minWeight: 0, maxWeight: '', price: '' },
    ],
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePricingChange = (index, field, value) => {
    setFormData(prev => {
      const newPricings = [...prev.pricings];
      newPricings[index] = { ...newPricings[index], [field]: value };
      return { ...prev, pricings: newPricings };
    });
  };

  const addPricing = () => {
    setFormData(prev => ({
      ...prev,
      pricings: [...prev.pricings, { petType: 'DOG', minWeight: 0, maxWeight: '', price: '' }],
    }));
  };

  const removePricing = (index) => {
    setFormData(prev => ({
      ...prev,
      pricings: prev.pricings.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      description: formData.description,
      duration: parseInt(formData.duration),
      image: formData.image,
      petType: formData.petType,
      pricings: formData.pricings
        .filter(p => p.price)
        .map(p => ({
          petType: p.petType,
          minWeight: parseFloat(p.minWeight) || 0,
          maxWeight: p.maxWeight === '' || p.maxWeight === null ? null : parseFloat(p.maxWeight),
          price: parseFloat(p.price),
        })),
    };

    try {
      if (editingService) {
        await servicesApi.update(editingService.id, payload);
        toast.success('Cập nhật dịch vụ thành công!');
      } else {
        await servicesApi.create(payload);
        toast.success('Thêm dịch vụ thành công!');
      }
      fetchServices();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      duration: service.duration || 60,
      image: service.imageUrl || '',
      petType: service.petType || 'ALL',
      pricings: service.pricingList && service.pricingList.length > 0
        ? service.pricingList.map(p => ({
            petType: p.tierName || 'DOG',
            minWeight: p.minWeight ?? 0,
            maxWeight: p.maxWeight === null || p.maxWeight === undefined ? '' : p.maxWeight,
            price: p.price || '',
          }))
        : [{ petType: 'DOG', minWeight: 0, maxWeight: 5, price: '' }],
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
      const newActive = !service.active;
      await servicesApi.update(service.id, {
        name: service.name,
        duration: service.duration,
        active: newActive,
      });
      toast.success(`Đã ${newActive ? 'kích hoạt' : 'ẩn'} dịch vụ`);
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
      image: '',
      petType: 'ALL',
      pricings: [
        { petType: 'DOG', minWeight: 0, maxWeight: '', price: '' },
      ],
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getMinPrice = (service) => {
    if (service.minPrice) return formatPrice(service.minPrice);
    if (service.pricingList && service.pricingList.length > 0) {
      const min = Math.min(...service.pricingList.map(p => p.price));
      return formatPrice(min);
    }
    return 'Liên hệ';
  };

  const petTypeLabel = (type) => {
    const map = { DOG: '🐕 Chó', CAT: '🐱 Mèo', BIRD: '🐦 Chim', FISH: '🐟 Cá', OTHER: '🐾 Khác', ALL: '🐾 Tất cả' };
    return map[type] || type;
  };

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
            className={`bg-white rounded-2xl shadow-sm overflow-hidden ${!service.active ? 'opacity-60' : ''}`}
          >
            <div className="relative h-40">
              <img
                src={service.imageUrl || '/images/placeholder-service.jpg'}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              {!service.active && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">Đã ẩn</span>
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={() => handleToggleStatus(service)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    service.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}
                  title={service.active ? 'Ẩn dịch vụ' : 'Hiện dịch vụ'}
                >
                  {service.active ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
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
                  Từ {getMinPrice(service)}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {petTypeLabel(service.petType)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-500">
                  {service.pricingList?.length || 0} mức giá
                </span>
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
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                    Thời gian (phút) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại thú cưng
                  </label>
                  <select
                    name="petType"
                    value={formData.petType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="DOG">Chó</option>
                    <option value="CAT">Mèo</option>
                    <option value="BIRD">Chim</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              {/* Bảng giá theo cân nặng */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bảng giá theo cân nặng
                  </label>
                  <button
                    type="button"
                    onClick={addPricing}
                    className="text-sm text-petshop-green hover:underline flex items-center gap-1"
                  >
                    <FiPlus className="w-3 h-3" /> Thêm mức giá
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.pricings.map((pricing, index) => {
                    const isLast = index === formData.pricings.length - 1;
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <select
                          value={pricing.petType}
                          onChange={(e) => handlePricingChange(index, 'petType', e.target.value)}
                          className="input-field w-24 text-sm"
                        >
                          <option value="DOG">Chó</option>
                          <option value="CAT">Mèo</option>
                          <option value="BIRD">Chim</option>
                          <option value="OTHER">Khác</option>
                        </select>
                        <input
                          type="number"
                          value={pricing.minWeight}
                          onChange={(e) => handlePricingChange(index, 'minWeight', e.target.value)}
                          className="input-field w-20 text-sm"
                          placeholder="Từ kg"
                          min="0"
                          step="any"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          value={pricing.maxWeight === null || pricing.maxWeight === '' ? '' : pricing.maxWeight}
                          onChange={(e) => handlePricingChange(index, 'maxWeight', e.target.value === '' ? '' : e.target.value)}
                          className={`input-field w-20 text-sm ${isLast ? 'placeholder-gray-400 italic' : ''}`}
                          placeholder={isLast ? 'Max' : 'Đến kg'}
                          min="0"
                          step="any"
                        />
                        <span className="text-gray-400 text-sm">kg</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pricing.price}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            handlePricingChange(index, 'price', val);
                          }}
                          className="input-field flex-1 text-sm"
                          placeholder="Giá (VNĐ)"
                        />
                        {formData.pricings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePricing(index)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
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
