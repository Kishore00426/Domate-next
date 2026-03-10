'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';
import GoToTop from '@/components/GoToTop';
import { fetchServices } from '@/store/servicesSlice';

export default function LandingPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchServices());

    // Redirect service providers to their dashboard
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user?.role?.name || user?.role;
        if (role === 'service_provider') {
          window.location.href = '/provider/dashboard';
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <Footer />
      <GoToTop />
    </>
  );
}
