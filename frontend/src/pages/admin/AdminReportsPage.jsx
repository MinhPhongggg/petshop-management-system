import React, { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFileText, FiFilter, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reportsApi } from '../../services/api';

const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

const AdminReportsPage = () => {
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [topLimit, setTopLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [drilldownOrders, setDrilldownOrders] = useState([]);
  const [showDrilldown, setShowDrilldown] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [reportRes, drillRes] = await Promise.all([
        reportsApi.getBusinessReport(startDate, endDate, topLimit),
        reportsApi.drilldownOrders(startDate, endDate),
      ]);
      setReport(reportRes.data);
      setDrilldownOrders(drillRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

  const topSellingMax = useMemo(() => {
    const values = (report?.topSellingProducts || []).map((i) => Number(i.soldQuantity || 0));
    return Math.max(1, ...values);
  }, [report]);

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    try {
      const res = await reportsApi.exportBusinessExcel(startDate, endDate, topLimit);
      downloadBlob(res.data, `business-report-${startDate}-to-${endDate}.xlsx`);
    } catch {
      toast.error('Xuất Excel thất bại');
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await reportsApi.exportBusinessPdf(startDate, endDate, topLimit);
      downloadBlob(res.data, `business-report-${startDate}-to-${endDate}.pdf`);
    } catch {
      toast.error('Xuất PDF thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Báo cáo kinh doanh</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
            <FiDownload /> Excel
          </button>
          <button onClick={handleExportPdf} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
            <FiFileText /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-gray-500">Từ ngày</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Đến ngày</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Top N</label>
          <input type="number" min={5} max={50} value={topLimit} onChange={(e) => setTopLimit(Number(e.target.value || 10))} className="block border rounded-lg px-3 py-2 text-sm w-24" />
        </div>
        <button onClick={fetchReport} className="px-4 py-2 bg-petshop-orange text-white rounded-lg text-sm font-semibold flex items-center gap-2">
          <FiFilter /> Lọc dữ liệu
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-petshop-orange" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Doanh thu gộp" value={formatCurrency(report?.revenueProfit?.grossRevenue)} />
            <Card title="Lợi nhuận gộp" value={formatCurrency(report?.revenueProfit?.grossProfit)} />
            <Card title="Biên lợi nhuận" value={`${report?.revenueProfit?.grossMarginPercent || 0}%`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiTrendingUp /> Top sản phẩm bán chạy</h3>
              <div className="space-y-3">
                {(report?.topSellingProducts || []).map((item) => (
                  <div key={item.productId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.productName}</span>
                      <span className="text-gray-500">{item.soldQuantity}</span>
                    </div>
                    <div className="h-2 rounded bg-gray-100">
                      <div className="h-2 rounded bg-blue-500" style={{ width: `${(Number(item.soldQuantity || 0) / topSellingMax) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Hiệu quả khuyến mãi</h3>
              <div className="space-y-2 text-sm">
                <p>Số lượt dùng voucher: <b>{report?.voucherImpact?.usageCount || 0}</b></p>
                <p>Tổng giảm giá: <b>{formatCurrency(report?.voucherImpact?.totalDiscountAmount)}</b></p>
                <p>Doanh thu từ đơn có voucher: <b>{formatCurrency(report?.voucherImpact?.voucherOrderRevenue)}</b></p>
                <p>Tỷ lệ đóng góp doanh thu: <b>{report?.voucherImpact?.revenueUpliftPercent || 0}%</b></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Drill-down đơn hàng hoàn thành</h3>
              <button onClick={() => setShowDrilldown((v) => !v)} className="text-sm text-petshop-orange font-semibold">
                {showDrilldown ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </button>
            </div>
            {showDrilldown && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Mã đơn</th>
                      <th className="text-left py-2">Tổng tiền</th>
                      <th className="text-left py-2">Giảm giá</th>
                      <th className="text-left py-2">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldownOrders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50">
                        <td className="py-2">{o.orderCode}</td>
                        <td className="py-2">{formatCurrency(o.totalAmount)}</td>
                        <td className="py-2">{formatCurrency(o.discountAmount)}</td>
                        <td className="py-2">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

export default AdminReportsPage;
