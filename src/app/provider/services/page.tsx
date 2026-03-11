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
    const [isManaging, setIsManaging] = useState(false);

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

    const selectedServices = allServices.filter(s => selectedServiceIds.includes(s._id));

    if (loading) {
        return (
            <ProviderLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">Fetching service catalog...</p>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="max-w-7xl animate-in fade-in duration-500 pb-20">
                {!isManaging ? (
                    /* Overview Mode - Matches Screenshot */
                    <div className="bg-white rounded-[2.5rem] border border-gray-100/50 p-10 md:p-14 shadow-sm min-h-[500px]">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Services</h1>
                                <p className="text-gray-400 font-medium text-sm">Manage the services you offer to customers</p>
                            </div>
                            <button
                                onClick={() => setIsManaging(true)}
                                className="bg-black text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-tight hover:bg-gray-900 transition-all shadow-lg shadow-black/5 active:scale-95 flex items-center gap-2"
                            >
                                Manage Services
                            </button>
                        </div>

                        {selectedServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {selectedServices.map(service => (
                                    <div key={service._id} className="bg-gray-50/50 border border-gray-100/50 rounded-4xl p-8 space-y-6 flex flex-col group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-500 border-dashed md:border-solid">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
                                                <Briefcase className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 tracking-tight leading-tight">{service.title}</h3>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] ml-1">My Description</p>
                                            <div className="bg-white rounded-2xl p-5 border border-gray-100/50 min-h-[80px]">
                                                <p className="text-gray-400 font-medium text-[13px] italic leading-relaxed">
                                                    {service.detailedDescription || "No description provided."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Briefcase className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No active services</h3>
                                <p className="text-gray-400 max-w-xs mx-auto mb-8 font-medium">Click on Manage Services to select the services you offer to customers.</p>
                                <button
                                    onClick={() => setIsManaging(true)}
                                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Select Services
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Management Mode - Enhanced Selection Catalog */
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Service Catalog</h1>
                                <p className="text-gray-400 font-medium text-sm">Select the platform services you are qualified to provide.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsManaging(false)}
                                    className="px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-black text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gray-900 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save Selection'}
                                </button>
                            </div>
                        </div>

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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map(service => {
                                const isSelected = selectedServiceIds.includes(service._id);
                                return (
                                    <div
                                        key={service._id}
                                        onClick={() => toggleService(service._id)}
                                        className={`
                                            group cursor-pointer relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 flex flex-col min-h-[280px] h-full
                                            ${isSelected
                                                ? 'bg-black border-black shadow-2xl shadow-black/20'
                                                : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-xl hover:shadow-black/5'}
                                        `}
                                    >
                                        <div className="p-10 flex flex-col flex-1 relative z-10 w-full">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner border shrink-0 ${isSelected ? 'bg-white/10 text-white border-white/10' : 'bg-gray-50 text-gray-400 border-white'}`}>
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
                                                    <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5 block ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                                                        {service.category?.name || 'PLATFORM SERVICE'}
                                                    </span>
                                                    <h4 className={`text-2xl font-bold tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-black'}`}>
                                                        {service.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredServices.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200/60 group">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-black group-hover:scale-110 transition-transform">
                                    <Search className="w-10 h-10 text-gray-200" />
                                </div>
                                <p className="text-gray-400 font-semibold uppercase tracking-widest text-[11px]">No services found for "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
}
