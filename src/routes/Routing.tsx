import { BrowserRouter, Routes, Route } from 'react-router-dom';  // Import Route instead of Router
import Home from '@/pages/Chat/Home';
import Login from '@/pages/Authentication/signIn';
import Register from '@/pages/Authentication/register';
import ProtectedRoutes from '@/utils/ProtectedRoutes';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Auth } from '@/apis/types';
const Routing = () => {
    const authCtx: Auth = useSelector((state: RootState) => state.authCtx)
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<ProtectedRoutes> <Login /></ProtectedRoutes>} />
                <Route path="/register" element={!(authCtx.isLogin) ? <Register /> : <Home />} />
                <Route path="/" element={<ProtectedRoutes> <Home /> </ProtectedRoutes>} />
            </Routes>
        </BrowserRouter>
    );
};

export default Routing;
