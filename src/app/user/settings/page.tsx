'use client';

import React, { useState } from 'react';
import UserLayout from '@/components/layouts/UserLayout';
import {
    Shield,
    Bell,
    Eye,
    Trash2,
    Key,
    Mail,
    MessageSquare,
    Smartphone,
    ChevronRight,
    Lock,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true
    });

    const [privacy, setPrivacy] = useState({
        profileVisible: true,
        dataSharing: false
    });

    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const togglePrivacy = (key: keyof typeof privacy) => {
        setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for password change logic
        alert("Password change functionality is coming soon!");
    };

    return (
        <UserLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-3xl font-extrabold text-soft-black tracking-tight">{t('settings.title', 'Account Settings')}</h1>
                    <p className="text-gray-500 mt-2 font-medium">{t('settings.subtitle', 'Manage your security, notifications, and preferences.')}</p>
                </div>

                {/* Account Security Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/[0.03] border border-gray-100 transition-all hover:shadow-black/[0.05]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-soft-black">{t('settings.security', 'Account Security')}</h2>
                            <p className="text-sm text-gray-500 font-medium">Update your password and secure your account</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">{t('settings.currentPassword', 'Current Password')}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    type="password"
                                    className="w-full bg-gray-50/50 border-gray-100 border-2 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password.current}
                                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="hidden md:block"></div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">{t('settings.newPassword', 'New Password')}</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    type="password"
                                    className="w-full bg-gray-50/50 border-gray-100 border-2 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password.new}
                                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">{t('settings.confirmPassword', 'Confirm New Password')}</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    type="password"
                                    className="w-full bg-gray-50/50 border-gray-100 border-2 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password.confirm}
                                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="px-10 py-4 bg-soft-black text-white font-bold rounded-2xl hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                            >
                                {t('settings.updatePassword', 'Update Password')}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Notifications Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/[0.03] border border-gray-100 transition-all hover:shadow-black/[0.05]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-soft-black">{t('settings.notifications', 'Notification Preferences')}</h2>
                            <p className="text-sm text-gray-500 font-medium">Stay updated with the latest activity</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'email', label: 'Email Notifications', sub: 'Receive updates via your email address', icon: Mail, color: 'blue' },
                            { id: 'sms', label: 'SMS Notifications', sub: 'Get important alerts via text message', icon: MessageSquare, color: 'green' },
                            { id: 'push', label: 'Push Notifications', sub: 'Receive real-time alerts on your device', icon: Smartphone, color: 'purple' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 border border-gray-50 group transition-all hover:bg-white hover:shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 bg-white text-${item.color}-500 rounded-xl shadow-sm`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-soft-black text-base">{item.label}</p>
                                        <p className="text-xs text-gray-500 font-medium">{item.sub}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleNotification(item.id as any)}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ring-4 ring-transparent focus:ring-indigo-500/10 ${notifications[item.id as keyof typeof notifications] ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Privacy Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/[0.03] border border-gray-100 transition-all hover:shadow-black/[0.05]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-soft-black">{t('settings.privacy', 'Privacy Settings')}</h2>
                            <p className="text-sm text-gray-500 font-medium">Manage your visibility and data usage</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 border border-gray-50 transition-all hover:bg-white hover:shadow-sm">
                            <div>
                                <p className="font-bold text-soft-black text-base">Profile Visibility</p>
                                <p className="text-xs text-gray-500 font-medium">Make your profile visible to service providers</p>
                            </div>
                            <button
                                onClick={() => togglePrivacy('profileVisible')}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${privacy.profileVisible ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 border border-gray-50 transition-all hover:bg-white hover:shadow-sm">
                            <div>
                                <p className="font-bold text-soft-black text-base">Usage Data Sharing</p>
                                <p className="text-xs text-gray-500 font-medium">Help us improve by sharing anonymous usage statistics</p>
                            </div>
                            <button
                                onClick={() => togglePrivacy('dataSharing')}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${privacy.dataSharing ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-50/30 rounded-[2rem] p-8 border-2 border-dashed border-red-100 transition-all hover:bg-red-50/50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3.5 bg-red-100 text-red-600 rounded-2xl">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-600">{t('settings.dangerZone', 'Danger Zone')}</h2>
                            <p className="text-sm text-red-500/70 font-medium">Irreversible actions for your account</p>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm group">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-50 text-red-500 rounded-xl mt-1">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-soft-black text-base">Delete Your Account</p>
                                <p className="text-xs text-gray-500 font-medium max-w-md">Once you delete your account, all your data, bookings, and profile information will be permanently removed. This action cannot be undone.</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-red-600 border-2 border-red-100 font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-[0.98] whitespace-nowrap shadow-sm">
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </UserLayout>
    );
}
