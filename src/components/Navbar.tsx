import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, MapPin, Home, Menu, X, Search, LogOut, LayoutGrid, Bell, ChevronDown, Check, Globe, Briefcase, Calendar, Upload, LayoutDashboard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openSearchModal, closeSearchModal } from '../store/uiSlice';
import SearchModal from './SearchModal';
import LanguageDropdown from './LanguageDropdown';

interface NavbarProps {
    variant?: 'landing' | 'dashboard';
    user?: any;
    loading?: boolean;
    hideSearch?: boolean;
    hideUser?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
    variant = 'landing', 
    user, 
    loading = false,
    hideSearch = false,
    hideUser = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const isDashboard = variant === 'dashboard';

    const handleLogout = () => {
        sessionStorage.clear(); // Remove all cache data
        localStorage.removeItem('user'); // Ensure local storage is also cleared
        window.location.href = '/';
    };
    const isHomeActive = pathname === '/home';
    const isServicesActive = pathname.startsWith('/services');
    const isNotificationsActive = pathname === '/notifications';

    const isAccountPage = pathname === '/account' || pathname.startsWith('/user/') || pathname.startsWith('/provider/dashboard');

    const searchRef = useRef<HTMLDivElement>(null);
    const isSearchOpen = useSelector((state: any) => state.ui.isSearchModalOpen);

    const isServiceProvider = user?.role === 'service_provider' || user?.role?.name === 'service_provider';
    const isGuest = !user || user?.name === 'Guest' || user?.name?.toLowerCase() === 'guest';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node) && isSearchOpen) {
                dispatch(closeSearchModal());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, dispatch]);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'hi', label: 'हिन्दी (Hindi)' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };


    return (
        <nav className="fixed top-0 left-0 w-full z-50">
            <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between ">

                <div className="flex items-center gap-8">

                    <Link href={isServiceProvider ? "/provider/dashboard" : isDashboard ? "/home" : "/"} className="flex items-center gap-2">
                        <img src="/logo.png" alt="DoMate" className="h-8 w-auto" />
                        <span className="text-2xl font-bold tracking-tight text-soft-black">DoMate</span>
                    </Link>

                </div>


                {/* Center Section - Removed Search Bar from here, moved to Right Nav */}
                {/* Orders and Plans buttons removed for Account page as per request */}


                {!isDashboard && (
                    <div className="hidden md:flex items-center gap-6 lg:gap-8 bg-gray-50/50 px-6 py-2 rounded-full border border-gray-100/50">
                        {!isServiceProvider && (
                            <button
                                onClick={() => {
                                    // Set guest user in localStorage
                                    const guestUser = {
                                        name: 'Guest',
                                        location: 'Unknown'
                                    };
                                    localStorage.setItem('user', JSON.stringify(guestUser));
                                    // Navigate to home page
                                    router.push('/home');
                                }}
                                className="text-sm font-medium text-gray-600 hover:text-soft-black transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                {t('navbar.services')}
                            </button>
                        )}
                        {!isServiceProvider && (
                            <Link href="/register?role=service_provider" className="text-sm font-medium text-gray-600 hover:text-soft-black transition-colors whitespace-nowrap">{t('navbar.becomeProfessional')}</Link>
                        )}
                    </div>
                )}


                <div className="flex items-center gap-2 md:gap-4">
                    {isDashboard ? (
                        <div className="flex items-center gap-1 md:gap-4 lg:gap-6">
                            {/* Search Icon - Hidden on very small screens, shown from md up */}
                            {!hideSearch && (
                                <button
                                    onClick={() => dispatch(openSearchModal())}
                                    className="hidden md:block p-2 text-gray-400 hover:text-soft-black transition-all"
                                    title="Search"
                                >
                                    <Search className="w-5 h-5" strokeWidth={1.5} />
                                </button>
                            )}

                            {/* Language Selector - Hidden on mobile, handled in hamburger */}
                            <div className="hidden md:block">
                                <LanguageDropdown />
                            </div>

                            {/* Home Icon in Circle - Only show desktop */}
                            {!isServiceProvider && (
                                <Link
                                    href="/home"
                                    className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300 ${
                                        isHomeActive 
                                        ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' 
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-soft-black'
                                    }`}
                                    title="Home"
                                >
                                    <Home className="w-5 h-5" strokeWidth={isHomeActive ? 2.5 : 2} />
                                </Link>
                            )}

                            {/* Services Icon - Only show desktop */}
                            {!isServiceProvider && (
                                <Link
                                    href="/services"
                                    className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300 ${
                                        isServicesActive 
                                        ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' 
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-soft-black'
                                    }`}
                                    title="Services"
                                >
                                    <LayoutGrid className="w-5 h-5" strokeWidth={isServicesActive ? 2.5 : 2} />
                                </Link>
                            )}

                            {/* Notifications - Only show desktop */}
                            <Link
                                href="/notifications"
                                className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300 ${
                                    isNotificationsActive 
                                    ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' 
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-soft-black'
                                }`}
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" strokeWidth={isNotificationsActive ? 2.5 : 2} />
                            </Link>

                            {/* User Avatar - Shown on all screens, but simplified on mobile */}
                            {!hideUser && (
                                <Link
                                    href="/account"
                                    className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l md:border-gray-100 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center text-white ring-1 md:ring-2 ring-gray-50 shadow-sm font-bold uppercase transition-transform active:scale-95">
                                        {user?.name ? user.name.charAt(0) : <User className="w-4 h-4 md:w-5 md:h-5" />}
                                    </div>
                                    <div className="hidden lg:flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 opacity-60 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" /> {user?.location || t('common.unknownLocation', 'Unknown Location')}
                                        </span>
                                        <span className="text-sm font-bold text-soft-black leading-none">
                                            {user?.name || 'Guest'}
                                        </span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    ) : (
                        /* Landing Right Section */
                        <div className="hidden md:flex items-center gap-4">
                            <LanguageDropdown />
                            <Link href="/login" className="bg-soft-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-transform active:scale-95 duration-200 cursor-pointer block">
                                {t('navbar.getStarted')}
                            </Link>
                        </div>
                    )}

                    {/* Mobile Actions: Search & Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        {mobileSearchOpen ? (
                            <div className="absolute inset-0 bg-white z-50 px-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm rounded-b-3xl">
                                <Search className="w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    className="flex-1 bg-transparent border-none outline-none text-base text-soft-black placeholder:text-gray-400 h-full py-4"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        dispatch(openSearchModal());
                                    }}
                                    autoFocus
                                />
                                <button onClick={() => {
                                    setMobileSearchOpen(false);
                                    dispatch(closeSearchModal());
                                }} className="p-5 text-gray-600 hover:text-black">
                                    <X className="w-5 h-8" />
                                </button>

                                {/* Mobile Search Results Modal */}
                                {(searchTerm && isSearchOpen) && (
                                    <div className="absolute top-full left-0 w-full px-2">
                                        <SearchModal searchTerm={searchTerm} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="p-2 text-soft-black"
                                onClick={() => setMobileSearchOpen(true)}
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        )}

                        <button
                            className="text-soft-black p-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl p-4 flex flex-col gap-1 md:hidden animate-in fade-in slide-in-from-top-2">
                    {isDashboard ? (
                        <>
                            {!isServiceProvider && (
                                <>
                                    <Link href="/home" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${isHomeActive ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <Home className="w-5 h-5" /> Home
                                    </Link>
                                    <Link href="/services" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${isServicesActive ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <LayoutGrid className="w-5 h-5" /> Services
                                    </Link>
                                </>
                            )}
                            <Link href="/notifications" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${isNotificationsActive ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <Bell className="w-5 h-5" /> Notifications
                            </Link>

                            <div className="p-2 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Language</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setIsOpen(false);
                                            }}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === lang.code ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}
                                        >
                                            {lang.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className="border-t pt-1 mt-1">
                                {!isGuest ? (
                                    <>
                                        <Link
                                            href={isServiceProvider ? "/provider/dashboard" : "/account"}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center font-semibold text-white">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-black">{user?.name}</div>
                                                <div className="text-xs text-black font-medium">{user?.location}</div>
                                            </div>
                                        </Link>

                                        {/* Provider Navigation Items in Mobile Menu */}
                                        {isServiceProvider && (
                                            <div className="space-y-1 mt-2 mb-2 pl-2 border-l-2 border-gray-100 ml-4">
                                                <Link href="/provider/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <LayoutDashboard className="w-4 h-4" /> Overview
                                                </Link>
                                                <Link href="/provider/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <User className="w-4 h-4" /> Profile
                                                </Link>
                                                <Link href="/provider/services" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <Briefcase className="w-4 h-4" /> My Services
                                                </Link>
                                                <Link href="/provider/bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <Calendar className="w-4 h-4" /> Bookings
                                                </Link>
                                                <Link href="/provider/documents" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <Upload className="w-4 h-4" /> Documents
                                                </Link>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" className="flex items-center justify-center p-3 bg-black text-white rounded-xl font-medium w-full">
                                        Login
                                    </Link>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {!isServiceProvider && (
                                <button
                                    onClick={() => {
                                        // Set guest user in localStorage
                                        const guestUser = {
                                            name: 'Guest',
                                            location: 'Unknown'
                                        };
                                        localStorage.setItem('user', JSON.stringify(guestUser));
                                        // Navigate to home page
                                        router.push('/home');
                                        // Close mobile menu
                                        setIsOpen(false);
                                    }}
                                    className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg text-left w-full cursor-pointer"
                                >
                                    {t('navbar.services')}
                                </button>
                            )}
                            <Link href="/register?role=service_provider" className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg">{t('navbar.becomeProfessional')}</Link>

                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Language</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setIsOpen(false);
                                            }}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === lang.code ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}
                                        >
                                            {lang.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Link href="/login" className="bg-soft-black text-white px-5 py-3 rounded-xl text-sm font-medium w-full block text-center">
                                {t('navbar.getStarted')}
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
