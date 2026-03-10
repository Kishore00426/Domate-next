'use client';

import React, { useState, useEffect } from 'react';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { Briefcase, Search, CheckCircle2, Circle, Loader2, Save } from 'lucide-react';
import { getMyProviderProfile, updateProviderServices } from '@/api/providers';
import { getAllServices } from '@/api/services';

export default function ProviderServicesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allServices, setAllServices] = useState<any[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch All Platform Services
                const servicesData = await getAllServices();
                if (servicesData.success) {
                    setAllServices(servicesData.services || []);
                }

                // 2. Fetch My Current Services
                const profileData = await getMyProviderProfile();
                if (profileData.success) {
                    const myServices = profileData.provider.services || [];
                    setSelectedServiceIds(myServices.map((s: any) => s._id || s));
                }
            } catch (err) {
                console.error("Failed to load services", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleService = (id: string) => {
        if (selectedServiceIds.includes(id)) {
            setSelectedServiceIds(selectedServiceIds.filter(sid => sid !== id));
        } else {
            setSelectedServiceIds([...selectedServiceIds, id]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await updateProviderServices({ services: selectedServiceIds });
            if (data.success) {
                alert("Services updated successfully!");
            } else {
                alert("Failed to update services: " + data.error);
            }
        } catch (error) {
            console.error("Error saving services:", error);
        } finally {
            setSaving(false);
        }
    };

    const filteredServices = allServices.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <ProviderLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching service catalog...</p>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="max-w-6xl space-y-12 animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 px-2">
                    <div>
                        <h1 className="text-4xl font-bold text-soft-black tracking-tight mb-2">My Services</h1>
                        <p className="text-gray-400 font-bold text-sm">Select the platform services you are qualified to provide.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-soft-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Search & Filter - Polished */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 text-black group hover:shadow-md transition-shadow">
                    <div className="flex items-center flex-1 gap-4">
                        <Search className="w-6 h-6 text-gray-300 group-hover:text-soft-black transition-colors" />
                        <input
                            type="text"
                            placeholder="Search services or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg placeholder:text-gray-200"
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-sm font-bold text-soft-black">{selectedServiceIds.length}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected</span>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.map(service => {
                        const isSelected = selectedServiceIds.includes(service._id);
                        return (
                            <div
                                key={service._id}
                                onClick={() => toggleService(service._id)}
                                className={`
                                    group cursor-pointer relative overflow-hidden rounded-4xl border transition-all duration-500 flex flex-col min-h-[300px] h-full
                                    ${isSelected
                                        ? 'bg-soft-black border-soft-black shadow-2xl shadow-black/20'
                                        : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-xl hover:shadow-black/5'}
                                `}
                            >
                                <div className="p-8 flex flex-col flex-1 relative z-10 w-full">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner border shrink-0 ${isSelected ? 'bg-white/10 text-white border-white/10' : 'bg-beige/50 text-soft-black border-white'}`}>
                                                <Briefcase className="w-7 h-7" />
                                            </div>
                                            {isSelected ? (
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                </div>
                                            ) : (
                                                <Circle className="w-8 h-8 text-gray-100 group-hover:text-gray-200 transition-colors shrink-0" />
                                            )}
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 block ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {service.category?.name || 'PLATFORM SERVICE'}
                                            </span>
                                            <h4 className={`text-2xl font-bold tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-soft-black'}`}>
                                                {service.title}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className={`mt-8 pt-6 border-t font-inter ${isSelected ? 'border-white/10 text-gray-400' : 'border-gray-50 text-gray-400'} text-sm font-medium leading-relaxed`}>
                                        <p className="line-clamp-3">
                                            {service.detailedDescription || 'Become a verified provider for this service to start receiving bookings.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Selection Overlay Effect */}
                                <div className={`absolute top-0 right-0 w-32 h-32 -skew-x-12 translate-x-12 -translate-y-12 transition-all duration-700 pointer-events-none ${isSelected ? 'bg-white/5 opacity-100' : 'bg-gray-50/50 opacity-0 group-hover:opacity-100'}`}></div>
                            </div>
                        );
                    })}
                </div>

                {filteredServices.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-4xl border-2 border-dashed border-gray-200/60 group">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-black group-hover:scale-110 transition-transform">
                            <Search className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px]">No services found for "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
}
