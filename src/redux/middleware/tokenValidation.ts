// import { Middleware } from 'redux';
// import {signOut} from "../slices/auth-slice"
// import { baseApi } from '../../apis/apiHelper';

// const tokenValidationMiddleware: Middleware = store => next => action => {
//     const tokenExpiration = () => {
//               baseApi.interceptors.request.use((config)=>{
            
//               })
//         // Clear local storage
//         localStorage.removeItem('token');
//         // Dispatch action to clear authentication state
//         store.dispatch(signOut());

//         //Optional: Redirect to Auth
//         window.location.reload();
//     };
//     tokenExpiration();
    
//     return next(action);
// };

// export default tokenValidationMiddleware;
