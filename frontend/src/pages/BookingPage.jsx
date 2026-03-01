import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { servicesApi, petsApi, bookingsApi } from '../services/api';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceId: searchParams.get('service') || '',
    petId: '',
    date: '',
    time: '',
    notes: '',
    // For guest booking
    customerName: user?.fullName || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    petName: '',
    petType: 'DOG',
    petBreed: '',
    petWeight: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchServices();
    if (isAuthenticated) {
      fetchPets();
    }
  }, [isAuthenticated]);

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getActive();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async () => {
    try {
      const response = await petsApi.getMyPets();
      setPets(response.data);
    } catch (error) {
      setPets([]);
    }
  };

  useEffect(() => {
    if (formData.date) {
      generateTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, formData.serviceId]);

  const generateTimeSlots = () => {
    // Generate time slots from 8:00 to 18:00
    const slots = [];
    const selectedService = services.find(s => s.id === parseInt(formData.serviceId) || s.slug === formData.serviceId);
    const duration = selectedService?.duration || 60;

    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const endHour = hour + Math.floor((minute + duration) / 60);
        const endMinute = (minute + duration) % 60;
        
        if (endHour < 19 || (endHour === 19 && endMinute === 0)) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          // Randomly mark some as unavailable for demo
          const available = Math.random() > 0.3;
          slots.push({ time, available });
        }
      }
    }
    setAvailableSlots(slots);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated && !formData.customerPhone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setSubmitting(true);
    try {
      await bookingsApi.create({
        serviceId: parseInt(formData.serviceId) || services.find(s => s.slug === formData.serviceId)?.id,
        petId: formData.petId || null,
        bookingDate: formData.date,
        startTime: formData.time,
        customerNote: formData.notes,  // BE expects 'customerNote' not 'notes'
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        petInfo: !formData.petId ? {
          name: formData.petName,
          type: formData.petType,
          breed: formData.petBreed,
          weight: parseFloat(formData.petWeight) || null,
        } : null,
      });

      toast.success('Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId) || s.slug === formData.serviceId);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const canProceed = () => {
    if (step === 1) return formData.serviceId;
    if (step === 2) return formData.date && formData.time;
    if (step === 3) {
      if (isAuthenticated) {
        return formData.petId || (formData.petName && formData.petWeight);
      }
      return formData.customerName && formData.customerPhone && formData.petName && formData.petWeight;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-petshop-cream py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Đặt lịch <span className="gradient-text">Spa & Grooming</span>
          </motion.h1>
          <p className="text-gray-600">
            Đặt lịch nhanh chóng, đội ngũ chuyên nghiệp phục vụ tận tâm
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Chọn dịch vụ', icon: MdPets },
              { num: 2, label: 'Chọn ngày giờ', icon: FiCalendar },
              { num: 3, label: 'Thông tin', icon: FiUser },
              { num: 4, label: 'Xác nhận', icon: FiCheck },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step >= s.num
                        ? 'bg-petshop-green text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? <FiCheck /> : <s.icon />}
                  </div>
                  <span className={`text-sm mt-2 hidden md:block ${step >= s.num ? 'text-petshop-green font-medium' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${step > s.num ? 'bg-petshop-green' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-lg"
            >
              {/* Step 1: Select Service */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Chọn dịch vụ</h2>
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.serviceId === service.id.toString() || formData.serviceId === service.slug
                            ? 'border-petshop-green bg-petshop-green/5'
                            : 'border-gray-200 hover:border-petshop-green/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="serviceId"
                          value={service.id}
                          checked={formData.serviceId === service.id.toString() || formData.serviceId === service.slug}
                          onChange={handleChange}
                          className="w-5 h-5 text-petshop-green"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{service.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-4 h-4" />
                              {service.duration} phút
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-petshop-green">
                          Từ {formatPrice(service.pricingList?.[0]?.price || 0)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Date & Time */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Chọn ngày và giờ</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày đặt lịch
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="input-field"
                      required
                    />
                  </div>

                  {formData.date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn giờ ({selectedService?.duration || 60} phút)
                      </label>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setFormData(prev => ({ ...prev, time: slot.time }))}
                            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                              formData.time === slot.time
                                ? 'bg-petshop-green text-white'
                                : slot.available
                                ? 'bg-gray-100 hover:bg-petshop-green/10 text-gray-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Information */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin đặt lịch</h2>

                  {!isAuthenticated && (
                    <div className="mb-6 p-4 bg-petshop-orange/10 rounded-xl flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-petshop-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700">
                          <Link to="/login" className="text-petshop-orange font-medium hover:underline">
                            Đăng nhập
                          </Link>
                          {' '}để quản lý lịch đặt và nhận ưu đãi thành viên!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Customer Info (for guests) */}
                  {!isAuthenticated && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại *
                          </label>
                          <input
                            type="tel"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            className="input-field"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleChange}
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pet Selection */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Thông tin thú cưng</h3>
                    
                    {isAuthenticated && pets.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn thú cưng của bạn
                        </label>
                        <div className="grid gap-3">
                          {pets.map((pet) => (
                            <label
                              key={pet.id}
                              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.petId === pet.id.toString()
                                  ? 'border-petshop-green bg-petshop-green/5'
                                  : 'border-gray-200 hover:border-petshop-green/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="petId"
                                value={pet.id}
                                checked={formData.petId === pet.id.toString()}
                                onChange={handleChange}
                                className="w-5 h-5 text-petshop-green"
                              />
                              <div className="w-12 h-12 bg-petshop-orange/20 rounded-full flex items-center justify-center text-2xl">
                                {pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐱' : '🐾'}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{pet.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {pet.breed} • {pet.weight}kg
                                </p>
                              </div>
                            </label>
                          ))}
                          <label
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.petId === 'new'
                                ? 'border-petshop-green bg-petshop-green/5'
                                : 'border-gray-200 hover:border-petshop-green/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="petId"
                              value="new"
                              checked={formData.petId === 'new'}
                              onChange={handleChange}
                              className="w-5 h-5 text-petshop-green"
                            />
                            <span className="text-gray-600">+ Thêm thú cưng mới</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {(!isAuthenticated || pets.length === 0 || formData.petId === 'new') && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên thú cưng *
                          </label>
                          <input
                            type="text"
                            name="petName"
                            value={formData.petName}
                            onChange={handleChange}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại *
                          </label>
                          <select
                            name="petType"
                            value={formData.petType}
                            onChange={handleChange}
                            className="input-field"
                          >
                            <option value="DOG">Chó</option>
                            <option value="CAT">Mèo</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giống
                          </label>
                          <input
                            type="text"
                            name="petBreed"
                            value={formData.petBreed}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="VD: Poodle, Corgi, Mèo Anh..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cân nặng (kg) *
                          </label>
                          <input
                            type="number"
                            name="petWeight"
                            value={formData.petWeight}
                            onChange={handleChange}
                            className="input-field"
                            step="0.1"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú thêm
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="input-field"
                      placeholder="VD: Thú cưng sợ tiếng ồn, cần xử lý nhẹ nhàng..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Xác nhận đặt lịch</h2>
                  
                  <div className="bg-petshop-cream rounded-2xl p-6 mb-6">
                    <div className="grid gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dịch vụ</span>
                        <span className="font-semibold">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày</span>
                        <span className="font-semibold">
                          {new Date(formData.date).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giờ</span>
                        <span className="font-semibold">{formData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời lượng</span>
                        <span className="font-semibold">{selectedService?.duration} phút</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thú cưng</span>
                        <span className="font-semibold">
                          {formData.petId && formData.petId !== 'new'
                            ? pets.find(p => p.id === parseInt(formData.petId))?.name
                            : formData.petName}
                        </span>
                      </div>
                      {(!isAuthenticated || formData.petId === 'new') && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Liên hệ</span>
                            <span className="font-semibold">{formData.customerPhone}</span>
                          </div>
                        </>
                      )}
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Tạm tính</span>
                        <span className="font-bold text-petshop-green">
                          {formatPrice(selectedService?.pricingList?.[0]?.price || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    * Giá có thể thay đổi tùy theo cân nặng và tình trạng thú cưng. 
                    Nhân viên sẽ liên hệ xác nhận trong vòng 30 phút.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn-outline flex-1"
                  >
                    Quay lại
                  </button>
                )}
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                  </button>
                )}
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
