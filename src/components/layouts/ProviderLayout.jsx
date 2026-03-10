'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Briefcase,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    User,
    Upload
} from 'lucide-react';
import { getMe } from '../../api/auth';
import { getMyProviderProfile } from '../../api/providers';
import Navbar from '../Navbar';

const ProviderLayout = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Auth & Data States
    const [user, setUser] = useState(null);
    const [providerDetails, setProviderDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                // 1. Get User Data
                const userData = await getMe();
                const roleName = userData.user.role?.name || userData.user.role;
                if (roleName !== 'service_provider') {
                    router.push('/home');
                    return;
                }
                setUser(userData.user);

                // 2. Get Provider Specific Data
                const profileResponse = await getMyProviderProfile();
                if (profileResponse.success) {
                    setProviderDetails(profileResponse.provider);
                }

            } catch (err) {
                console.error("Failed to fetch provider data", err);
                sessionStorage.removeItem('token');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        setUser(null);
        setProviderDetails(null);
        sessionStorage.clear();
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const navItems = [
        { path: '/provider/dashboard', label: 'Overview', icon: LayoutGrid },
        { path: '/provider/profile', label: 'Profile', icon: User },
        { path: '/provider/services', label: 'My Services', icon: Briefcase },
        { path: '/provider/bookings', label: 'Bookings', icon: Calendar },
        { path: '/provider/documents', label: 'Documents', icon: Upload },
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F8F6F2] text-black">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F6F2] flex flex-col text-black">
            {/* Navbar - Simplified for Dashboard */}
            <Navbar variant="dashboard" user={user} loading={loading} />

            {/* Main Layout Container */}
            <div className="flex flex-1 pt-[72px]">

                {/* Sidebar - Precise Screenshot Styling */}
                <aside className="hidden md:flex md:sticky top-[72px] left-0 z-40 h-[calc(100vh-72px)] w-72 bg-white flex-col border-r border-gray-100">

                    {/* User Card - Specific Sidebar Element from Screenshot */}
                    <div className="px-6 py-8">
                        <div className="flex items-center gap-4 p-5 bg-[#F9F9F9] rounded-4xl border border-gray-50 shadow-sm">
                            <div className="w-12 h-12 bg-soft-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.username?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-soft-black truncate">{user?.username || 'Provider'}</p>
                                <p className="text-[10px] text-gray-400 font-medium truncate">{user?.email || 'email@example.com'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`
                                        flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest
                                        ${isActive
                                            ? 'bg-soft-black text-white shadow-xl shadow-black/10'
                                            : 'text-gray-400 hover:text-soft-black hover:bg-gray-50'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions - Log Out Pill */}
                    <div className="p-6 border-t border-gray-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 rounded-2xl transition-all shadow-xl shadow-black/10"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-h-0 min-w-0">
                    <div className="flex-1 p-6 md:p-10 lg:p-14 overflow-x-hidden">
                        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100/50 min-h-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProviderLayout;
