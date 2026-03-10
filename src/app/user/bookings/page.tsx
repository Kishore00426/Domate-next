'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/components/layouts/UserLayout';
import UserBookings from '@/components/dashboard/UserBookings';
import { getUserBookings } from '@/api/bookings';
import { getMe } from '@/api/auth';

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [bookingsRes, userRes] = await Promise.all([
                    getUserBookings(),
                    getMe()
                ]);

                if (bookingsRes.success) {
                    setBookings(bookingsRes.bookings || []);
                }

                if (userRes.success) {
                    setUser(userRes.user);
                }
            } catch (err) {
                console.error("Error fetching bookings page data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return (
        <UserLayout>
            <UserBookings bookings={bookings} loading={loading} user={user} />
        </UserLayout>
    );
}
