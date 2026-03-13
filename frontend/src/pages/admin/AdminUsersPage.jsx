import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiMail, FiPhone, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usersApi } from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editRoleUserId, setEditRoleUserId] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({
        role: roleFilter || undefined,
        page: pagination.page,
        size: 20,
      });
      const data = response.data;
      setUsers(data.content || data);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || (data.content || data).length,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      await usersApi.updateStatus(userId, !currentActive);
      toast.success(`Đã ${!currentActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      fetchUsers();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await usersApi.updateRole(userId, newRole);
      toast.success('Đã cập nhật vai trò người dùng');
      setEditRoleUserId(null);
      fetchUsers();
    } catch (error) {
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await usersApi.delete(userId);
        toast.success('Đã xóa người dùng');
        fetchUsers();
      } catch (error) {
        toast.error('Không thể xóa người dùng');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      ADMIN: { bg: 'bg-red-100', text: 'text-red-600', label: 'Admin' },
      STAFF: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Nhân viên' },
      CUSTOMER: { bg: 'bg-green-100', text: 'text-green-600', label: 'Khách hàng' },
    };
    const config = roleConfig[role] || roleConfig.CUSTOMER;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (active) => {
    if (active) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">Hoạt động</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Vô hiệu</span>;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Tổng người dùng</p>
          <p className="text-2xl font-bold text-gray-800">{pagination.totalElements || users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Khách hàng</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'CUSTOMER').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Nhân viên</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'STAFF').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Hoạt động</p>
          <p className="text-2xl font-bold text-petshop-orange">{users.filter(u => u.active).length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Người dùng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Liên hệ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Đơn hàng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-full flex items-center justify-center text-white font-medium">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-sm text-gray-500">Từ {user.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="flex items-center gap-1 text-gray-600">
                        <FiMail className="text-gray-400" /> {user.email}
                      </p>
                      <p className="flex items-center gap-1 text-gray-600">
                        <FiPhone className="text-gray-400" /> {user.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 text-gray-600">{user.ordersCount ?? user.orderCount ?? 0}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.active)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.active)}
                        className={`p-2 rounded-lg ${
                          user.active
                            ? 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                            : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                        }`}
                        title={user.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {user.active ? <FiUserX /> : <FiUserCheck />}
                      </button>
                      {user.role !== 'ADMIN' && (
                        editRoleUserId === user.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              defaultValue={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              className="text-xs border rounded px-1 py-1"
                              autoFocus
                            >
                              <option value="CUSTOMER">Khách hàng</option>
                              <option value="STAFF">Nhân viên</option>
                            </select>
                            <button
                              onClick={() => setEditRoleUserId(null)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <FiX className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditRoleUserId(user.id)}
                            className="p-2 text-gray-500 hover:text-petshop-orange hover:bg-orange-50 rounded-lg"
                            title="Đổi vai trò"
                          >
                            <FiEdit2 />
                          </button>
                        )
                      )}
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
