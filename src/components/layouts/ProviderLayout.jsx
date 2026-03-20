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

                // Map username to name for the top Navbar plus include location
                const mappedUser = {
                    ...userData.user,
                    name: userData.user.username || userData.user.name,
                    location: userData.user.address?.city || userData.user.address?.district || 'Unknown'
                };
                setUser(mappedUser);

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
        localStorage.clear();
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
            <Navbar variant="dashboard" user={user} loading={loading} hideSearch={true} hideUser={true} />

            {/* Main Layout Container */}
            <div className="flex flex-1 pt-[72px]">

                {/* Sidebar - Precise Screenshot Styling */}
                <aside className="hidden lg:flex lg:sticky top-[72px] left-0 z-40 h-[calc(100vh-72px)] w-72 bg-white flex-col border-r border-gray-100">

                    {/* User Profile Card - Simplified Screenshot Style */}
                    <div className="px-6 py-8">
                        <div className="flex items-center gap-4 p-5 bg-gray-50/80 rounded-2xl border border-gray-100/50">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm ring-2 ring-white">
                                {user?.name?.charAt(0) || 'R'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-gray-900 truncate tracking-tight">{user?.name || 'Ramkumar'}</p>
                                <p className="text-[10px] text-gray-400 font-semibold truncate opacity-70">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 py-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`
                                        flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-300 font-bold text-sm tracking-tight
                                        ${isActive
                                            ? 'bg-black text-white shadow-2xl shadow-black/20 translate-x-1'
                                            : 'text-gray-300 hover:text-black hover:bg-gray-50 hover:translate-x-1'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-200'} transition-colors`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-10 py-5 text-sm font-bold bg-black text-white hover:bg-gray-900 rounded-2xl transition-all shadow-2xl shadow-black/20 active:scale-95"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#F8F6F2]">
                    <div className="flex-1 p-6 lg:p-10 pb-32 lg:pb-10 overflow-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Navigation Bar */}
            <div 
                className="lg:hidden bg-white flex justify-around items-center px-1 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 9999, borderTop: '1px solid #f3f4f6', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
            >
                {navItems.map((item) => {
                    const isActive = item.path === '/provider/dashboard' ? pathname === item.path : pathname.startsWith(item.path);
                    return (
                        <Link key={item.path} href={item.path} className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-300 w-16 ${isActive ? 'text-black transform -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
                            <div className={`p-2 flex items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-black text-white shadow-md' : 'bg-transparent'}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] mt-1 font-bold truncate w-full text-center ${isActive ? 'text-black' : 'text-gray-400'}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ProviderLayout;
