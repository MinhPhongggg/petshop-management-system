import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { petsApi } from '../../services/api';

const MyPetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'DOG',
    breed: '',
    age: '',
    weight: '',
    gender: 'MALE',
    notes: '',
  });

  const petTypes = [
    { value: 'DOG', label: 'Chó' },
    { value: 'CAT', label: 'Mèo' },
    { value: 'BIRD', label: 'Chim' },
    { value: 'HAMSTER', label: 'Hamster' },
    { value: 'RABBIT', label: 'Thỏ' },
    { value: 'OTHER', label: 'Khác' },
  ];

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await petsApi.getMyPets();
      setPets(response.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPet) {
        await petsApi.update(editingPet.id, formData);
        toast.success('Cập nhật thú cưng thành công!');
      } else {
        await petsApi.create(formData);
        toast.success('Thêm thú cưng thành công!');
      }
      fetchPets();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      type: pet.petType || pet.type,  // BE returns petType
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      gender: pet.gender,
      notes: pet.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (petId) => {
    if (window.confirm('Bạn có chắc muốn xóa thú cưng này?')) {
      try {
        await petsApi.delete(petId);
        toast.success('Đã xóa thú cưng');
        fetchPets();
      } catch (error) {
        toast.error('Không thể xóa thú cưng');
      }
    }
  };

  const resetForm = () => {
    setEditingPet(null);
    setFormData({
      name: '',
      type: 'DOG',
      breed: '',
      age: '',
      weight: '',
      gender: 'MALE',
      notes: '',
    });
  };

  const getPetTypeLabel = (type) => {
    const petType = petTypes.find(t => t.value === type);
    return petType ? petType.label : type;
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
        <h1 className="text-2xl font-bold text-gray-800">Thú cưng của tôi</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Thêm thú cưng
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <MdPets className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có thú cưng</h3>
          <p className="text-gray-500 mb-6">Thêm thú cưng để quản lý và đặt lịch dễ dàng hơn</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Thêm thú cưng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="relative h-48">
                {(pet.avatarUrl || pet.image) ? (
                  <img
                    src={pet.avatarUrl || pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-petshop-orange to-petshop-yellow flex items-center justify-center">
                    <MdPets className="text-6xl text-white" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(pet)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
                  >
                    <FiEdit2 className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50"
                  >
                    <FiTrash2 className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">
                    <span className="font-medium text-gray-700">Loại:</span> {getPetTypeLabel(pet.petType || pet.type)}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-medium text-gray-700">Giống:</span> {pet.breed}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-medium text-gray-700">Tuổi:</span> {pet.age} tuổi
                  </p>
                  <p className="text-gray-500">
                    <span className="font-medium text-gray-700">Cân nặng:</span> {pet.weight} kg
                  </p>
                </div>
                {pet.notes && (
                  <p className="text-sm text-gray-500 italic mt-3 pt-3 border-t">
                    {pet.notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingPet ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thú cưng *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nhập tên thú cưng"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại thú cưng *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    {petTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="MALE">Đực</option>
                    <option value="FEMALE">Cái</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giống
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VD: Poodle, Anh lông ngắn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tuổi (năm)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Đặc điểm, tính cách, dị ứng..."
                />
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
                  {editingPet ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyPetsPage;
