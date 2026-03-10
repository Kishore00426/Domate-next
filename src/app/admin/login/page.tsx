'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import LanguageDropdown from '@/components/LanguageDropdown';

export default function AdminLoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                const user = data.user;
                const roleName = user.role?.name || user.role;

                if (roleName !== 'admin') {
                    setError('Access denied. You do not have administrator privileges.');
                    setLoading(false);
                    return;
                }

                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user', JSON.stringify(user));
                router.push('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-beige flex items-center justify-center p-4 font-sans text-black">
            <div className="absolute top-8 right-8">
                <LanguageDropdown />
            </div>

            <div className="max-w-md w-full">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-white">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-soft-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/20">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-soft-black mb-2">Admin Portal</h1>
                        <p className="text-gray-500 font-medium text-center">Secure access to the DoMate control panel.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@domate.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Security Token / Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-soft-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Log In to Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-gray-400 text-sm font-medium">
                    Protected by high-level encryption. Authorized personnel only.
                </p>
            </div>
        </div>
    );
}
