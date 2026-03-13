'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    Calendar,
    Activity,
    TrendingUp,
    BarChart3,
    ShieldCheck,
    Layers,
    CheckCircle,
    Clock,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import AdminLayout from '@/components/layouts/AdminLayout';
import adminApi from '@/api/adminAxios';

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [serviceData, setServiceData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                console.log("AdminDashboard: Fetching stats...");
                const res = await adminApi.get('/admin/stats');
                console.log("AdminDashboard: Raw response:", res);
                const data = res.data;
                console.log("AdminDashboard: Stats data:", data);

                if (data.success) {
                    setStats(data.data);
                    setActivityData(data.data.weeklyActivity || []);
                    setServiceData(data.data.topServices || []);
                } else {
                    console.error("AdminDashboard: API error result:", data.error);
                }
            } catch (err) {
                console.error("AdminDashboard: Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: t('admin.totalUsers'),
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+12%',
            trendUp: true
        },
        {
            label: t('admin.activeProviders'),
            value: stats?.activeProviders || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trend: '+5%',
            trendUp: true
        },
        {
            label: t('admin.pendingVerifications'),
            value: stats?.pendingVerifications || 0,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trend: '-2%',
            trendUp: false
        },
        {
            label: t('admin.totalBookings'),
            value: stats?.totalBookings || 0,
            icon: Calendar,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            trend: '+18%',
            trendUp: true
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">
                            {t('admin.dashboardOverview')}
                        </h1>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-black text-soft-black tracking-tight">{stat.value}</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Activity Chart */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-soft-black text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-gray-400" /> {t('admin.weeklyUserActivity')}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium">{t('admin.weeklyUserActivitySubtitle')}</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Services Performance */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-soft-black text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-400" /> Top Services
                                </h3>
                                <p className="text-xs text-gray-400 font-medium">Popular service categories by booking volume</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={serviceData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }} width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
