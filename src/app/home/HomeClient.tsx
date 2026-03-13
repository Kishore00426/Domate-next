'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomeLayout from '@/components/layouts/HomeLayout'; // Assuming I move layouts to components/layouts
import Carousel from '@/components/Carousel';
import CleanHomeServices from '@/components/CleanHomeServices';
import ServiceCategories from '@/components/ServiceCategories';
import OurExperts from '@/components/OurExperts';

export default function HomeClient() {
    const router = useRouter();

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
    return (
        <HomeLayout variant="dashboard">
            <Carousel />
            <ServiceCategories />
            <CleanHomeServices />
            <OurExperts />
        </HomeLayout>
    );
}
