import { Middleware } from "@reduxjs/toolkit";
import { signOut } from "@/redux/slices/auth-slice";
import { baseApi } from "@/apis/apiHelper";
import axios from "axios";

const sessionExpiry: Middleware = (store) => (next) => (action) => {

    // Response interceptor to handle token refresh
    baseApi.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        store.dispatch(signOut());
                        window.location.href = "/login";
                        return Promise.reject(error);
                    }

                    const response = await axios.post('/auth/refresh-token', {
                        refreshToken,
                    });

                    const { token } = response.data;

                    // Save new token to localStorage
                    localStorage.setItem('token', token);

                    // Update the Authorization header in the original request
                    baseApi.defaults.headers.Authorization = `Bearer ${token}`;
                    originalRequest.headers.Authorization = `Bearer ${token}`;

                    return baseApi(originalRequest);
                } catch (refreshError) {
                    store.dispatch(signOut());
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            }

            if (error.response?.status === 401) {
                store.dispatch(signOut());
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }
    );

    return next(action);
};

export default sessionExpiry;
