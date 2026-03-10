'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search,
    FileText,
    Download,
    ChevronLeft,
    MoreHorizontal,
    Calendar,
    Clock,
    User,
    FileDown,
    ExternalLink,
    Eye,
    XCircle,
    Phone,
    Mail,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { updateBookingStatus, getProviderContact } from '../../api/bookings';

interface Booking {
    _id: string;
    service: {
        title: string;
        subcategory?: { name: string };
        price?: number;
    };
    provider?: {
        user?: { username: string };
    };
    serviceProvider?: {
        username: string;
        email?: string;
        contactNumber?: string;
        phone?: string;
    };
    scheduledDate: string;
    notes?: string;
    status: string;
    invoice?: {
        servicePrice?: number;
        serviceCharge?: number;
        gst?: number;
        totalAmount?: number;
    };
}

interface UserBookingsProps {
    bookings: Booking[];
    loading?: boolean;
    user?: any;
}

const UserBookings: React.FC<UserBookingsProps> = ({ bookings, loading, user: currentUser }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Bookings');
    const [selectedContact, setSelectedContact] = useState<{ username: string; email: string; phone: string } | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isContactLoading, setIsContactLoading] = useState(false);
    const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
    const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

    // Safe array check
    const bookingsList = Array.isArray(bookings) ? bookings : [];

    const filteredBookings = bookingsList.filter(booking => {
        const matchesSearch =
            booking.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.provider?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'All Bookings' ||
            booking.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        if (!status) return 'bg-gray-100 text-gray-700';
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'active': return 'bg-blue-100 text-blue-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleExportExcel = () => {
        const data = filteredBookings.map(b => ({
            'Service': b.service?.title,
            'Provider': b.provider?.user?.username,
            'Date': b.scheduledDate ? format(new Date(b.scheduledDate), 'dd/MM/yyyy') : '',
            'Time': b.scheduledDate ? format(new Date(b.scheduledDate), 'HH:mm') : '',
            'Status': b.status,
            'Notes': b.notes || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
        XLSX.writeFile(workbook, `Domate_Bookings_${format(new Date(), 'dd_MM_yyyy')}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Service", "Provider", "Date", "Status"];
        const tableRows = filteredBookings.map(b => [
            b.service?.title || '',
            b.provider?.user?.username || '',
            b.scheduledDate ? format(new Date(b.scheduledDate), 'dd/MM/yyyy') : '',
            b.status || ''
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20
        });
        doc.text("My Bookings Report", 14, 15);
        doc.save(`Domate_Bookings_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    };

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
        doc.text(`Name: ${currentUser?.username || 'Customer'}`, 14, 72);
        doc.text(`Email: ${currentUser?.email || 'N/A'}`, 14, 79);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("SERVICE DETAILS", 120, 65);
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.text(`Service: ${booking.service?.title || 'Unknown'}`, 120, 72);
        doc.text(`Provider: ${booking.serviceProvider?.username || booking.provider?.user?.username || 'Expert'}`, 120, 79);
        doc.text(`Date: ${booking.scheduledDate ? format(new Date(booking.scheduledDate), 'dd/MM/yyyy') : 'N/A'}`, 120, 86);

        // Table for line items
        const tableBody = [
            [
                booking.service?.title || 'Service',
                1,
                `₹${booking.invoice?.servicePrice || booking.service?.price || 0}`,
                `₹${booking.invoice?.servicePrice || booking.service?.price || 0}`
            ]
        ];

        if (booking.invoice?.serviceCharge) {
            tableBody.push(['Service Charge / Visiting Fee', 1, `₹${booking.invoice.serviceCharge}`, `₹${booking.invoice.serviceCharge}`]);
        }

        if (booking.invoice?.gst) {
            tableBody.push(['GST', '', '', `₹${booking.invoice.gst}`]);
        }

        autoTable(doc, {
            startY: 100,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL AMOUNT:`, 120, finalY);
        doc.text(`₹${booking.invoice?.totalAmount || booking.service?.price || 0}`, 190, finalY, { align: 'right' });

        // Footer
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for choosing Domate. This is a computer generated invoice.", 105, 280, { align: 'center' });

        doc.save(`Invoice_${booking._id.slice(-6)}.pdf`);
    };

    const handleShowInvoicePreview = (booking: Booking) => {
        setSelectedBookingForInvoice(booking);
        setIsInvoicePreviewOpen(true);
    };

    const handleCancel = async (bookingId: string) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await updateBookingStatus(bookingId, 'cancelled', 'Cancelled by user');
            if (response.success) {
                alert('Booking cancelled successfully.');
                window.location.reload(); // Simple refresh to update list
            } else {
                alert('Failed to cancel booking: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert('An error occurred while cancelling the booking.');
        }
    };

    const handleShowContact = async (bookingId: string) => {
        setIsContactLoading(true);
        setIsContactModalOpen(true);
        try {
            const response = await getProviderContact(bookingId);
            if (response.success) {
                setSelectedContact(response.contact);
            } else {
                alert('Failed to fetch contact details: ' + (response.error || 'Unknown error'));
                setIsContactModalOpen(false);
            }
        } catch (error) {
            console.error("Error fetching provider contact:", error);
            alert('An error occurred while fetching contact details.');
            setIsContactModalOpen(false);
        } finally {
            setIsContactLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-black">
            {/* Header Section */}
            <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => window.history.back()}
                        className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-soft-black">My Bookings</h1>
                        <p className="text-gray-500 text-sm md:text-base">View and track your appointments</p>
                    </div>
                </div>

                <div className="flex p-1 bg-gray-50 rounded-2xl w-fit">
                    {['Pending', 'Active', 'All Bookings'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${statusFilter === status
                                ? 'bg-white text-soft-black shadow-sm ring-1 ring-gray-100'
                                : 'text-gray-500 hover:text-soft-black'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Service, Provider..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-soft-black/5 transition-all outline-none text-black font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportExcel}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-green-50 text-green-700 rounded-2xl font-bold text-sm hover:bg-green-100 transition-all border border-green-100 shadow-sm"
                    >
                        <FileDown className="w-4 h-4" /> Excel
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-50 text-orange-700 rounded-2xl font-bold text-sm hover:bg-orange-100 transition-all border border-orange-100 shadow-sm"
                    >
                        <FileText className="w-4 h-4" /> Pdf
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Service</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Provider</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Scheduled Date <span>▼</span>
                                </th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Notes</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-10">
                                            <div className="h-4 bg-gray-100 rounded-full w-full mb-4"></div>
                                            <div className="h-4 bg-gray-50 rounded-full w-3/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-soft-black text-base">{booking.service?.title || 'Unknown Service'}</p>
                                                <p className="text-xs text-gray-500 font-medium">{booking.service?.subcategory?.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-soft-black text-sm">{booking.provider?.user?.username || 'Expert'}</p>
                                                    <button
                                                        onClick={() => handleShowContact(booking._id)}
                                                        className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tight"
                                                    >
                                                        Contact
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-soft-black text-sm font-bold">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'dd/MM/yyyy') : 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'HH:mm') : 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-gray-500 text-sm italic font-medium max-w-[150px] truncate">
                                                {booking.notes || 'No notes provided'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${getStatusColor(booking.status)}`}>
                                                {booking.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleShowInvoicePreview(booking)}
                                                    className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-90"
                                                    title="View Invoice"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {booking.status?.toLowerCase() === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancel(booking._id)}
                                                        className="p-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-90"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {/* Removed ArrowRight button */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500 font-medium whitespace-normal">
                                        No bookings found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contact Details Modal */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-soft-black">Provider Contact</h2>
                            <button
                                onClick={() => setIsContactModalOpen(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-soft-black"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            {isContactLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Fetching details...</p>
                                </div>
                            ) : selectedContact ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600/60 font-black uppercase tracking-widest">Provider Name</p>
                                            <p className="text-lg font-bold text-soft-black">{selectedContact.username}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email Address</p>
                                                <a href={`mailto:${selectedContact.email}`} className="text-soft-black font-bold hover:text-blue-600 transition-colors">
                                                    {selectedContact.email}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phone Number</p>
                                                <a href={`tel:${selectedContact.phone}`} className="text-soft-black font-bold hover:text-green-600 transition-colors">
                                                    {selectedContact.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsContactModalOpen(false)}
                                        className="w-full py-4 bg-soft-black text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98] mt-4"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Failed to load contact information.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Preview Modal */}
            {isInvoicePreviewOpen && selectedBookingForInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-soft-black">Invoice Preview</h2>
                                <p className="text-xs text-gray-500 font-medium">Review details before downloading</p>
                            </div>
                            <button
                                onClick={() => setIsInvoicePreviewOpen(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-soft-black"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="border border-gray-100 rounded-3xl p-8 bg-white shadow-sm space-y-8">
                                {/* Branding & ID */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black text-soft-black tracking-tighter italic">DOMATE</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Home Services</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Invoice Number</p>
                                        <p className="text-lg font-bold text-soft-black">#INV-{selectedBookingForInvoice._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-1">{format(new Date(), 'dd MMMM yyyy')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Billed To</p>
                                        <p className="font-bold text-soft-black text-lg">{currentUser?.username || 'Valued Customer'}</p>
                                        <p className="text-sm text-gray-500 font-medium">{currentUser?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Service Provider</p>
                                        <p className="font-bold text-soft-black text-lg">{selectedBookingForInvoice.serviceProvider?.username || selectedBookingForInvoice.provider?.user?.username || 'Expert'}</p>
                                        <p className="text-sm text-gray-500 font-medium">{selectedBookingForInvoice.serviceProvider?.email || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Table Elements */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                                        <span>Description</span>
                                        <span>Amount</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <span className="font-bold text-soft-black">{selectedBookingForInvoice.service?.title}</span>
                                            </div>
                                            <span className="font-bold text-soft-black">₹{selectedBookingForInvoice.invoice?.servicePrice || selectedBookingForInvoice.service?.price || 0}</span>
                                        </div>

                                        {selectedBookingForInvoice.invoice?.serviceCharge ? (
                                            <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl">
                                                <span className="text-sm font-medium text-gray-500 pl-1">Consultation / Service Fee</span>
                                                <span className="font-bold text-soft-black">₹{selectedBookingForInvoice.invoice.serviceCharge}</span>
                                            </div>
                                        ) : null}

                                        {selectedBookingForInvoice.invoice?.gst ? (
                                            <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl">
                                                <span className="text-sm font-medium text-gray-500 pl-1">GST / Tax</span>
                                                <span className="font-bold text-soft-black">₹{selectedBookingForInvoice.invoice.gst}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Final Total */}
                                <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount Payable</p>
                                        <p className="text-xs text-green-600 font-bold">Includes all taxes and fees</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-soft-black tracking-tighter">₹{selectedBookingForInvoice.invoice?.totalAmount || selectedBookingForInvoice.service?.price || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => setIsInvoicePreviewOpen(false)}
                                className="flex-1 py-4 bg-white border border-gray-200 text-soft-black rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={() => {
                                    handleDownloadInvoice(selectedBookingForInvoice);
                                    setIsInvoicePreviewOpen(false);
                                }}
                                className="flex-1 py-4 bg-soft-black text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Download className="w-5 h-5" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserBookings;
