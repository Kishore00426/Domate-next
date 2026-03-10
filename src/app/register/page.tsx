'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

function RegisterContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'user';
    const isProvider = role === 'service_provider';

    const [step, setStep] = useState(1);
    const [showAddress, setShowAddress] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
        doorNo: '',
        street: '',
        town: '',
        district: '',
        state: '',
        country: 'India',
        pincode: '',
        serviceCategory: '',
        workLocation: '',
        workPincode: '',
        radius: '',
        agreedToTerms: false,
        experience: '',
        idProof: null,
        addressProof: null,
        profilePhoto: null,
        certificates: null
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        setStep(1);
        setErrors({});
    }, [role]);

    const validateStep1 = () => {
        let tempErrors: any = {};
        if (!formData.name) tempErrors.name = t('register.errors.nameRequired');
        if (!formData.mobile) tempErrors.mobile = t('register.errors.mobileRequired');
        else if (!/^\d{10}$/.test(formData.mobile)) tempErrors.mobile = t('register.errors.mobileInvalid');

        if (!formData.email) {
            tempErrors.email = t('register.errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = t('register.errors.emailInvalid');
        }

        if (!formData.password) {
            tempErrors.password = t('register.errors.passwordRequired');
        } else if (formData.password.length < 6) {
            tempErrors.password = t('register.errors.passwordLength');
        }

        if (formData.confirmPassword !== formData.password) {
            tempErrors.confirmPassword = t('register.errors.passwordMatch');
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.name,
                        email: formData.email,
                        password: formData.password,
                        role: role,
                        mobile: formData.mobile
                    })
                });
                const data = await response.json();

                if (data.success) {
                    router.push('/login?registered=true');
                } else {
                    setErrors({ form: data.error || 'Registration failed' });
                }
            } catch (err) {
                console.error("Registration failed", err);
                setErrors({ form: 'Registration failed. Please try again.' });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (type === 'file') {
            const files = (target as HTMLInputElement).files;
            setFormData({ ...formData, [name]: files ? files[0] : null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    return (
        <div className="min-h-screen bg-beige flex items-center justify-center p-4">
            <div className={`bg-white rounded-3xl shadow-xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-300 transition-all ease-in-out ${showAddress && !isProvider ? 'max-w-4xl' : 'max-w-md'}`}>
                <Link href="/" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-soft-black transition-colors z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>

                <form onSubmit={handleSubmit}>
                    {errors.form && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{errors.form}</div>}
                    <div className={`flex flex-col ${showAddress && !isProvider ? 'md:flex-row' : ''} items-center`}>
                        <div className={`p-6 md:p-8 w-full ${showAddress && !isProvider ? 'md:w-1/2' : 'w-full'}`}>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-soft-black mb-2">
                                    {isProvider ? t('register.providerTitle') : t('register.title')}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {isProvider ? t('register.providerSubtitle') : t('register.subtitle')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.fullName')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t('register.fullName')}
                                        className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none bg-white text-sm text-black ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.mobile')}</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none bg-white text-sm text-black ${errors.mobile ? 'border-red-500' : ''}`}
                                    />
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1 ml-1">{errors.mobile}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('register.email')}
                                        className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none bg-white text-sm text-black ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.password')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none bg-white text-sm text-black ${errors.password ? 'border-red-500' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.confirmPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none bg-white text-sm text-black ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        >
                                            {showConfirmPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full bg-soft-black text-white py-3 rounded-xl font-bold text-base hover:bg-black transition-transform active:scale-95 shadow-lg"
                                >
                                    {isProvider ? t('register.registerProfessional') : t('register.register')}
                                </button>
                            </div>

                            <div className="mt-6 text-center text-xs text-gray-500">
                                {t('register.alreadyHaveAccount')} {' '}
                                <Link href={isProvider ? "/login?role=service_provider" : "/login"} className="font-bold text-soft-black hover:underline">
                                    {t('register.login')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-beige flex items-center justify-center p-4">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
