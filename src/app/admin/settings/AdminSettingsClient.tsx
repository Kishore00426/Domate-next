'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Settings, Bell, Shield, Palette, Globe, Save, Loader2, Mail, Lock, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminSettingsClient() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');
    const [submitting, setSubmitting] = useState(false);

    const handleSave = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            alert(t('admin.settingsSaved'));
        }, 1000);
    };

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">{t('admin.systemSettings')}</h1>
                    <p className="text-gray-500 font-medium">{t('admin.settingsSubtitle')}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-64 space-y-2">
                        {[
                            { id: 'general', name: t('admin.general'), icon: Globe },
                            { id: 'security', name: t('admin.security'), icon: Shield },
                            { id: 'notifications', name: t('admin.notifications'), icon: Bell },
                            { id: 'appearance', name: t('admin.appearance'), icon: Palette }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-white text-soft-black shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm uppercase tracking-widest">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative">
                            <div className="space-y-8 max-w-2xl">
                                {activeTab === 'general' && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-black text-soft-black flex items-center gap-2">
                                                <Globe className="w-5 h-5 text-gray-400" />
                                                {t('admin.platformSettings')}
                                            </h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t('admin.platformName')}</label>
                                                    <input type="text" defaultValue="Domate" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t('admin.supportEmail')}</label>
                                                    <input type="email" defaultValue="support@domate.com" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t('admin.currency')}</label>
                                                    <select className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold">
                                                        <option>USD ($)</option>
                                                        <option>EUR (€)</option>
                                                        <option>GBP (£)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-black text-soft-black flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-gray-400" />
                                                {t('admin.safetyAuth')}
                                            </h3>
                                            <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-red-600 uppercase tracking-tight text-sm mb-1">{t('admin.advancedSecurity')}</p>
                                                    <p className="text-xs text-red-500/80 font-medium">{t('admin.twoFactorAuth')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-gray-50">
                                    <button
                                        onClick={handleSave}
                                        disabled={submitting}
                                        className="bg-soft-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {t('common.saveChanges')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
