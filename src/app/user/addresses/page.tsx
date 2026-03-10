"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AddressCard from "@/components/AddressCard";
import axios from "axios";

interface Address {
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        label: "Home",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "INDIA",
        isDefault: false
    });

    const fetchAddresses = async () => {
        try {
            const res = await axios.get("/api/user/addresses");
            if (res.data.success) {
                setAddresses(res.data.addresses);
            }
        } catch (error) {
            console.error("Error fetching addresses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await axios.delete(`/api/user/addresses/${id}`);
            if (res.data.success) {
                setAddresses(addresses.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error("Error deleting address", error);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await axios.put(`/api/user/addresses/${id}`, { isDefault: true });
            if (res.data.success) {
                fetchAddresses();
            }
        } catch (error) {
            console.error("Error setting default address", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post("/api/user/addresses", formData);
            if (res.data.success) {
                setAddresses([...addresses, res.data.address]);
                setShowModal(false);
                setFormData({
                    label: "Home",
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "INDIA",
                    isDefault: false
                });
            }
        } catch (error) {
            console.error("Error adding address", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F1EB] p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Block */}
                <div className="bg-white rounded-[40px] p-6 mb-8 flex items-center shadow-sm">
                    <button
                        onClick={() => router.back()}
                        className="p-3 hover:bg-gray-100 rounded-full transition-colors mr-4"
                    >
                        <ArrowLeft className="text-gray-600" size={24} />
                    </button>

                    <div className="bg-green-50 p-4 rounded-2xl mr-4 flex items-center justify-center">
                        <MapPin className="text-green-600" size={32} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
                        <p className="text-gray-500 text-sm">Manage your delivery and service locations</p>
                    </div>
                </div>

                {/* Add New Address Button (Dashed) */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 mb-8 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-white transition-all group"
                >
                    <Plus className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                    <span className="font-medium">Add New Address</span>
                </button>

                {/* Address Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-gray-400" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address._id}
                                address={address}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        ))}

                        {addresses.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                                <p className="text-gray-400">No saved addresses yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Address Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Add New Address</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Label</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 123 Main St"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Chennai"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Tamil Nadu"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="636007"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="INDIA"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    className="w-5 h-5 accent-green-600 rounded"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                />
                                <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                Save Address
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
