'use client';

import React, { useState, useEffect } from 'react';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { Upload, FileText, CheckCircle2, Clock, Trash2, ShieldCheck, AlertCircle, Loader2, Plus } from 'lucide-react';
import { getMyProviderProfile, uploadProviderDocument, removeProviderDocument } from '@/api/providers';

export default function ProviderDocumentsPage() {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [provider, setProvider] = useState<any>(null);

    useEffect(() => {
        fetchProviderData();
    }, []);

    const fetchProviderData = async () => {
        try {
            const data = await getMyProviderProfile();
            if (data.success) {
                setProvider(data.provider);
            }
        } catch (err) {
            console.error("Failed to load provider documents", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (type: string) => {
        setUploading(type);
        try {
            // In a real app, this would be a proper file upload to S3/Cloudinary
            // For now, we simulate with a mock URL as before
            const mockUrl = `https://storage.placeholder.com/doc_${Date.now()}.pdf`;
            const data = await uploadProviderDocument({ type, url: mockUrl });
            if (data.success) {
                fetchProviderData();
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(null);
        }
    };

    const handleDelete = async (type: string, url: string) => {
        if (!confirm("Are you sure you want to remove this document?")) return;

        try {
            const data = await removeProviderDocument({ type, url });
            if (data.success) {
                fetchProviderData();
            } else {
                alert("Delete failed: " + data.error);
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const docSections = [
        { id: 'id', title: 'Identity Proof', subtitle: 'Aadhar, Voter ID or Passport', items: provider?.idProofs || [] },
        { id: 'cert', title: 'Professional Certificates', subtitle: 'Trade licenses or diplomas', items: provider?.certificates || [] },
        { id: 'address', title: 'Address Proof', subtitle: 'Electricity bill or Rent agreement', items: provider?.addressProofs || [] },
    ];

    if (loading) {
        return (
            <ProviderLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing vault...</p>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="max-w-6xl space-y-12 animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-soft-black tracking-tight mb-2">Verification Vault</h1>
                        <p className="text-gray-400 font-bold text-sm">Upload required documents to become a verified premium partner.</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 border-2 border-green-500/20 bg-white rounded-full text-green-500 shadow-sm shadow-green-500/5">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                            STATUS: {provider?.approvalStatus?.toUpperCase() || 'PENDING'}
                        </span>
                    </div>
                </div>

                {provider?.approvalStatus === 'pending' && (
                    <div className="bg-amber-50/50 border border-amber-100/50 rounded-4xl p-8 flex gap-6 text-black relative overflow-hidden group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div className="relative z-10">
                            <p className="font-bold text-xl text-amber-900 mb-1">Approval Pending</p>
                            <p className="text-sm text-amber-700/80 font-bold font-inter leading-relaxed max-w-2xl">
                                Your documents are currently being processed by our trust & safety team. Once verified, you'll receive a premium badge and start appearing in public searches.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/20 -skew-x-12 translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700"></div>
                    </div>
                )}

                <div className="space-y-16">
                    {docSections.map((section) => (
                        <div key={section.id} className="space-y-8">
                            <div className="flex items-end justify-between px-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-soft-black tracking-tight mb-1">{section.title}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{section.subtitle}</p>
                                </div>
                                <button
                                    onClick={() => handleUpload(section.id)}
                                    disabled={!!uploading}
                                    className="flex items-center gap-2 px-6 py-3 bg-soft-black text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                                >
                                    {uploading === section.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Upload New
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                                {section.items.map((url: string, index: number) => (
                                    <div key={index} className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm group hover:shadow-2xl hover:shadow-black/5 transition-all relative overflow-hidden text-black min-h-[220px] flex flex-col h-full">
                                        <div className="relative z-10 flex flex-col h-full flex-1">
                                            <div className="w-14 h-14 bg-beige rounded-2xl flex items-center justify-center text-soft-black mb-8 shadow-inner border border-white shrink-0">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-inter">Document #{index + 1}</p>
                                                <p className="text-base font-bold text-soft-black truncate">{(url as any).split('/').pop()}</p>
                                            </div>
                                            <div className="mt-8 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-green-500">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">VERIFIED</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(section.id, url);
                                                    }}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 -skew-x-12 translate-x-12 -translate-y-12 group-hover:bg-beige/40 transition-colors duration-500 z-0 pointer-events-none"></div>
                                    </div>
                                ))}

                                {/* Redesigned Dropzone Area to match screenshot exactly */}
                                <div
                                    onClick={() => handleUpload(section.id)}
                                    className="border-2 border-dashed border-gray-200/60 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-soft-black/20 hover:bg-gray-50/50 transition-all min-h-[220px] h-full relative overflow-hidden"
                                >
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 group-hover:text-soft-black group-hover:bg-white group-hover:shadow-md transition-all">
                                        <Upload className="w-7 h-7" />
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] group-hover:text-soft-black transition-colors px-10">
                                        Drop files or click to upload
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Card - Dark Themed */}
                <div className="bg-soft-black rounded-[3.5rem] p-12 md:p-16 text-white overflow-hidden relative group shadow-2xl shadow-black/20 mt-12">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">Vault Security</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-gray-400">
                            <div className="space-y-3">
                                <p className="text-white font-bold text-lg">Encryption</p>
                                <p className="text-sm font-medium leading-relaxed font-inter">All documents are stored in AES-256 encrypted private cloud buckets.</p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-white font-bold text-lg">Privacy</p>
                                <p className="text-sm font-medium leading-relaxed font-inter">Only verified trust officers have access specifically for review purposes.</p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-white font-bold text-lg">Retention</p>
                                <p className="text-sm font-medium leading-relaxed font-inter">Legacy documents are securely purged after renewal cycles.</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-white/[0.03] -skew-x-12 translate-x-1/2 group-hover:bg-white/[0.05] transition-all duration-700"></div>
                </div>
            </div>
        </ProviderLayout>
    );
}
