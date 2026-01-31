"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface License {
    _id: string;
    key: string;
    status: 'AVAILABLE' | 'PARTIALLY_USED' | 'USED' | 'EXPIRED';
    ownedBy: string;
    // New fields for multi-user support
    maxUsers: number;
    usageCount: number;
    learners: Array<{
        userId: string;
        name: string;
        email: string;
        phone?: string;
        activationDate: string;
    }>;
    // Keep legacy field for backward compatibility if needed, though learners array is preferred
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
    const { token, user } = useAuth();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [stats, setStats] = useState<LicenseStats>({
        total: 0,
        available: 0,
        used: 0,
        expired: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userRequests, setUserRequests] = useState<any[]>([]);

    useEffect(() => {
        if (token) {
            fetchLicenses();
            fetchMyRequests();
        }
    }, [token]);

    const fetchMyRequests = async () => {
        try {
            const userId = user?.id || (user as any)?._id;
            if (!userId) return;

            const response = await fetch(`/api/requests?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserRequests(data);
            }
        } catch (err) {
            console.error('Failed to fetch user requests:', err);
        }
    };

    const fetchLicenses = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock Data for Local Users
            if (token?.startsWith('local-mock-token-')) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                const mockLicenses: License[] = Array.from({ length: 5 }).map((_, i) => {
                    const maxUsers = 10;
                    const usageCount = i % 2 !== 0 ? 3 : 0; // Some used, some empty

                    return {
                        _id: `mock-license-${i}`,
                        key: `MATC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                        status: usageCount === 0 ? 'AVAILABLE' : (usageCount >= maxUsers ? 'USED' : 'PARTIALLY_USED'),
                        ownedBy: 'mock-user-id',
                        maxUsers: maxUsers,
                        usageCount: usageCount,
                        learners: usageCount > 0 ? Array.from({ length: usageCount }).map((__, j) => ({
                            userId: `learner-${i}-${j}`,
                            name: `Apprenant Test ${j + 1}`,
                            email: `learner${j}@test.com`,
                            activationDate: new Date().toISOString()
                        })) : [],
                        // Legacy support
                        learner: usageCount > 0 ? {
                            userId: `learner-${i}-0`,
                            name: 'Apprenant Test 1',
                            email: 'learner0@test.com'
                        } : undefined,
                        price: 250,
                        createdAt: new Date().toISOString()
                    };
                });

                setLicenses(mockLicenses);
                setStats({
                    total: 5,
                    available: 3, // Logic slightly off for simplicity, just mock
                    used: 2,
                    expired: 0
                });
                setLoading(false);
                return;
            }

            const userId = user?.id || (user as any)?._id;
            if (!userId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/licenses?ownerId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch licenses');
            }

            const licensesList = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
            setLicenses(licensesList);

            // Calculate stats locally
            const statsObj = {
                total: licensesList.length,
                available: licensesList.filter((l: any) => l.status === 'AVAILABLE').length,
                used: licensesList.filter((l: any) => l.status === 'USED' || l.status === 'PARTIALLY_USED').length,
                expired: licensesList.filter((l: any) => l.status === 'EXPIRED').length
            };
            setStats(statsObj);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createLicenses = async (quantity: number, price: number = 5) => {
        try {
            const userId = user?.id || (user as any)?._id;
            const response = await fetch('/api/licenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantity,
                    price,
                    ownedBy: userId
                })
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

    const requestLicenses = async (quantity: number) => {
        try {
            const userId = user?.id || (user as any)?._id;
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    quantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send request');
            }

            return data;
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    const activateLicense = async (
        licenseKey: string,
        learnerEmail: string,
        learnerName: string,
        learnerPhone?: string
    ) => {
        try {
            // Mock activation for local users
            if (token?.startsWith('local-mock-token-')) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Update local state simply for demo
                const updatedLicenses = licenses.map(l => {
                    if (l.key === licenseKey) {
                        if (l.usageCount >= l.maxUsers) throw new Error('Licence pleine (10/10 utilisateurs)');

                        const newCount = l.usageCount + 1;
                        return {
                            ...l,
                            usageCount: newCount,
                            status: newCount >= l.maxUsers ? 'USED' : 'PARTIALLY_USED',
                            learners: [...l.learners, {
                                userId: `new-learner-${Date.now()}`,
                                name: learnerName,
                                email: learnerEmail,
                                phone: learnerPhone,
                                activationDate: new Date().toISOString()
                            }]
                        } as License; // Type assertion needed due to complex update
                    }
                    return l;
                });
                setLicenses(updatedLicenses);
                return { success: true };
            }

            const response = await fetch('/api/licenses/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    licenseKey,
                    email: learnerEmail,
                    name: learnerName,
                    phone: learnerPhone
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
        activateLicense,
        requestLicenses,
        userRequests,
        refetchRequests: fetchMyRequests
    };
}
