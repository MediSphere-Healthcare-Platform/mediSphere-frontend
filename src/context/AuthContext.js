import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Hydrate from sessionStorage on first load
        try {
            const stored = sessionStorage.getItem('medisphere_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = (userData) => {
        // userData: { token, role, msUserId, patientId (for patients), name }
        sessionStorage.setItem('medisphere_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('medisphere_user');
        setUser(null);
    };

    const getDashboardId = () => {
        if (!user) return null;
        // For DOCTOR: msUserId = doctorId (UD#### format)
        if (user.role === 'DOCTOR') return user.msUserId;
        // For PATIENT: use resolved patientId (P### format)
        if (user.role === 'PATIENT') return user.patientId;
        return null;
    };

    const isDoctor = () => user?.role === 'DOCTOR';
    const isPatient = () => user?.role === 'PATIENT';
    const isAdmin = () => user?.role === 'ADMIN';
    const isLoggedIn = () => !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, getDashboardId, isDoctor, isPatient, isAdmin, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
