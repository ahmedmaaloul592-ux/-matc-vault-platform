"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'ADMIN' | 'PROVIDER' | 'RESELLER_T1' | 'RESELLER_T2' | 'STUDENT';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    walletBalance?: number;
    enrolledLearners?: number;
    plusPoints?: number;
    phone?: string;
    country?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    country?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('matc_token');
        const storedUser = localStorage.getItem('matc_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user
            localStorage.setItem('matc_token', data.token);
            localStorage.setItem('matc_user', JSON.stringify(data.user));

            setToken(data.token);
            setUser(data.user);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            // Store token and user
            localStorage.setItem('matc_token', result.token);
            localStorage.setItem('matc_user', JSON.stringify(result.user));

            setToken(result.token);
            setUser(result.user);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('matc_token');
        localStorage.removeItem('matc_user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const updateUser = async (data: Partial<User>) => {
        try {
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Update failed');
            }

            // Update local user data
            localStorage.setItem('matc_user', JSON.stringify(result.user));
            setUser(result.user);
        } catch (error: any) {
            console.error('Update user error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
