"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgressData {
    bundleId: string;
    isStarred: boolean;
    progress: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export function useUserProgress() {
    const { token } = useAuth();
    const [progressMap, setProgressMap] = useState<Record<string, UserProgressData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchProgress();
        }
    }, [token]);

    const fetchProgress = async () => {
        try {
            const res = await fetch('/api/user/progress', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { data } = await res.json();
            const map: Record<string, UserProgressData> = {};
            data.forEach((p: any) => {
                map[p.bundleId] = p;
            });
            setProgressMap(map);
        } catch (err) {
            console.error('Error fetching progress:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStar = async (bundleId: string) => {
        const current = progressMap[bundleId] || { bundleId, isStarred: false, progress: 0, status: 'NOT_STARTED' };
        const newStarred = !current.isStarred;

        // Optimistic update
        setProgressMap({
            ...progressMap,
            [bundleId]: { ...current, isStarred: newStarred }
        });

        try {
            await fetch('/api/user/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bundleId, isStarred: newStarred })
            });
        } catch (err) {
            console.error('Error toggling star:', err);
            // Revert on error
            setProgressMap(progressMap);
        }
    };

    const updateProgress = async (bundleId: string, progress: number) => {
        const current = progressMap[bundleId] || { bundleId, isStarred: false, progress: 0, status: 'NOT_STARTED' };
        const newStatus = progress === 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

        // Optimistic update
        setProgressMap({
            ...progressMap,
            [bundleId]: { ...current, progress, status: newStatus }
        });

        try {
            await fetch('/api/user/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bundleId, progress, status: newStatus })
            });
        } catch (err) {
            console.error('Error updating progress:', err);
            setProgressMap(progressMap);
        }
    };

    return { progressMap, loading, toggleStar, updateProgress };
}
