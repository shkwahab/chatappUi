import React, { FormEvent, useState, useRef, useEffect } from 'react'
import { MdOutlineChat } from "react-icons/md";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getUser, loginFunc } from '@/apis/auth.api';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifcation';
import { login, LoginResult, User } from '@/apis/types';
import { useDispatch } from 'react-redux';
import { login as loginDispatch } from "@/redux/slices/auth-slice"

const Login = () => {
    const dispatch = useDispatch();
    const formRef = useRef<HTMLFormElement>(null);

    const loginMutate = useMutation({
        mutationFn: loginFunc,
        onSuccess: (res: LoginResult) => {
            localStorage.setItem('token', res.token);
            localStorage.setItem('refreshToken', res.refreshToken);
            showSuccessNotification('Login Successfully');
        },
        onError: (error) => {
            showErrorNotification('Login failed: ' + error.message);
        },
    });

    const { data: userData } = useQuery<User>({
        queryKey: ['User', loginMutate.data?.id],
        queryFn: () => {
            if (loginMutate.data?.id) {
                return getUser(loginMutate.data.id);
            }
            return Promise.resolve(null);
        },
        enabled: !!loginMutate.data?.id,
    });

    useEffect(() => {
        if (userData) {
            dispatch(loginDispatch({
                isLogin: true,
                user: userData,
                token: loginMutate.data?.token || '',
            }));
        }
    }, [userData, dispatch, loginMutate.data]);

    const signIn = async (e: FormEvent) => {
        try {
            e.preventDefault();
            if (!formRef.current) return;
            const formData = new FormData(formRef.current);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            const body: login = { email, password };
            loginMutate.mutateAsync(body);
        } catch (error) {
            console.log(error);
        }
    };


    const [togglePassword, setTogglePassword] = useState(false)

    return (
        <React.Fragment>
            <section id="login" className=" p-4 bg-primary h-screen overflow-y-auto overflow-hidden" >
                <div className="grid md:grid-cols-[.3fr_1fr] gap-4">
                    <div className=" text-white  p-4 relative md:h-screen">
                        <div id='logo' className="flex  font-sans space-x-2 items-center">
                            <MdOutlineChat className='  text-2xl text-white' />
                            <div className='text-3xl font-medium'>
                                Group Chat App
                            </div>
                        </div>
                        <div className='my-4'>
                            Responsive TailwindCss Chat App
                        </div>
                        <div className=' mt-20  absolute md:block hidden md:w-[520px]'>
                            <img src="/assets/imgs/chatimg.png" className='w-full' alt="chatapp" />
                        </div>
                    </div>
                    <div className="rounded-md    bg-white p-4   md:pb-10 ">
                        <div className="py-10 ">
                            <div className='font-semibold  mt-4 mb-2 text-center text-2xl'>
                                Welcome Back !
                            </div>
                            <div className='text-gray-800    text-center'>
                                Sign in to continue to Group Chat App.
                            </div>
                            <div className=" mt-10 ">
                                <form onSubmit={signIn} ref={formRef} className='flex space-y-4 flex-col  items-center' >
                                    <div className=' w-[250px] md:w-[400px]'>
                                        <label className='text-gray-600 font-medium mb-1' htmlFor="email">
                                            Email
                                        </label>
                                        <input type="email" id="email" name='email' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="john.doe@company.com" required />
                                    </div>
                                    <div className='w-[250px] md:w-[400px]'>
                                        <label className=' text-gray-600 font-medium mb-1' htmlFor="password">
                                            Password
                                        </label>
                                        <div className="flex items-center">
                                            <input type={togglePassword ? "text" : "password"} id="password"
                                                placeholder="Enter your Password"
                                                required name="password"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                                            <button type="button" id="togglePassword"
                                                onClick={() => {
                                                    setTogglePassword(!togglePassword)
                                                }} className="focus:outline-none -ml-8">
                                                {togglePassword ? <IoEyeOff /> : <IoEye />}
                                            </button>
                                        </div>
                                        <div className="flex mt-2 space-x-2 items-center">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                id="rememberMe"
                                                className="accent-primary"
                                            />

                                            <label htmlFor="rememberMe" className=' text-gray-800 '>Remember me</label>
                                        </div>

                                        <div className='flex justify-center w-[250px] md:w-[400px] my-10'>
                                            <button type="submit" className=' w-full text-white bg-primary p-2 px-4 rounded-md'>
                                                Sign In
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="  flex w-full md:flex-row flex-col items-center  justify-center">
                                Don't have an account ?
                                <span className='  text-primary mx-1'>
                                    <Link to={"/register"}>
                                        Register
                                    </Link>
                                </span>
                            </div>
                        </div>
                        <div className="  mt-20 flex md:flex-row flex-col items-center justify-center ">
                            © {new Date().getFullYear()} Group Chat App. Crafted with by
                            <span className="mx-2 text-primary">
                                <Link to={"https://github.com/shkwahab/"} target="_blank">
                                    Shk Wahab
                                </Link>
                            </span>
                        </div>
                    </div>

                </div>
            </section>
        </React.Fragment>
    )
}

export default Login