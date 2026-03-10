'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { getMe, updateProfile } from '@/api/auth';
import { getUserBookings } from '@/api/bookings';
import UserLayout from '@/components/layouts/UserLayout';

export default function AccountPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [user, setUser] = useState<any>({
        name: "",
        email: "",
        phone: "+91 98765 43210",
        location: "New York, USA",
        addressTag: "Home",
        role: ""
    });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMe();

                if (data.success) {
                    const userData = data.user;
                    setUser((prev: any) => ({
                        ...prev,
                        name: userData.username,
                        email: userData.email,
                        location: userData.address?.city || "Unknown Location",
                        phone: userData.contactNumber || "",
                        role: userData.role?.name || userData.role
                    }));

                    if (userData.role?.name !== 'service_provider' && userData.role !== 'service_provider') {
                        const bookingsData = await getUserBookings();
                        if (bookingsData.success) {
                            setBookings(bookingsData.bookings || []);
                        }
                    }
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error("Failed to fetch profile or bookings", err);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState(user);
    const addressTags = ["Home", "Work", "Other"];

    useEffect(() => {
        setTempData(user);
    }, [user]);

    const handleEdit = () => {
        setTempData({ ...user });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempData(user);
    };

    const handleSave = async () => {
        try {
            const data = await updateProfile({
                username: tempData.name,
                email: tempData.email,
                city: tempData.location,
                phone: tempData.phone,
            });
            if (data.success) {
                setUser({ ...tempData });
                setIsEditing(false);
            } else {
                alert("Failed to update profile: " + data.error);
            }
        } catch (err: any) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <UserLayout>
            <UserDashboard
                user={user}
                bookings={bookings}
                isEditing={isEditing}
                tempData={tempData}
                handleEdit={handleEdit}
                handleCancel={handleCancel}
                handleSave={handleSave}
                handleChange={handleChange}
                addressTags={addressTags}
            />
        </UserLayout>
    );
}
