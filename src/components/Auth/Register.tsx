import React, { FormEvent, useRef, useState } from 'react'
import { MdOutlineChat } from "react-icons/md";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/apis/auth.api';
import { CreateUserDto } from '@/apis/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifcation';

const Register = () => {
  const [togglePassword, setTogglePassword] = useState(false)
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null);

  const mutate = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      showSuccessNotification("User Registered Successfully")
      if (formRef.current) {
        formRef.current.reset(); 
      }
      navigate("/login")
    },
    onError: () => {
      showErrorNotification("Failed to Register the User")
    }
  })
  const SignUp = async (e: FormEvent) => {
    try {
      e.preventDefault()
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      const name = formData.get("name") as string;
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const body: CreateUserDto = { name, username, email, password };

      await mutate.mutateAsync(body)
    } catch (error) {
      console.log(error)
    }
  }
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
            <div className='absolute bottom-10 hidden md:block  md:w-[520px]'>
              <img src="/assets/imgs/chatimg.png" className='w-full' alt="chatapp" />
            </div>
          </div>
          <div className="rounded-md   bg-white  pb-10">
            <div className="py-10 ">
              <div className='font-semibold  mt-4 mb-2 text-center text-2xl'>
                Register Account
              </div>
              <div className='text-gray-800    text-center'>
                Get your free Group Chat App account now.
              </div>
              <div className=" mt-10 ">
                <form ref={formRef}  onSubmit={SignUp} className='flex space-y-4 flex-col  items-center' >
                  <div className='w-[250px] md:w-[400px]'>
                    <label className='text-gray-600 font-medium mb-1' htmlFor="email">
                      Name
                    </label>
                    <input type="text" name='name' id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="john.doe@company.com" required />
                  </div>
                  <div className='w-[250px] md:w-[400px]'>
                    <label className='text-gray-600 font-medium mb-1' htmlFor="email">
                      Username
                    </label>
                    <input type="text" name='username' id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="john.doe@company.com" required />
                  </div>
                  <div className='w-[250px] md:w-[400px]'>
                    <label className='text-gray-600 font-medium mb-1' htmlFor="email">
                      Email
                    </label>
                    <input type="email" name='email' id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="john.doe@company.com" required />
                  </div>
                  <div className='w-[250px] md:w-[400px]'>
                    <label className='text-gray-600 font-medium mb-1' htmlFor="password">
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
                    <div className="flex mt-2 space-x-2  flex-row items-center">
                      <input
                        type="checkbox"
                        name="tos"
                        id="tos"
                        className="accent-primary"
                      />

                      <label htmlFor="tos" className=' mt-6 md:mt-0 text-gray-800 '>
                        By registering you agree to the
                        <span className='mx-2 text-primary'>
                          <Link to={"#"}>
                            Terms of Use
                          </Link>
                        </span>
                      </label>
                    </div>

                    <div className='flex justify-center flex-col md:flex-row items-center w-[250px] md:w-[400px] my-10'>
                      <button type="submit" className=' w-full text-white bg-primary p-2 px-4 rounded-md'>
                        Register
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="  flex w-full flex-col md:flex-row items-center  justify-center">
                Already have an account ?
                <span className='  text-primary mx-1'>
                  <Link to={"/login"}>
                    Login
                  </Link>
                </span>
              </div>
              <div className="  mt-20 flex justify-center  flex-col md:flex-row items-center">
                © {new Date().getFullYear()} Group Chat App. Crafted with by
                <span className="mx-2 text-primary">
                  <Link to={"https://github.com/shkwahab/"} target="_blank">
                    Shk Wahab
                  </Link>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </React.Fragment>
  )
}

export default Register