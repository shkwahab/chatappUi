import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Auth } from '../apis/types';
import { useNavigate } from 'react-router-dom';

const ProtectedRoutes = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const authCtx: Auth = useSelector((state: RootState) => state.authCtx)
    const router = useNavigate()
    useEffect(() => {
        if (authCtx.isLogin) {
            router("/")
        } else {
            router("/login")
        }
    }, [authCtx.isLogin, router])

    return (
        <React.Fragment>{children}</React.Fragment>
    )
}

export default ProtectedRoutes