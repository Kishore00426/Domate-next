'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ServiceCategories from '@/components/ServiceCategories';
import ServiceList from '@/components/ServiceList';
import ServiceBanner from '@/components/ServiceBanner';
import SubcategoryGrid from '@/components/SubcategoryGrid';
import CategoryServiceRow from '@/components/CategoryServiceRow';
import HomeLayout from '@/components/layouts/HomeLayout';

function ServicesContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [categoryDetails, setCategoryDetails] = useState<any>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);

    // Redirect service providers away from this page
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const role = user?.role?.name || user?.role;
                if (role === 'service_provider') {
                    router.replace('/provider/dashboard');
                }
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, [router]);

    // Initial load from URL params
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const subcategoryParam = searchParams.get('subcategory');

        setSelectedCategory(categoryParam);
        setSelectedSubcategory(subcategoryParam);

        if (!categoryParam) {
            setCategoryDetails(null);
        }
    }, [searchParams]);

    // Fetch category details when selectedCategory changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (selectedCategory) {
                try {
                    const response = await fetch(`/api/services/categories/${selectedCategory}`);
                    const data = await response.json();
                    if (data.success) {
                        setCategoryDetails(data.category);
                    }
                } catch (err) {
                    console.error("Failed to fetch category details", err);
                }
            }
        };

        fetchDetails();
    }, [selectedCategory]);

    // Fetch all categories for default view
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/services/categories');
                const data = await response.json();
                if (data.success) {
                    setAllCategories(data.categories);
                }
            } catch (err) {
                console.error("Failed to fetch all categories", err);
            }
        };

        if (!selectedCategory) {
            fetchCategories();
        }
    }, [selectedCategory]);

    const handleCategorySelect = (categoryTitle: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', categoryTitle);
        params.delete('subcategory');
        router.push(`/services?${params.toString()}`);
    };

    const handleSubcategorySelect = (subcategoryName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedSubcategory === subcategoryName) {
            params.delete('subcategory');
        } else {
            params.set('subcategory', subcategoryName);
        }
        router.push(`/services?${params.toString()}`);
    };

    return (
        <HomeLayout variant="dashboard">
            <div className="pt-24 md:pt-4 pb-12 min-h-screen bg-beige">
                {selectedCategory ? (
                    <>
                        {categoryDetails && (
                            <ServiceBanner
                                name={
                                    selectedSubcategory
                                        ? categoryDetails.subcategories?.find((s: any) => s.name === selectedSubcategory)?.name
                                        : categoryDetails.name
                                }
                                description={
                                    selectedSubcategory
                                        ? categoryDetails.subcategories?.find((s: any) => s.name === selectedSubcategory)?.description
                                        : categoryDetails.description
                                }
                                imageUrl={
                                    selectedSubcategory
                                        ? categoryDetails.subcategories?.find((s: any) => s.name === selectedSubcategory)?.imageUrl
                                        : categoryDetails.imageUrl
                                }
                            />
                        )}

                        {categoryDetails?.subcategories && categoryDetails.subcategories.length > 0 && (
                            <SubcategoryGrid
                                subcategories={categoryDetails.subcategories}
                                selectedSubcategory={selectedSubcategory}
                                onSubcategorySelect={handleSubcategorySelect}
                                categoryName={categoryDetails.name}
                            />
                        )}

                        <div className="max-w-6xl mx-auto px-6 mb-8">
                            <h2 className="text-xl font-bold text-soft-black">
                                {selectedSubcategory
                                    ? t('services.servicesFor', { category: selectedSubcategory })
                                    : t('services.servicesFor', { category: selectedCategory })
                                }
                            </h2>
                            <ServiceList selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} />
                        </div>
                    </>
                ) : (
                    <>
                        <ServiceCategories
                            selectedCategory={selectedCategory}
                            onCategorySelect={handleCategorySelect}
                        />
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="border-b border-gray-200 my-4"></div>
                        </div>

                        <div className="pb-20">
                            {allCategories.map((category) => (
                                <CategoryServiceRow key={category._id} category={category} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </HomeLayout>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServicesContent />
        </Suspense>
    );
}
