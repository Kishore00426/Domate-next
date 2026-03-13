'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Users as UsersIcon, Search, Trash2, Shield, User, Mail, Calendar, Loader2 } from 'lucide-react';
import adminApi from '@/api/adminAxios';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/users');
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await adminApi.delete(`/admin/users/${id}`);
            if (res.data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">{t('admin.userManagement')}</h1>
                        <p className="text-gray-500 font-medium">{t('admin.userSubtitle')}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
                        <UsersIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-bold text-soft-black">{t('admin.totalUsersCount', { count: users.length })}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/2 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                            <input
                                type="text"
                                placeholder={t('admin.searchUsersPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.user')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.role')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.joined')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-gray-200 animate-spin" />
                                                <p className="text-gray-400 font-medium">{t('admin.loadingUsers')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-soft-black font-black text-xs">
                                                        {user.username?.[0].toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-soft-black">{user.username}</p>
                                                        <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.role?.name === 'admin'
                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                    : 'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    <Shield className="w-3 h-3 mr-1.5" />
                                                    {user.role?.name || 'User'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium">
                                            {t('admin.noUsersFound')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
