'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
    TrendingUp,
    DollarSign,
    Users,
    Briefcase,
    Calendar,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    PieChart as PieChartIcon,
    Download,
    FileText,
    Table,
    Activity,
    ChevronDown,
    Filter
} from 'lucide-react';
import adminApi from '@/api/adminAxios';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
    const { t } = useTranslation();
    const [reportType, setReportType] = useState('total');
    const [dateRange, setDateRange] = useState('thisMonth');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchReports = async (showMainLoader = false) => {
        if (showMainLoader) setLoading(true);
        else setGenerating(true);

        try {
            let url = `/admin/reports?type=${reportType}&dateRange=${dateRange}`;
            if (dateRange === 'custom') {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await adminApi.get(url);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetchReports(true);
    }, []);

    const handleGenerate = () => {
        fetchReports();
    };

    const handleExportPDF = () => {
        if (!data) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Domate - " + t('admin.reportResults'), 14, 20);
        doc.setFontSize(10);
        doc.text(`${t('admin.date')}: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);
        doc.text(`${t('admin.reportType')}: ${t(`admin.reports.${reportType}`)}`, 14, 34);
        doc.text(`${t('admin.dateRange')}: ${t(`admin.reports.${dateRange}`)}`, 14, 40);

        const summaryData = [
            [t('admin.totalBookings'), reportType === 'users' ? data.summary.totalUsers : data.summary.totalBookings || 0],
            [t('admin.totalCommission'), `₹${data.summary.totalCommission || 0}`],
            [t('admin.totalRevenue'), `₹${data.summary.totalRevenue || 0}`]
        ];

        autoTable(doc, {
            startY: 50,
            head: [[t('admin.metric'), t('admin.value')]],
            body: summaryData,
        });

        doc.save(`Domate_Report_${reportType}_${dateRange}.pdf`);
    };

    const handleExportCSV = () => {
        if (!data) return;
        const wsData = [
            [t('admin.metric'), t('admin.value')],
            [t('admin.totalBookings'), reportType === 'users' ? data.summary.totalUsers : data.summary.totalBookings || 0],
            [t('admin.totalCommission'), data.summary.totalCommission || 0],
            [t('admin.totalRevenue'), data.summary.totalRevenue || 0]
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report Summary");
        XLSX.writeFile(wb, `Domate_Report_${reportType}_${dateRange}.xlsx`);
    };

    const reportLabels: Record<string, string> = {
        'total': t('admin.totalSystemReport'),
        'provider': t('admin.providerPerformance'),
        'users': t('admin.userActivityReport'),
        'commission': t('admin.serviceCommission')
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-fade-in text-black">
                {/* Header Context */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h1 className="text-2xl font-black text-soft-black tracking-tight">{t('admin.adminPanel')}</h1>
                </div>

                {/* Filter Controls Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText className="w-4 h-4" />
                            </div>
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('admin.generateReports')}</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.reportType')}</p>
                                <div className="relative group">
                                    <select
                                        className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all appearance-none font-bold text-soft-black cursor-pointer shadow-sm group-hover:border-gray-200"
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                    >
                                        <option value="total">{t('admin.totalSystemReport')}</option>
                                        <option value="provider">{t('admin.providerPerformance')}</option>
                                        <option value="users">{t('admin.userActivityReport')}</option>
                                        <option value="commission">{t('admin.serviceCommission')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-soft-black transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.dateRange')}</p>
                                <div className="relative group">
                                    <select
                                        className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all appearance-none font-bold text-soft-black cursor-pointer shadow-sm group-hover:border-gray-200"
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                    >
                                        <option value="today">{t('admin.today', 'Today')}</option>
                                        <option value="thisWeek">{t('admin.thisWeek', 'This Week')}</option>
                                        <option value="thisMonth">{t('admin.thisMonth', 'This Month')}</option>
                                        <option value="lastMonth">{t('admin.lastMonth', 'Last Month')}</option>
                                        <option value="thisYear">{t('admin.thisYear', 'This Year')}</option>
                                        <option value="custom">{t('admin.customRange', 'Custom Range')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-soft-black transition-colors" />
                                </div>
                            </div>

                            <div className={`space-y-1.5 transition-all duration-300 ${dateRange === 'custom' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.startDate')}</p>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all font-bold text-soft-black cursor-pointer shadow-sm group-hover:border-gray-200"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={`space-y-1.5 transition-all duration-300 ${dateRange === 'custom' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.endDate')}</p>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all font-bold text-soft-black cursor-pointer shadow-sm group-hover:border-gray-200"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                        {t('admin.generateBtn')}
                    </button>
                </div>

                {/* Report Display Area */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-sm">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-soft-black tracking-tight">{t('admin.reportResults')}</h2>
                    </div>

                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('admin.fetchingAnalytics')}</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-10">
                            {/* Summary Header */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-soft-black tracking-tight uppercase italic">{reportLabels[reportType]}</h3>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t('admin.insightsFor', { range: dateRange === 'custom' ? `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}` : dateRange.replace(/([A-Z])/g, ' $1').toLowerCase() })}</p>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={handleExportPDF}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100"
                                    >
                                        <Download className="w-4 h-4" /> {t('admin.exportPDF')}
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-green-50 text-green-700 rounded-2xl font-bold text-sm hover:bg-green-100 transition-all border border-green-100"
                                    >
                                        <Table className="w-4 h-4" /> {t('admin.exportCSV')}
                                    </button>
                                </div>
                            </div>

                            {/* Summary Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50/50 p-8 rounded-4xl border border-gray-50 space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.totalBookings')}</p>
                                    <p className="text-4xl font-black text-soft-black tracking-tighter">
                                        {reportType === 'users' ? data.summary.totalUsers : data.summary.totalBookings}
                                    </p>
                                </div>

                                {reportType !== 'users' && (
                                    <>
                                        <div className="bg-gray-50/50 p-8 rounded-4xl border border-gray-50 space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.totalCommission')}</p>
                                            <p className="text-4xl font-black text-green-600 tracking-tighter">₹{data.summary.totalCommission.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50/50 p-8 rounded-4xl border border-gray-50 space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.totalRevenue')}</p>
                                            <p className="text-4xl font-black text-indigo-600 tracking-tighter">₹{data.summary.totalRevenue.toLocaleString()}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Chart Area */}
                            <div className="bg-gray-50/30 rounded-[2.5rem] p-6 border border-gray-50 min-h-[400px] flex flex-col items-center justify-center">
                                {data.chartData && data.chartData.length > 0 ? (
                                    <div className="w-full h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.chartData}>
                                                <defs>
                                                    <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={reportType === 'users' ? "#3b82f6" : "#6366f1"} stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor={reportType === 'users' ? "#3b82f6" : "#6366f1"} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="_id"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                                    dy={10}
                                                    tickFormatter={(val) => format(new Date(val), 'dd MMM')}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                                    dx={-10}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '1.25rem',
                                                        border: 'none',
                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                        padding: '1rem'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey={reportType === 'users' ? 'count' : 'bookings'}
                                                    stroke={reportType === 'users' ? "#3b82f6" : "#6366f1"}
                                                    strokeWidth={4}
                                                    fillOpacity={1}
                                                    fill="url(#colorReport)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="flex justify-center">
                                            <Activity className="w-16 h-16 text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('admin.noDataFound')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 border-2 border-dashed border-gray-100 rounded-4xl flex flex-col items-center justify-center space-y-4">
                            <Activity className="w-12 h-12 text-gray-200 stroke-[1.5]" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('admin.selectCriteria')}</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
