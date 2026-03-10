'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
    Calendar,
    Search,
    User,
    Briefcase,
    Tag,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    DollarSign,
    Download,
    FileText,
    Table,
    ChevronDown,
    Eye,
    X,
    Info,
    Mail,
    Phone,
    MapPin,
    MessageSquare
} from 'lucide-react';
import adminApi from '@/api/adminAxios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

export default function BookingsPage() {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState('All Services');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/bookings');
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (booking: any) => {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled':
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const uniqueServices = [t('admin.allServices', 'All Services'), ...Array.from(new Set(bookings.map(b => b.service?.title).filter(Boolean)))];

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.serviceProvider?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b._id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesService = serviceFilter === t('admin.allServices', 'All Services') || b.service?.title === serviceFilter;

        return matchesSearch && matchesService;
    });

    const totalCommission = filteredBookings.reduce((sum, b) => sum + (b.commission || 0), 0);

    const handleExportCSV = () => {
        const data = filteredBookings.map(b => ({
            [t('admin.bookingId')]: b._id,
            [t('admin.user')]: b.user?.username,
            [t('admin.userEmail', 'User Email')]: b.user?.email,
            [t('admin.provider')]: b.serviceProvider?.username,
            [t('admin.service')]: b.service?.title,
            [t('admin.status')]: b.status,
            [t('admin.commission')]: b.commission || 0,
            [t('admin.date')]: format(new Date(b.createdAt), 'dd/MM/yyyy')
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `Domate_Bookings_${format(new Date(), 'dd_MM_yyyy')}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text(t('admin.bookingManagement'), 14, 15);
        const tableData = filteredBookings.map(b => [
            b._id.slice(-6).toUpperCase(),
            b.user?.username || 'N/A',
            b.serviceProvider?.username || 'N/A',
            b.service?.title || 'N/A',
            b.status || 'N/A',
            `₹${b.commission || 0}`,
            format(new Date(b.createdAt), 'dd/MM/yyyy')
        ]);
        autoTable(doc, {
            head: [[t('admin.id', 'ID'), t('admin.user'), t('admin.provider'), t('admin.service'), t('admin.status'), t('admin.commission'), t('admin.date')]],
            body: tableData,
            startY: 20
        });
        doc.save(`Domate_Bookings_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">{t('admin.bookingManagement')}</h1>
                        <p className="text-gray-500 font-medium">{t('admin.bookingSubtitle')}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-sm">
                        <span className="text-sm font-bold text-gray-500">{t('admin.totalCommission')}:</span>
                        <span className="text-xl font-black text-green-600">₹{totalCommission.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/2 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <select
                                    className="pl-4 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all appearance-none font-bold text-soft-black cursor-pointer shadow-sm group-hover:border-gray-200"
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                >
                                    {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-soft-black transition-colors" />
                            </div>
                        </div>

                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                            <input
                                type="text"
                                placeholder={t('admin.searchBookings')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleExportCSV}
                                className="px-6 py-3 bg-green-50 text-green-700 rounded-2xl font-bold text-sm hover:bg-green-100 transition-all flex items-center gap-2 border border-green-100"
                            >
                                <Table className="w-4 h-4" /> {t('admin.exportCSV')}
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="px-6 py-3 bg-orange-50 text-orange-700 rounded-2xl font-bold text-sm hover:bg-orange-100 transition-all flex items-center gap-2 border border-orange-100"
                            >
                                <FileText className="w-4 h-4" /> {t('admin.exportPDF')}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.bookingId').slice(0, 3)}...</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.user')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.provider')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.service')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.status')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.commission')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.date')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('admin.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center">
                                            <Loader2 className="w-10 h-10 text-gray-200 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium">{t('admin.loadingBookings')}</p>
                                        </td>
                                    </tr>
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <p className="text-xs text-gray-400 uppercase tracking-tight">
                                                    {booking._id.slice(0, 8)}...
                                                </p>
                                            </td>
                                            <td className="px-8 py-5 text-sm">
                                                <p className="text-soft-black font-medium">{booking.user?.username || 'Unknown'}</p>
                                                <p className="text-xs text-gray-400 font-medium">{booking.user?.email}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm">
                                                <p className="text-soft-black font-medium">{booking.serviceProvider?.username || 'Unknown'}</p>
                                                <p className="text-xs text-gray-400 font-medium">{booking.serviceProvider?.email}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm">
                                                <p className="text-soft-black font-medium">{booking.service?.title || 'Unknown'}</p>
                                                <p className="text-xs text-gray-400 font-medium">{booking.service?.category?.name}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                                    {booking.status?.replace('_', ' ') || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-green-600 font-medium">₹{booking.commission || 0}</span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(booking.createdAt), 'd/M/yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => openModal(booking)}
                                                    className="p-2.5 text-gray-400 hover:text-soft-black hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center text-gray-400 font-medium">{t('admin.noBookings')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Booking Details Modal */}
                {isDetailModalOpen && selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soft-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-soft-black tracking-tight">{t('admin.bookingDetails')}</h2>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-soft-black"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Service Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Briefcase className="w-4 h-4" /> {t('admin.service')}
                                        </div>
                                        <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-50">
                                            <p className="text-lg font-black text-soft-black mb-1">{selectedBooking.service?.title}</p>
                                            <p className="text-sm text-indigo-600 font-bold px-3 py-1 bg-indigo-50 rounded-lg inline-block">
                                                {selectedBooking.service?.category?.name || 'Category N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Tag className="w-4 h-4" /> {t('admin.status')} & {t('admin.commission')}
                                        </div>
                                        <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-50 flex justify-between items-center">
                                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusColor(selectedBooking.status)}`}>
                                                {selectedBooking.status?.replace('_', ' ')}
                                            </span>
                                            <p className="text-2xl font-black text-green-600">₹{selectedBooking.commission || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Customer Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <User className="w-4 h-4" /> {t('admin.customer')}
                                        </div>
                                        <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-50 space-y-3">
                                            <p className="font-black text-soft-black">{selectedBooking.user?.username}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Mail className="w-4 h-4" /> {selectedBooking.user?.email}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Provider Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Briefcase className="w-4 h-4" /> {t('admin.provider')}
                                        </div>
                                        <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-50 space-y-3">
                                            <p className="font-black text-soft-black">{selectedBooking.serviceProvider?.username}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Mail className="w-4 h-4" /> {selectedBooking.serviceProvider?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rejection/Cancellation Reason */}
                                {(selectedBooking.status === 'rejected' || selectedBooking.status === 'cancelled') && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                                            <MessageSquare className="w-4 h-4" /> {t('admin.reasonFor', { status: selectedBooking.status })}
                                        </div>
                                        <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 italic text-red-700 font-medium">
                                            "{selectedBooking.message || t('admin.noReason')}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex justify-end">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="px-8 py-3 bg-soft-black text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-black/10 transition-all active:scale-95"
                                >
                                    {t('admin.closeDetails')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
