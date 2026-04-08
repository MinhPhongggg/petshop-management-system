import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSend, FiCheckCircle, FiXCircle, FiCalendar, FiBarChart2, FiRefreshCw, FiUsers, FiClock } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { spaReminderApi } from '../../services/api';

const AdminRemindersPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('ready');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes, eligibleRes] = await Promise.all([
        spaReminderApi.getLogs({ page: currentPage, size: 20 }),
        spaReminderApi.getStats(),
        spaReminderApi.getEligible(),
      ]);
      setLogs(logsRes.data.content || []);
      setTotalPages(logsRes.data.totalPages || 0);
      setStats(statsRes.data);
      setEligible(eligibleRes.data || []);
    } catch (error) {
      console.error('Error fetching reminder data:', error);
      toast.error('Không thể tải dữ liệu nhắc nhở');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTriggerReminders = async () => {
    const readyCount = eligible.filter(e => e.ready).length;
    if (readyCount === 0) {
      toast.error('Không có khách hàng nào đủ điều kiện gửi ngay');
      return;
    }
    if (!window.confirm(`Bạn có muốn gửi email nhắc nhở đến ${readyCount} khách hàng đủ điều kiện?`)) return;
    setSending(true);
    try {
      const response = await spaReminderApi.triggerReminders();
      toast.success(response.data.message || `Đã gửi ${response.data.sentCount} email`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email');
    } finally {
      setSending(false);
    }
  };

  const handleSendIndividual = async (bookingId, petName) => {
    if (!window.confirm(`Gửi email nhắc nhở cho boss ${petName}?`)) return;
    setSendingId(bookingId);
    try {
      await spaReminderApi.sendManualReminder(bookingId);
      toast.success(`Đã gửi email nhắc nhở thành công cho ${petName}!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email');
    } finally {
      setSendingId(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const readyCount = eligible.length;
  const suggestedReadyCount = eligible.filter(e => e.suggestedReady).length;

  if (loading && logs.length === 0 && eligible.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nhắc nhở Spa</h1>
          <p className="text-gray-500 mt-1">Quản lý gửi email nhắc nhở khách hàng đặt lịch spa</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={handleTriggerReminders}
            disabled={sending || readyCount === 0}
            className="flex items-center gap-2 px-5 py-2 bg-petshop-orange text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FiSend />
            )}
            {sending ? 'Đang gửi...' : `Gửi tất cả (${readyCount})`}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FiUsers className="text-purple-500" />
              </div>
              <span className="text-sm text-gray-500">Đủ điều kiện</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{eligible.length}</p>
            <p className="text-xs text-gray-400 mt-1">{suggestedReadyCount} đã đủ ngày</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FiMail className="text-blue-500" />
              </div>
              <span className="text-sm text-gray-500">Tổng đã gửi</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalSent || 0}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <FiCalendar className="text-green-500" />
              </div>
              <span className="text-sm text-gray-500">Tuần này</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.sentThisWeek || 0}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FiBarChart2 className="text-orange-500" />
              </div>
              <span className="text-sm text-gray-500">Tháng này</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.sentThisMonth || 0}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiCheckCircle className="text-emerald-500" />
              </div>
              <span className="text-sm text-gray-500">Tỉ lệ thành công</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{(stats.successRate || 0).toFixed(1)}%</p>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'ready'
              ? 'bg-white text-petshop-orange shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiCheckCircle /> Đã đủ ngày
          {suggestedReadyCount > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{suggestedReadyCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'eligible'
              ? 'bg-white text-petshop-orange shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiUsers /> Tất cả
          {eligible.length > 0 && (
            <span className="bg-petshop-orange text-white text-xs px-2 py-0.5 rounded-full">{eligible.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-white text-petshop-orange shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiMail /> Lịch sử gửi
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'rules'
              ? 'bg-white text-petshop-orange shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdPets /> Quy tắc
        </button>
      </div>

      {/* Tab: Ready Customers (đã đủ ngày theo quy tắc) */}
      {activeTab === 'ready' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              Khách hàng đã đủ ngày nhắc nhở
            </h3>
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> {suggestedReadyCount} khách hàng
            </span>
          </div>

          {suggestedReadyCount === 0 ? (
            <div className="p-12 text-center">
              <FiCheckCircle className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Không có khách hàng đủ ngày</h3>
              <p className="text-gray-500">Khi khách hàng đủ số ngày theo quy tắc, họ sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Khách hàng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Thú cưng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Dịch vụ đã dùng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Ngày hoàn thành</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Số ngày</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Quy tắc</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eligible.filter(e => e.suggestedReady).map((item, index) => (
                    <motion.tr
                      key={item.bookingId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.userName}</p>
                          <p className="text-xs text-gray-400">{item.userEmail}</p>
                          {item.userPhone && <p className="text-xs text-gray-400">{item.userPhone}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MdPets className="text-petshop-orange text-sm" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.petName}</p>
                            <p className="text-xs text-gray-400">
                              {item.petType === 'DOG' ? 'Chó' : item.petType === 'CAT' ? 'Mèo' : item.petType}
                              {item.petBreed && ` - ${item.petBreed}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{item.serviceName}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(item.completedAt || item.bookingDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-green-600">
                          {item.daysSinceCompletion} ngày
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {item.reminderDays} ngày
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleSendIndividual(item.bookingId, item.petName)}
                          disabled={sendingId === item.bookingId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-petshop-orange text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                          {sendingId === item.bookingId ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                          ) : (
                            <FiSend className="text-xs" />
                          )}
                          Gửi
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Eligible Customers */}
      {activeTab === 'eligible' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              Khách hàng đủ điều kiện nhận nhắc nhở
            </h3>
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> {eligible.length} khách hàng
            </span>
          </div>

          {eligible.length === 0 ? (
            <div className="p-12 text-center">
              <FiUsers className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Không có khách hàng đủ điều kiện</h3>
              <p className="text-gray-500">Khi khách hàng hoàn thành dịch vụ spa và chưa được nhắc, họ sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Khách hàng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Thú cưng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Dịch vụ đã dùng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Ngày hoàn thành</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Số ngày</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Quy tắc</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Trạng thái</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eligible.map((item, index) => (
                    <motion.tr
                      key={item.bookingId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.userName}</p>
                          <p className="text-xs text-gray-400">{item.userEmail}</p>
                          {item.userPhone && <p className="text-xs text-gray-400">{item.userPhone}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MdPets className="text-petshop-orange text-sm" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.petName}</p>
                            <p className="text-xs text-gray-400">
                              {item.petType === 'DOG' ? 'Chó' : item.petType === 'CAT' ? 'Mèo' : item.petType}
                              {item.petBreed && ` - ${item.petBreed}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{item.serviceName}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(item.completedAt || item.bookingDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-semibold ${item.suggestedReady ? 'text-green-600' : 'text-yellow-600'}`}>
                          {item.daysSinceCompletion} ngày
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {item.reminderDays} ngày
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {item.suggestedReady ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <FiCheckCircle /> Đã đủ ngày
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-500 text-sm">
                            <FiClock /> Còn {item.reminderDays - item.daysSinceCompletion} ngày
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleSendIndividual(item.bookingId, item.petName)}
                          disabled={sendingId === item.bookingId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-petshop-orange text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                          {sendingId === item.bookingId ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                          ) : (
                            <FiSend className="text-xs" />
                          )}
                          Gửi
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-gray-800">Lịch sử gửi nhắc nhở</h3>
          </div>

          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <FiMail className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có nhắc nhở nào</h3>
              <p className="text-gray-500">Hệ thống sẽ tự động gửi email khi có khách hàng đủ điều kiện</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Khách hàng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Thú cưng</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Dịch vụ</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Mã booking</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Tiêu đề</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Trạng thái</th>
                    <th className="px-5 py-3 text-sm font-medium text-gray-500">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{log.userName}</p>
                          <p className="text-xs text-gray-400">{log.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MdPets className="text-petshop-orange text-sm" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{log.petName}</p>
                            <p className="text-xs text-gray-400">
                              {log.petType === 'DOG' ? 'Chó' : log.petType === 'CAT' ? 'Mèo' : log.petType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{log.serviceName}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-gray-500">{log.bookingCode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-[200px] truncate" title={log.subject}>
                          {log.subject}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {log.status === 'SENT' ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <FiCheckCircle /> Thành công
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-sm" title={log.errorMessage}>
                            <FiXCircle /> Thất bại
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDateTime(log.sentAt)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded-lg text-sm border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 rounded-lg text-sm border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-gradient-to-r from-petshop-orange/5 to-petshop-green/5 rounded-2xl p-6 border border-petshop-orange/10">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MdPets className="text-petshop-orange" /> Quy tắc nhắc nhở tự động
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/70 rounded-xl p-4">
              <p className="font-medium text-gray-700">🐕 Chó lông dài</p>
              <p className="text-gray-500 mt-1">Nhắc sau <strong>14 ngày</strong></p>
              <p className="text-xs text-gray-400 mt-1">Poodle, Shih Tzu, Golden, Husky, Samoyed, Alaska, Pomeranian...</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4">
              <p className="font-medium text-gray-700">🐕 Chó lông ngắn</p>
              <p className="text-gray-500 mt-1">Nhắc sau <strong>21 ngày</strong></p>
              <p className="text-xs text-gray-400 mt-1">Corgi, Chihuahua, Phú Quốc...</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4">
              <p className="font-medium text-gray-700">🐱 Mèo</p>
              <p className="text-gray-500 mt-1">Nhắc sau <strong>21 ngày</strong></p>
              <p className="text-xs text-gray-400 mt-1">Tất cả giống mèo</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            ⏰ Email được gửi tự động lúc 9:00 sáng mỗi ngày. Hệ thống chỉ gửi 1 lần cho mỗi lịch hẹn hoàn thành.
            Admin có thể gửi thủ công cho từng khách hàng bất kỳ lúc nào.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminRemindersPage;
