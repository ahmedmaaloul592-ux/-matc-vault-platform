"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TrainingBundle {
    _id: string;
    title: string;
    provider: {
        name: string;
        logo?: string;
        type: 'Expert' | 'Institute' | 'Agency';
    };
    contentType: string;
    description: string;
    thumbnail: string;
    stats: {
        videoHours: number;
        documentCount: number;
        hasLiveSupport: boolean;
    };
    price: number;
    rating?: number;
    category: string;
    isActive: boolean;
    createdAt: string;
}

interface UseBundlesOptions {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export function useBundles(options: UseBundlesOptions = {}) {
    const [bundles, setBundles] = useState<TrainingBundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchBundles();
    }, [options.category, options.search, options.page, options.limit]);

    const fetchBundles = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.category) params.append('category', options.category);
            if (options.search) params.append('search', options.search);
            if (options.page) params.append('page', options.page.toString());
            if (options.limit) params.append('limit', options.limit.toString());

            const response = await fetch(`/api/bundles?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch bundles');
            }

            setBundles(data.data);
            setPagination(data.pagination);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        fetchBundles();
    };

    return { bundles, loading, error, pagination, refetch };
}

export function useBundle(id: string) {
    const [bundle, setBundle] = useState<TrainingBundle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchBundle();
        }
    }, [id]);

    const fetchBundle = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/bundles/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch bundle');
            }

            setBundle(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { bundle, loading, error, refetch: fetchBundle };
}
