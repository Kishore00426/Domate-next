'use client';

import React, { useState, useEffect } from 'react';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import {
    Calendar, Filter, Clock, CheckCircle2, XCircle, Search, Mail, Phone, MapPin,
    Loader2, FileText, ChevronUp, ChevronDown, Download, X, Settings,
    PlusCircle, Check, AlertCircle, IndianRupee
} from 'lucide-react';
import { getProviderBookings, updateBookingStatus, completeBooking } from '@/api/bookings';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

export default function ProviderBookingsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // DataTable States
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'scheduledDate', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal States
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [invoiceForm, setInvoiceForm] = useState({
        servicePrice: 0,
        serviceCharge: 0
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDownloadInvoice = (booking: any) => {
        const doc = new jsPDF();

        // Add Branding
        doc.setFontSize(22);
        doc.setTextColor(30, 30, 30);
        doc.text("DOMATE", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Invoice / Booking Details", 14, 28);

        // Horizontal Line
        doc.setDrawColor(240, 240, 240);
        doc.line(14, 35, 196, 35);

        // Billing Info
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);
        doc.text(`Invoice ID: INV-${booking._id.slice(-6).toUpperCase()}`, 14, 45);
        doc.text(`Bill Date: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 52);

        // Customer & Service Section
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("CUSTOMER DETAILS", 14, 65);
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.text(`Name: ${booking.user?.username || 'Customer'}`, 14, 72);
        doc.text(`Contact: ${booking.user?.phone || booking.user?.email || 'N/A'}`, 14, 79);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("SERVICE DETAILS", 120, 65);
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.text(`Service: ${booking.service?.title || 'Unknown'}`, 120, 72);
        doc.text(`Date: ${format(new Date(booking.scheduledDate), 'dd/MM/yyyy')}`, 120, 79);

        // Table for line items
        const tableBody = [
            [
                booking.service?.title || 'Service',
                1,
                `₹${booking.service?.price || 0}`,
                `₹${booking.service?.price || 0}`
            ]
        ];

        autoTable(doc, {
            startY: 90,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.text(`Subtotal:`, 140, finalY);
        doc.text(`₹${booking.service?.price || 0}`, 180, finalY, { align: 'right' });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL AMOUNT:`, 140, finalY + 10);
        doc.text(`₹${booking.invoice?.totalAmount || booking.service?.price || 0}`, 180, finalY + 10, { align: 'right' });

        // Footer
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for choosing Domate. This is a computer generated invoice.", 105, 280, { align: 'center' });

        doc.save(`Invoice_${booking._id.slice(-6)}.pdf`);
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await getProviderBookings();
            if (data.success) {
                setBookings(data.bookings || []);
            }
        } catch (err) {
            console.error("Failed to load bookings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedBooking) return;
        setUpdating(selectedBooking._id);
        try {
            const data = await updateBookingStatus(selectedBooking._id, newStatus, statusMessage);
            if (data.success) {
                fetchBookings();
                setShowStatusModal(false);
            } else {
                alert("Failed to update status: " + data.error);
            }
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setUpdating(null);
        }
    };

    const handleCompleteBooking = async () => {
        if (!selectedBooking) return;
        setUpdating(selectedBooking._id);
        try {
            const data = await completeBooking(selectedBooking._id, {
                servicePrice: invoiceForm.servicePrice,
                serviceCharge: invoiceForm.serviceCharge
            });
            if (data.success) {
                fetchBookings();
                setShowInvoiceModal(false);
            } else {
                alert("Failed to complete booking: " + data.error);
            }
        } catch (err) {
            console.error("Failed to complete booking", err);
        } finally {
            setUpdating(null);
        }
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page on sort change
    };

    const getSortedBookings = (list: any[]) => {
        const sorted = [...list].sort((a, b) => {
            let valA, valB;

            switch (sortConfig.key) {
                case 'scheduledDate':
                    valA = new Date(a.scheduledDate).getTime();
                    valB = new Date(b.scheduledDate).getTime();
                    break;
                case 'status':
                    valA = a.status;
                    valB = b.status;
                    break;
                case 'price':
                    valA = a.invoice?.totalAmount || a.service?.price || 0;
                    valB = b.invoice?.totalAmount || b.service?.price || 0;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const filteredAndSortedBookings = getSortedBookings(
        bookings.filter(b => {
            const matchesFilter = filter === 'all' || b.status === filter;
            const matchesSearch = b.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.service?.title?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        })
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
    const paginatedBookings = filteredAndSortedBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <ProviderLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading your schedule...</p>
                </div>
            </ProviderLayout>
        );
    }

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <Filter className="w-3 h-3 text-gray-200" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="w-4 h-4 text-soft-black" /> :
            <ChevronDown className="w-4 h-4 text-soft-black" />;
    };

    return (
        <ProviderLayout>
            <div className="animate-in fade-in duration-700">
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100/50 min-h-[calc(100vh-180px)] overflow-hidden flex flex-col">
                    {/* Header & Search Area */}
                    <div className="p-10 pb-6 border-b border-gray-50/50">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => window.history.back()}
                                    className="p-2 text-gray-300 hover:text-soft-black transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h1 className="text-3xl font-bold text-soft-black tracking-tight">Bookings</h1>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex bg-[#F5F5F5] p-1.5 rounded-2xl border border-gray-100/50">
                                {[
                                    { id: 'confirmed', label: 'Current' },
                                    { id: 'pending', label: 'Pending' },
                                    { id: 'all', label: 'All' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setFilter(tab.id); setCurrentPage(1); }}
                                        className={`
                                            px-8 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                                            ${filter === tab.id
                                                ? 'bg-white text-soft-black shadow-xl shadow-black/5'
                                                : 'text-gray-400 hover:text-gray-600'}
                                        `}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full max-w-sm mb-2 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-soft-black transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Customer, Title..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 text-sm font-medium placeholder:text-gray-300 shadow-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Semantic Table Implementation */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50/50">
                                    <th className="px-10 py-8 text-left text-[11px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] w-[35%]">
                                        <span className="pl-2">SERVICE & CUSTO...</span>
                                    </th>
                                    <th className="px-10 py-8 text-left text-[11px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] w-[15%]">
                                        <button onClick={() => requestSort('scheduledDate')} className="flex items-center gap-2 hover:text-soft-black transition-colors">
                                            DATE <SortIcon column="scheduledDate" />
                                        </button>
                                    </th>
                                    <th className="px-10 py-8 text-left text-[11px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] w-[15%]">
                                        <button onClick={() => requestSort('status')} className="flex items-center gap-2 hover:text-soft-black transition-colors">
                                            STATUS <SortIcon column="status" />
                                        </button>
                                    </th>
                                    <th className="px-10 py-8 text-left text-[11px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] w-[20%]">
                                        CONTACT INF...
                                    </th>
                                    <th className="px-10 py-8 text-right text-[11px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] w-[15%] pr-14">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/80">
                                {paginatedBookings.length > 0 ? (
                                    paginatedBookings.map(booking => (
                                        <tr key={booking._id} className="hover:bg-gray-50/20 transition-all group">
                                            {/* Service & Customer */}
                                            <td className="px-10 py-12 align-top">
                                                <div className="space-y-4 pl-2">
                                                    <div className="flex flex-col">
                                                        <p className="font-bold text-[18px] text-soft-black leading-tight tracking-tight">{booking.service?.title}</p>
                                                        <p className="text-[12px] text-gray-400 font-medium pt-1.5 flex items-center gap-1">
                                                            Cust: <span className="text-gray-500 font-bold">{booking.user?.username || 'kishore'}</span>
                                                        </p>
                                                    </div>
                                                    <div className="inline-block px-5 py-2.5 bg-[#FFFCF5] rounded-xl border border-[#FEF3C7]/40 shadow-sm shadow-[#FEF3C7]/10">
                                                        <p className="text-[12px] font-bold text-[#D97706]/70 leading-tight">
                                                            "{booking.problemDescription || 'urgent repair'}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-10 py-12 align-top pt-[3.4rem]">
                                                <div className="text-[15px] font-bold text-soft-black/80">
                                                    {new Date(booking.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-10 py-12 align-top pt-[3.2rem]">
                                                <div className="inline-flex px-6 py-2 rounded-full bg-[#F5F5F5] text-soft-black/70 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">
                                                    {booking.status === 'confirmed' ? 'Completed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </div>
                                            </td>

                                            {/* Contact Info */}
                                            <td className="px-10 py-12 align-top pt-14">
                                                <div className="text-[14px]">
                                                    {booking.user?.phone || booking.user?.contactNumber ? (
                                                        <span className="font-bold text-gray-400">{booking.user?.phone || booking.user?.contactNumber}</span>
                                                    ) : (
                                                        <span className="italic font-medium text-gray-200">No info</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-10 py-12 align-top text-right pr-14 pt-[3.2rem]">
                                                <div className="flex items-center justify-end gap-4">
                                                    <span className="text-[17px] font-black text-soft-black tracking-tight mr-2">
                                                        ₹{booking.invoice?.totalAmount || booking.service?.price || '0'}
                                                    </span>

                                                    {/* Status Update Button */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setNewStatus(booking.status);
                                                            setStatusMessage(booking.message || '');
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-soft-black hover:text-white transition-all shadow-sm border border-gray-100"
                                                        title="Change Status"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>

                                                    {/* Invoice Generation Button */}
                                                    {booking.status !== 'completed' && booking.status !== 'work_completed' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setInvoiceForm({
                                                                    servicePrice: booking.service?.price || 0,
                                                                    serviceCharge: 0
                                                                });
                                                                setShowInvoiceModal(true);
                                                            }}
                                                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                            title="Generate Invoice"
                                                        >
                                                            <PlusCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Download Invoice Button */}
                                                    {(booking.status === 'completed' || booking.status === 'work_completed') && (
                                                        <button
                                                            onClick={() => handleDownloadInvoice(booking)}
                                                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                                            title="Download Invoice"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center text-gray-400">
                                            <Calendar className="w-16 h-16 text-gray-100 mx-auto mb-5 grayscale opacity-20" />
                                            <p className="text-xl font-bold text-soft-black mb-1">Empty Schedule</p>
                                            <p className="text-xs uppercase tracking-widest font-black text-gray-300">No bookings found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-10 py-10 bg-white border-t border-gray-50/50 flex items-center justify-between">
                            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                Showing <span className="text-soft-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-soft-black">{Math.min(currentPage * itemsPerPage, filteredAndSortedBookings.length)}</span> of <span className="text-soft-black">{filteredAndSortedBookings.length}</span> results
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all text-soft-black"
                                >
                                    Prev
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-9 h-9 rounded-xl text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-soft-black text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all text-soft-black"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Modal */}
            {showStatusModal && selectedBooking && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 isolate">
                    <div className="absolute inset-0 bg-soft-black/40 backdrop-blur-md" onClick={() => setShowStatusModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowStatusModal(false)} className="absolute right-8 top-8 p-2 text-gray-300 hover:text-soft-black transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                <Settings className="w-6 h-6 text-soft-black" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-soft-black tracking-tight">Update Status</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Booking #{selectedBooking._id.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                                <select
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all font-bold text-soft-black cursor-pointer appearance-none"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="arrived">Arrived</option>
                                    <option value="work_completed">Work Completed</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {(newStatus === 'rejected' || newStatus === 'cancelled') && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason / Message</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all font-medium text-soft-black resize-none h-32"
                                        placeholder="Explain why the booking is being rejected or cancelled..."
                                        value={statusMessage}
                                        onChange={(e) => setStatusMessage(e.target.value)}
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating === selectedBooking._id}
                                className="w-full py-5 bg-soft-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-black/10 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating === selectedBooking._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                Update Booking Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && selectedBooking && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 isolate">
                    <div className="absolute inset-0 bg-soft-black/40 backdrop-blur-md" onClick={() => setShowInvoiceModal(false)} />
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowInvoiceModal(false)} className="absolute right-8 top-8 p-2 text-gray-300 hover:text-soft-black transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-soft-black tracking-tight">Generate Invoice</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Complete job & notify customer</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Price (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="number"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all font-bold text-soft-black"
                                            value={invoiceForm.servicePrice}
                                            onChange={(e) => setInvoiceForm({ ...invoiceForm, servicePrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Extra Charges (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="number"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-100 outline-none transition-all font-bold text-soft-black"
                                            value={invoiceForm.serviceCharge}
                                            onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceCharge: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Calculation Preview */}
                            <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{(invoiceForm.servicePrice || 0) + (invoiceForm.serviceCharge || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                    <span>GST (18%)</span>
                                    <span>₹{(((invoiceForm.servicePrice || 0) + (invoiceForm.serviceCharge || 0)) * 0.18).toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gray-200/50 my-2" />
                                <div className="flex justify-between items-center text-lg font-black text-soft-black">
                                    <span>Total Amount</span>
                                    <span className="text-indigo-600">₹{(((invoiceForm.servicePrice || 0) + (invoiceForm.serviceCharge || 0)) * 1.18).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCompleteBooking}
                                disabled={updating === selectedBooking._id}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating === selectedBooking._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertCircle className="w-5 h-5" />}
                                Finalize & Generate Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProviderLayout>
    );
}
