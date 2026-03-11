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
                    /* High Fidelity Minimalist Read-only View */
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 md:p-16 shadow-sm relative overflow-hidden text-black transition-all duration-500">
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Professional Details</h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all text-gray-600 active:scale-95"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Details
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-12 items-start">
                            {/* Left Column: Contact & Location */}
                            <div className="space-y-12">
                                {/* Contact Info */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
                                        CONTACT INFORMATION
                                    </h3>
                                    <div className="space-y-8">
                                        {/* Full Name */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100/50 shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="font-bold text-lg text-gray-900 leading-tight tracking-tight">{provider?.user?.username || 'Ramkumar'}</p>
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100/50 shrink-0">
                                                <CheckSquare className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                                <p className="font-bold text-lg text-gray-900 leading-tight tracking-tight">{provider?.user?.contactNumber || provider?.user?.phone || '1234567890'}</p>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100/50 shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                                <p className="font-bold text-sm text-gray-900 leading-relaxed max-w-sm opacity-80">
                                                    {provider?.user?.address ? (
                                                        `${provider.user.address.street || '3/5, chithambaranayakkar street'}, ${provider.user.address.city || 'Salem'}, ${provider.user.address.state || 'Tamilnadu'} - ${provider.user.address.zipCode || '636001'}`
                                                    ) : '3/5, chithambaranayakkar street, Salem, Tamilnadu - 636001'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">LOCATION DETAILS</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Native Place</p>
                                            <p className="font-bold text-lg text-gray-900 tracking-tight">{provider?.nativePlace || 'Salem, Tamilnadu'}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Current City</p>
                                            <p className="font-bold text-lg text-gray-900 tracking-tight">{provider?.currentPlace || 'Chennai'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Profile & Emergency */}
                            <div className="space-y-12">
                                {/* Work Profile */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">WORK PROFILE</h3>
                                    <div className="space-y-8">
                                        {/* Experience */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100/50 shrink-0">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Experience</p>
                                                <p className="font-bold text-lg text-gray-900 tracking-tight">{provider?.experience || '8 Years'}</p>
                                            </div>
                                        </div>

                                        {/* Consult Fee */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100/50 shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Consult Fee (Base)</p>
                                                <p className="font-bold text-lg text-gray-900 tracking-tight">Rs. {provider?.consultFee || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact Section - Pinkish Highlight Card */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">EMERGENCY CONTACT</h3>
                                    <div className="bg-[#FFF4F4] border border-red-50 rounded-4xl p-8 space-y-2 transition-all duration-300">
                                        <p className="font-bold text-xl text-gray-900 tracking-tight leading-none">{provider?.emergencyContact?.name || 'Kishore'}</p>
                                        <p className="font-semibold text-gray-500 text-sm tracking-wide">{provider?.emergencyContact?.relation || 'Friend'}</p>
                                        <p className="font-semibold text-gray-600 tracking-[0.15em] text-sm pt-1">{provider?.emergencyContact?.phone || '9942599425'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                    <div className="w-32 h-32 bg-beige rounded-4xl flex items-center justify-center text-soft-black text-4xl font-bold overflow-hidden shadow-inner border-2 border-white">
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
