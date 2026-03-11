'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Calendar,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    CreditCard,
    FileText
} from 'lucide-react';
import { getMe } from '../../api/auth';
import { fetchServices } from '../../store/servicesSlice';
import Navbar from '../Navbar';

const UserLayout = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auth & Data States
    const [user, setUser] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedUser = sessionStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });

    useEffect(() => {
        // @ts-ignore
        dispatch(fetchServices());

        const fetchUser = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const userData = await getMe();
                const mappedUser = {
                    name: userData.user.username,
                    location: userData.user.address?.city || "Unknown Location",
                    ...userData.user
                };

                setUser(mappedUser);
                sessionStorage.setItem('user', JSON.stringify(mappedUser));
            } catch (err) {
                console.error("Failed to fetch user", err);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                router.push('/login');
            }
        };

        fetchUser();
    }, [dispatch, router]);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const navItems = [
        { path: '/account', label: 'Overview', icon: LayoutDashboard },
        { path: '/user/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/user/addresses', label: 'Addresses', icon: MapPin },
        { path: '/user/plans', label: 'My Plans', icon: FileText },
        { path: '/user/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#f1efe8] flex flex-col text-black">
            {/* Navbar - Fixed at the top */}
            <Navbar variant="dashboard" user={user} loading={!user} />

            {/* Main Layout Container */}
            <div className="flex flex-1 pt-[50px]">

                {/* Sidebar - Desktop */}
                <aside className="hidden lg:flex lg:sticky top-[72px] left-0 h-[calc(100vh-72px)] w-80 bg-white border-r border-gray-100 flex-col">
                    {/* User Profile Snippet */}
                    <div className="p-4">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-gray-100/50 shadow-sm">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 text-xl font-black ring-1 ring-gray-100 uppercase">
                                {user?.name?.charAt(0) || <UserIcon className="w-6 h-6 text-gray-400" />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-black text-base text-gray-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate font-bold">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path || (item.path !== '/account' && pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`
                                        flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm
                                        ${isActive
                                            ? 'bg-black text-white shadow-xl shadow-black/10 translate-x-1'
                                            : 'text-gray-400 hover:bg-gray-50 hover:text-black hover:translate-x-1'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Action Section */}
                    <div className="p-4 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-start gap-4 px-6 py-4 text-sm font-black bg-black text-white hover:bg-gray-900 active:scale-95 rounded-2xl transition-all shadow-xl shadow-black/10"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#f1efe8]">
                    <div className="flex-1 p-3 sm:p-6 md:p-8 lg:p-10">
                        <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Navigation Bar - Optional for Better UX */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around p-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/account' && pathname.startsWith(item.path));
                    return (
                        <Link key={item.path} href={item.path} className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>
                            <item.icon className="w-6 h-6" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default UserLayout;
