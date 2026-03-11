import React, { useEffect, useState } from 'react';
import { User as UserIcon, Activity, PieChart as PieIcon, CreditCard, CheckCircle, XCircle, Package, LogOut, Calendar, MapPin, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getUserBookings } from '../../api/bookings';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';

interface UserDashboardProps {
    user: any;
    bookings?: any[];
    isEditing?: boolean;
    tempData?: any;
    handleEdit?: () => void;
    handleCancel?: () => void;
    handleSave?: () => Promise<void>;
    handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addressTags?: string[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({
    user,
    bookings: passedBookings,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>(passedBookings || []);
    const [loading, setLoading] = useState(!passedBookings);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [spendingData, setSpendingData] = useState<any[]>([]);
    const [serviceData, setServiceData] = useState<any[]>([]);
    const [providerList, setProviderList] = useState<string[]>([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, rejected: 0, spent: 0 });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (passedBookings && passedBookings.length > 0) {
            setBookings(passedBookings);
            processChartData(passedBookings);
            setLoading(false);
            return;
        }

        const fetchBookings = async () => {
            try {
                const response = await getUserBookings();
                if (response.success) {
                    setBookings(response.bookings);
                    processChartData(response.bookings);
                }
            } catch (error) {
                console.error("Failed to fetch bookings for dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [passedBookings]);

    const processChartData = (bookingList: any[]) => {
        const months: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('default', { month: 'short' }));
        }

        const statusCounts: Record<string, number> = {
            'accepted': 0, 'rejected': 0, 'pending': 0, 'cancelled': 0
        };
        bookingList.forEach(b => {
            const status = b.status?.toLowerCase() || 'pending';
            if (status !== 'completed' && statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else if (status !== 'completed') {
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            }
        });

        const sData = Object.keys(statusCounts)
            .filter(status => status !== 'completed' && statusCounts[status] > 0)
            .map(status => ({
                id: status,
                name: t(`userBookings.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')),
                value: statusCounts[status]
            }));
        setStatusData(sData);

        let totalSpent = 0;
        bookingList.forEach(b => {
            if (b.status === 'completed' || (b.invoice && b.invoice.totalAmount)) {
                totalSpent += b.invoice?.totalAmount || 0;
            }
        });

        setStats({
            total: bookingList.length,
            completed: bookingList.filter(b => b.status?.toLowerCase() === 'completed').length,
            rejected: statusCounts['rejected'] || 0,
            spent: totalSpent
        });

        const activityCounts: Record<string, { bookings: number; spending: number }> = months.reduce((acc, month) => {
            acc[month] = { bookings: 0, spending: 0 };
            return acc;
        }, {} as any);

        bookingList.forEach(b => {
            const bookingDate = new Date(b.date || b.createdAt);
            const month = bookingDate.toLocaleString('default', { month: 'short' });
            if (activityCounts.hasOwnProperty(month)) {
                activityCounts[month].bookings++;
                activityCounts[month].spending += (b.invoice?.totalAmount || 0);
            }
        });

        setActivityData(months.map(month => ({ month, bookings: activityCounts[month].bookings })));
        setSpendingData(months.map(month => ({ month, amount: activityCounts[month].spending })));

        const serviceMap: Record<string, any> = {};
        const allProviders = new Set<string>();
        bookingList.forEach(b => {
            const serviceName = b.serviceName || b.service?.title || 'Other';
            const providerName = b.serviceProvider?.username || 'Unknown Provider';
            allProviders.add(providerName);
            if (!serviceMap[serviceName]) serviceMap[serviceName] = { name: serviceName, total: 0 };
            serviceMap[serviceName][providerName] = (serviceMap[serviceName][providerName] || 0) + 1;
            serviceMap[serviceName].total++;
        });

        setServiceData(Object.values(serviceMap).sort((a, b) => b.total - a.total).slice(0, 10));
        setProviderList(Array.from(allProviders));
    };

    const STATUS_COLORS: Record<string, string> = {
        'accepted': '#10b981', 'rejected': '#ef4444', 'pending': '#3b82f6',
        'completed': '#8b5cf6', 'cancelled': '#6b7280', 'in_progress': '#f59e0b',
        'arrived': '#06b6d4', 'work_completed': '#ec4899',
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

    const renderLegend = (props: any) => {
        const { payload } = props;
        if (!payload) return null;
        return (
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-600 mt-4">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.value}: {entry.payload?.value || 0}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <div className="min-h-full space-y-6 pt-0 pb-12 overflow-x-hidden text-black px-4 md:px-0">
            {/* Desktop Centered Welcome Section */}
            <div className="hidden lg:flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-900 text-4xl font-black shadow-sm ring-4 ring-white mb-6 uppercase">
                    {user?.name?.charAt(0) || 'K'}
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                    Hi, {user?.name?.toLowerCase() || 'kishore'}
                </h1>
                <p className="text-gray-400 font-bold text-lg">
                    Welcome back to your dashboard.
                </p>
            </div>

            {/* Mobile Header (Legacy/Minimal) */}
            <div className="lg:hidden max-w-6xl mx-auto mb-6">
                <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                            Hi {user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className="text-gray-500 font-medium">Welcome back.</p>
                    </div>
                    <button onClick={handleLogout} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-900 transition-colors">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Dashboard Navigation Grid - Mobile Only */}
            <div className="lg:hidden max-w-6xl mx-auto grid grid-cols-2 gap-4 mb-8">
                {[
                    { id: 'overview', name: 'Overview', icon: <Activity className="w-6 h-6" /> },
                    { id: 'bookings', name: 'My Bookings', icon: <Calendar className="w-6 h-6" /> },
                    { id: 'addresses', name: 'Addresses', icon: <MapPin className="w-6 h-6" /> },
                    { id: 'plans', name: 'My Plans', icon: <FileText className="w-6 h-6" /> }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`p-6 rounded-4xl border transition-all flex flex-col items-center justify-center gap-3 active:scale-95 ${
                            activeTab === item.id 
                            ? 'bg-black text-white border-black shadow-xl' 
                            : 'bg-white text-gray-400 border-gray-100 shadow-sm'
                        }`}
                    >
                        <div className={activeTab === item.id ? 'text-white' : 'text-indigo-500'}>
                            {item.icon}
                        </div>
                        <span className={`font-bold text-sm ${activeTab === item.id ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' ? (
                <div className="space-y-8">
                    {/* Summary Cards - Grid Adjusted for Desktop Screenshot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-0">
                        {[
                            { label: t('dashboard.totalBookings'), value: stats.total, icon: <Package className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
                            { label: t('dashboard.accepted', 'Accepted'), value: stats.completed, icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
                            { label: t('dashboard.rejected'), value: stats.rejected, icon: <XCircle className="w-6 h-6" />, color: 'bg-red-50 text-red-600' },
                            { label: t('dashboard.totalSpent'), value: `₹${stats.spent.toFixed(0)}`, icon: <CreditCard className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600' }
                        ].map((card, i) => (
                            <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className={`p-3 ${card.color} rounded-2xl shrink-0`}>
                                    {card.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5 truncate">{card.label}</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none">{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto px-4 md:px-0">
                        {/* Service Insights */}
                        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-gray-900">{t('dashboard.providerBreakdown', 'Service & Provider Insights')}</h2>
                            </div>
                            <div className="h-[350px] md:h-[450px] w-full">
                                {loading ? <div className="h-full w-full animate-pulse bg-gray-50 rounded-2xl" /> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={serviceData} layout="vertical" margin={{ left: 30, right: 30, top: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} width={120} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f9fafb' }} />
                                            <Legend iconType="circle" />
                                            {providerList.map((provider, idx) => (
                                                <Bar key={provider} dataKey={provider} stackId="a" fill={COLORS[idx % COLORS.length]} barSize={28} radius={idx === providerList.length - 1 ? [0, 8, 8, 0] : [0, 0, 0, 0]} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Spending Trend */}
                        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-gray-900">Spending Trend</h2>
                            </div>
                            <div className="h-[250px] w-full">
                                {loading ? <div className="h-full w-full animate-pulse bg-gray-50 rounded-2xl" /> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={spendingData}>
                                            <defs>
                                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" name="Spent" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Status Overview */}
                        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><PieIcon className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-gray-900">Status Overview</h2>
                            </div>
                            <div className="h-[250px] w-full">
                                {loading ? <div className="h-full w-full animate-pulse bg-gray-50 rounded-2xl" /> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                                                {statusData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.id] || COLORS[idx % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="bottom" content={renderLegend} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto p-12 bg-white rounded-4xl border border-gray-100 shadow-sm text-center">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner tracking-tighter">
                        {activeTab === 'bookings' && <Calendar className="w-10 h-10" />}
                        {activeTab === 'addresses' && <MapPin className="w-10 h-10" />}
                        {activeTab === 'plans' && <FileText className="w-10 h-10" />}
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-3 capitalize">My {activeTab}</h2>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                        This section is under maintenance. We are bringing you more insights soon!
                    </p>
                    <button onClick={() => setActiveTab('overview')} className="mt-8 px-8 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-105 transition-transform active:scale-95">
                        Back to Overview
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
