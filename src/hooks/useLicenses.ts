"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface License {
    _id: string;
    key: string;
    status: 'AVAILABLE' | 'USED' | 'EXPIRED';
    ownedBy: string;
    learner?: {
        userId: string;
        name: string;
        email: string;
        phone?: string;
    };
    activationDate?: string;
    expiryDate?: string;
    price: number;
    createdAt: string;
}

interface LicenseStats {
    total: number;
    available: number;
    used: number;
    expired: number;
}

export function useLicenses() {
    const { token } = useAuth();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [stats, setStats] = useState<LicenseStats>({
        total: 0,
        available: 0,
        used: 0,
        expired: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchLicenses();
        }
    }, [token]);

    const fetchLicenses = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/licenses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch licenses');
            }

            setLicenses(data.data);
            setStats(data.stats);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createLicenses = async (quantity: number, price: number = 5) => {
        try {
            const response = await fetch('/api/licenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity, price })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create licenses');
            }

            // Refresh licenses list
            await fetchLicenses();

            return data;
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    const activateLicense = async (
        licenseKey: string,
        learnerEmail: string,
        learnerName: string,
        learnerPhone?: string
    ) => {
        try {
            const response = await fetch('/api/licenses/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    licenseKey,
                    learnerEmail,
                    learnerName,
                    learnerPhone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to activate license');
            }

            // Refresh licenses list
            await fetchLicenses();

            return data;
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    return {
        licenses,
        stats,
        loading,
        error,
        refetch: fetchLicenses,
        createLicenses,
        activateLicense
    };
}
