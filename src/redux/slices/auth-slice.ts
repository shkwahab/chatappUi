import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth } from "@/apis/types";



const initialState: Auth = {
    isLogin: false,
    user: null,
    token: localStorage.getItem("token")?localStorage.getItem("token"):null,
};

const authSlice = createSlice({
    name: "authCtx",
    initialState,
    reducers: {
        login(state: Auth, action: PayloadAction<Auth>) {
            const { user, token, isLogin } = action.payload;
            state.user = user;
            state.token = token;
            state.isLogin = isLogin;
        },
        signOut(state: Auth) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            state.isLogin = false;
            state.user = null;
            state.token = null;
        }
    }
});

export const { login, signOut } = authSlice.actions;

export default authSlice.reducer;
