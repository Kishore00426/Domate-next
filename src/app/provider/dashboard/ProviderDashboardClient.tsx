'use client';


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ProviderOverview from '@/components/dashboard/ProviderOverview';
import { AlertCircle, Loader2 } from 'lucide-react';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { getMyProviderProfile } from '@/api/providers';
import { getProviderBookings } from '@/api/bookings';

export default function ProviderDashboardClient() {
    const { t } = useTranslation();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [providerDetails, setProviderDetails] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            // Use authenticated API helper
            const profileData = await getMyProviderProfile();

            if (profileData.success) {
                setProviderDetails(profileData.provider);
                setUser(profileData.provider.user);

                const bookingsData = await getProviderBookings();
                if (bookingsData.success) {
                    setBookings(bookingsData.bookings || []);
                }
            } else {
                // getMyProviderProfile will handle 401 via axios interceptor if needed
                // but we check success here for defensive coding
                if (profileData.error === 'Unauthorized') {
                    router.push('/login');
                }
            }
        } catch (err) {
            console.error("Failed to load provider data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        setUpdatingId(bookingId);
        try {
            const { updateBookingStatus } = await import('@/api/bookings');
            const result = await updateBookingStatus(bookingId, status);
            if (result.success) {
                // Refresh the list
                await fetchData();
            } else {
                alert(result.error || "Failed to update status");
            }
        } catch (err) {
            console.error("Status update failed", err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-beige text-black">
                <Loader2 className="w-12 h-12 text-soft-black animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing your workspace...</p>
            </div>
        );
    }

    const pendingBookings = bookings.filter(b => b.status === 'pending');

    return (
        <ProviderLayout>
            <div className="max-w-6xl space-y-12 animate-in fade-in duration-500 pb-20">
                {/* Introduction - Simple Banner Style from Screenshot */}
                <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10 text-black max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            {t('dashboard.welcome', 'Welcome')}, {user?.username || 'Ramkumar'}!
                        </h1>
                        <p className="text-gray-400 font-semibold text-sm lg:text-base opacity-90">
                            Here is what's happening with your bookings today.
                        </p>
                    </div>
                </div>

                {/* Charts & Analytics - Wrapped in a polished container if needed */}
                <div className="animate-in slide-in-from-bottom duration-700 delay-150">
                    <ProviderOverview bookings={bookings} providerDetails={providerDetails} />
                </div>

                {/* Pending Requests Section */}
                <div className="bg-white p-10 md:p-14 rounded-4xl shadow-sm border border-gray-100">
                    <div className="flex items-end justify-between mb-12 px-2">
                        <div>
                            <h3 className="text-2xl font-bold text-soft-black tracking-tight mb-1 flex items-center gap-3">
                                {t('dashboard.pendingRequests') || 'Pending Requests'}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Action items requiring your immediate attention</p>
                        </div>
                        {pendingBookings.length > 0 && (
                            <div className="flex items-center gap-2 px-6 py-2 border-2 border-amber-500/20 bg-amber-50/50 rounded-full text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    {pendingBookings.length} NEW ACTION{pendingBookings.length > 1 ? 'S' : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    {pendingBookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pendingBookings.map(booking => (
                                <div key={booking._id} className="border border-gray-100 bg-white rounded-4xl p-8 hover:shadow-2xl hover:shadow-black/5 transition-all group relative overflow-hidden h-full flex flex-col">
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                                {booking.service?.category?.name || 'Service'}
                                            </span>
                                            <div className="flex flex-col items-end">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5">Scheduled For</p>
                                                <p className="text-sm font-bold text-soft-black">
                                                    {new Date(booking.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2 mb-8">
                                            <h4 className="font-bold text-2xl text-soft-black tracking-tight">{booking.service?.title}</h4>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-beige rounded-xl flex items-center justify-center text-xs font-black text-black shadow-inner border border-white">
                                                    {booking.user?.username?.[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                                                    <p className="text-sm font-bold text-soft-black leading-none">{booking.user?.username}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                                                disabled={updatingId === booking._id}
                                                className="flex-1 bg-soft-black text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {updatingId === booking._id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                Accept Request
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                disabled={updatingId === booking._id}
                                                className="flex-1 bg-white border border-gray-100 text-gray-400 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 -skew-x-12 translate-x-12 -translate-y-12 group-hover:bg-beige/40 transition-colors duration-500"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-200/60 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-gray-100 text-gray-300 group-hover:text-soft-black transition-colors">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px]">{t('dashboard.noPendingRequests') || 'No Pending Requests'}</p>
                            </div>
                            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </div>
                    )}
                </div>
            </div>
        </ProviderLayout>
    );
}
