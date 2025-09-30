import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../store';
import React from 'react';

type Props = {
    children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const token = useSelector((state: RootState) => state.auth.accessToken);
    console.log(token);

    // if (!token) {
    //     return <Navigate to="/login" replace />;
    // }

    return <>{children}</>;
};

export default ProtectedRoute;