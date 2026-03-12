'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { Upload, FileText, CheckCircle2, User, MapPin, Trash2, ShieldCheck, AlertCircle, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { getMyProviderProfile, uploadProviderDocument, removeProviderDocument } from '@/api/providers';

export default function ProviderDocumentsPage() {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [provider, setProvider] = useState<any>(null);
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({
        id: null,
        address: null,
        cert: null
    });

    const fileInputRefs = {
        id: useRef<HTMLInputElement>(null),
        address: useRef<HTMLInputElement>(null),
        cert: useRef<HTMLInputElement>(null)
    };

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

    const handleFileSelect = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleUploadAll = async () => {
        const filesToUpload = Object.entries(selectedFiles).filter(([_, file]) => file !== null);
        if (filesToUpload.length === 0) return;

        setUploading(true);
        try {
            // Upload sequentially for simplicity and error handling
            for (const [type, file] of filesToUpload) {
                // In a real app, this would be a proper file upload to S3/Cloudinary
                // For now, we simulate with a mock URL as before
                const mockUrl = `https://storage.placeholder.com/${file?.name}_${Date.now()}.pdf`;
                const data = await uploadProviderDocument({ type, url: mockUrl });
                if (!data.success) {
                    console.error(`Failed to upload ${type}: ${data.error}`);
                }
            }
            setSelectedFiles({ id: null, address: null, cert: null });
            fetchProviderData();
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (type: string, url: string) => {
        if (!confirm("Are you sure you want to remove this document?")) return;

        try {
            const data = await removeProviderDocument({ type, url });
            if (data.success) {
                fetchProviderData();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) {
        return (
            <ProviderLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">Accessing vault...</p>
                </div>
            </ProviderLayout>
        );
    }

    const uploadCards = [
        {
            id: 'id',
            title: 'ID Proof',
            subtitle: 'Aadhaar, PAN, or Voter ID',
            icon: <User className="w-6 h-6 text-blue-500" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            id: 'address',
            title: 'Address Proof',
            subtitle: 'Electricity Bill, Rent Agreement',
            icon: <MapPin className="w-6 h-6 text-purple-500" />,
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100'
        },
        {
            id: 'cert',
            title: 'Certificates',
            subtitle: 'Professional Certifications',
            icon: <FileText className="w-6 h-6 text-amber-500" />,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-100'
        }
    ];

    return (
        <ProviderLayout>
            <div className="animate-in fade-in duration-700">
                <div className="bg-white rounded-4xl shadow-sm border border-gray-100/50 min-h-[calc(100vh-180px)] overflow-hidden flex flex-col p-8 md:p-12">
                    <div className="max-w-6xl w-full mx-auto space-y-12">
                        {/* Title Section */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all active:scale-90"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Documents & Verification</h1>
                        </div>

                        {/* Upload Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {uploadCards.map(card => (
                                <div key={card.id} className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 relative group border-dashed">
                                    <div className={`w-16 h-16 ${card.bgColor} rounded-full flex items-center justify-center mb-2`}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                                        <p className="text-[12px] text-gray-400 font-medium leading-tight">{card.subtitle}</p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full">
                                        <input
                                            type="file"
                                            ref={fileInputRefs[card.id as keyof typeof fileInputRefs]}
                                            onChange={(e) => handleFileSelect(card.id, e)}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRefs[card.id as keyof typeof fileInputRefs].current?.click()}
                                            className="px-6 py-2.5 bg-black text-white text-[12px] font-bold rounded-xl transition-all hover:bg-gray-900 active:scale-95 whitespace-nowrap shadow-xl shadow-black/10"
                                        >
                                            Browse...
                                        </button>
                                        <p className="text-[11px] font-semibold text-gray-500 truncate text-left flex-1">
                                            {selectedFiles[card.id] ? selectedFiles[card.id]?.name : 'No file selected.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload Action */}
                        <div className="flex justify-end pt-4 border-t border-gray-50/50">
                            <button
                                onClick={handleUploadAll}
                                disabled={uploading || !Object.values(selectedFiles).some(f => f !== null)}
                                className="px-10 py-4 bg-gray-500 text-white rounded-2xl font-bold text-sm tracking-wide disabled:opacity-50 hover:bg-gray-600 transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-gray-200"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                Upload Documents
                            </button>
                        </div>

                        {/* Existing Documents List */}
                        <div className="pt-12 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Uploaded Documents</h2>
                                <p className="text-xs text-gray-400 font-medium tracking-tight">Documents currently in your verification vault</p>
                            </div>

                            <div className="space-y-4">
                                {(!provider?.idProofs?.length && !provider?.addressProofs?.length && !provider?.certificates?.length) ? (
                                    <div className="py-12 flex flex-col items-center justify-center bg-gray-50/30 rounded-3xl border border-dashed border-gray-100">
                                        <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                        <p className="text-gray-400 italic font-medium text-sm text-[11px]">No documents found in the vault.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            ...(provider?.idProofs?.map((u: string) => ({ url: u, type: 'ID' })) || []),
                                            ...(provider?.addressProofs?.map((u: string) => ({ url: u, type: 'Address' })) || []),
                                            ...(provider?.certificates?.map((u: string) => ({ url: u, type: 'Cert' })) || [])
                                        ].map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 group hover:shadow-xl hover:shadow-black/5 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all group-hover:scale-105">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{doc.url.split('/').pop()}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{doc.type} PROOF</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(doc.type.toLowerCase(), doc.url)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
}
