'use client';

import React, { useState, useEffect } from 'react';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { User, MapPin, Briefcase, DollarSign, Save, Loader2, Phone, Mail, Camera, Edit3, X, CheckSquare } from 'lucide-react';
import { getMyProviderProfile, updateProviderBio } from '@/api/providers';

export default function ProviderProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [provider, setProvider] = useState<any>(null);
    const [formData, setFormData] = useState({
        experience: '',
        nativePlace: '',
        currentPlace: '',
        consultFee: 0,
        emergencyContact: {
            name: '',
            phone: '',
            relation: ''
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getMyProviderProfile();
            if (data.success) {
                setProvider(data.provider);
                setFormData({
                    experience: data.provider.experience || '',
                    nativePlace: data.provider.nativePlace || '',
                    currentPlace: data.provider.currentPlace || '',
                    consultFee: data.provider.consultFee || 0,
                    emergencyContact: data.provider.emergencyContact || { name: '', phone: '', relation: '' }
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await updateProviderBio(formData);
            if (data.success) {
                await fetchProfile();
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile: " + data.error);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProviderLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading profile data...</p>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="max-w-6xl space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
                {/* Header Section */}
                <div>
                    <h1 className="text-4xl font-black text-soft-black tracking-tight mb-3">Profile Settings</h1>
                    <p className="text-gray-500 font-medium text-lg">Manage your professional information and contact details.</p>
                </div>

                {!isEditing ? (
                    /* High Fidelity Read-only View Mode */
                    <div className="bg-white rounded-[3rem] border border-gray-100/50 p-14 md:p-20 shadow-xl shadow-black/2 relative overflow-hidden text-black transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-16 px-2">
                            <h2 className="text-3xl font-bold text-soft-black tracking-tight">Professional Details</h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-3 px-8 py-3.5 bg-white border-2 border-soft-black/5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-soft-black transition-all text-soft-black active:scale-95 shadow-md shadow-black/2"
                            >
                                <Edit3 className="w-4 h-4" strokeWidth={2.5} />
                                Edit Details
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
                            {/* Left Column: Contact & Location */}
                            <div className="space-y-16 flex flex-col">
                                {/* Contact Info */}
                                <div className="space-y-10 flex-1">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                        CONTACT INFORMATION
                                    </h3>
                                    <div className="space-y-12">
                                        {/* Full Name */}
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                <User className="w-7 h-7" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</p>
                                                <p className="font-black text-2xl text-soft-black leading-tight tracking-tight">{provider?.user?.username || 'Not set'}</p>
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                <CheckSquare className="w-7 h-7" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                                                <p className="font-black text-2xl text-soft-black leading-tight tracking-tight">{provider?.user?.contactNumber || provider?.user?.phone || 'Not set'}</p>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                <MapPin className="w-7 h-7" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Address</p>
                                                <p className="font-bold text-[17px] text-soft-black leading-relaxed max-w-sm">
                                                    {provider?.user?.address ? (
                                                        `${provider.user.address.street || ''}, ${provider.user.address.city || ''}`
                                                    ) : 'Complete address not available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="space-y-10 mt-16 pt-16 border-t border-gray-100/50">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">LOCATION DETAILS</h3>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="flex flex-col">
                                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Native Place</p>
                                            <p className="font-black text-2xl text-soft-black leading-tight tracking-tight">{provider?.nativePlace || 'Not set'}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current City</p>
                                            <p className="font-black text-2xl text-soft-black leading-tight tracking-tight">{provider?.currentPlace || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Profile & Emergency */}
                            <div className="space-y-16 flex flex-col">
                                {/* Work Profile */}
                                <div className="space-y-10 flex-1">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">WORK PROFILE</h3>
                                    <div className="space-y-12">
                                        {/* Experience */}
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 border border-gray-100/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                <Briefcase className="w-7 h-7" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Experience</p>
                                                <p className="font-black text-2xl text-soft-black leading-tight tracking-tight">{provider?.experience || 'Not set'}</p>
                                            </div>
                                        </div>

                                        {/* Consult Fee */}
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 border border-gray-100/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                <DollarSign className="w-7 h-7" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">CONSULT FEE (BASE)</p>
                                                <p className="font-black text-2xl text-soft-black leading-tight tracking-tight">Rs. {provider?.consultFee || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact Section */}
                                <div className="space-y-10 mt-16 pt-16 border-t border-gray-100/50">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">EMERGENCY CONTACT</h3>
                                    <div className="bg-[#FDFCF9]/80 border border-beige/40 rounded-[2.5rem] p-10 space-y-4 hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-black/2 group h-full flex flex-col justify-center">
                                        <div>
                                            <p className="font-black text-3xl text-soft-black tracking-tight leading-none mb-2">{provider?.emergencyContact?.name || 'Not set'}</p>
                                            <p className="font-bold text-gray-400 text-sm tracking-wide">{provider?.emergencyContact?.relation || 'Relation not set'}</p>
                                        </div>
                                        <div className="pt-4 border-t border-beige/30 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-soft-black/40 border border-beige/20 shadow-sm group-hover:scale-110 transition-transform">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <p className="font-bold text-soft-black tracking-widest text-2xl">{provider?.emergencyContact?.phone || 'No phone'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Decorative Element */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50/40 -skew-x-12 translate-x-24 -translate-y-24 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-50/20 rounded-full blur-3xl -translate-x-16 translate-y-16 pointer-events-none"></div>
                    </div>
                ) : (
                    /* Edit Mode - Refined Form */
                    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-300">
                        {/* Basic Info Section */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm relative overflow-hidden text-black transition-all">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-bold text-soft-black">Edit Profile</h2>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-beige rounded-[2rem] flex items-center justify-center text-soft-black text-4xl font-bold overflow-hidden shadow-inner border-2 border-white">
                                        {provider?.user?.profilePicture ? (
                                            <img src={provider.user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            provider?.user?.username?.[0].toUpperCase()
                                        )}
                                    </div>
                                    <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 bg-soft-black text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-black transition-all active:scale-90">
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-8 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                            <div className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold flex items-center gap-3 text-gray-500 cursor-not-allowed">
                                                <User className="w-4 h-4" />
                                                {provider?.user?.username}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                            <div className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold flex items-center gap-3 text-gray-500 cursor-not-allowed">
                                                <Mail className="w-4 h-4" />
                                                {provider?.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Professional Experience</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                            <input
                                                type="text"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                placeholder="e.g. 5 Years in Plumbing"
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold text-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extended Info & Charges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold text-soft-black flex items-center gap-2 mb-2">
                                    <MapPin className="w-5 h-5 text-gray-400" /> Location Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 font-inter">Native Place</label>
                                        <input
                                            type="text"
                                            value={formData.nativePlace}
                                            onChange={(e) => setFormData({ ...formData, nativePlace: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 font-inter">Current Residence</label>
                                        <input
                                            type="text"
                                            value={formData.currentPlace}
                                            onChange={(e) => setFormData({ ...formData, currentPlace: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold text-soft-black flex items-center gap-2 mb-2">
                                    <DollarSign className="w-5 h-5 text-gray-400" /> Service Charges
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 font-inter">Consultation Fee (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300">₹</span>
                                            <input
                                                type="number"
                                                value={formData.consultFee}
                                                onChange={(e) => setFormData({ ...formData, consultFee: Number(e.target.value) })}
                                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 px-1 font-medium">This fee is charged for on-site visits and initial consultation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8 text-black">
                            <h3 className="text-xl font-bold text-soft-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                                    <Phone className="w-5 h-5" />
                                </div>
                                Emergency Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 font-inter">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.emergencyContact.name}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 font-inter">Relationship</label>
                                    <input
                                        type="text"
                                        value={formData.emergencyContact.relation}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relation: e.target.value } })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 font-inter">Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.emergencyContact.phone}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 pb-20">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-8 py-5 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-soft-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </ProviderLayout>
    );
}
