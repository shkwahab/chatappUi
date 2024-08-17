import React from 'react'
import { MdOutlineChat } from "react-icons/md";

const ChatSplashScreen = () => {
    return (
        <React.Fragment>
            <section id="splashscreen" className="flex justify-center items-center  h-screen">
                <div className=' flex flex-col items-center '>
                    <div className="my-4 w-24 flex justify-center h-24 items-center bg-gray-200  rounded-full">
                        <MdOutlineChat className=' p-1  text-6xl text-primary' />
                    </div>
                    <div className=' text-gray-800 my-4 font-medium text-2xl'>
                        Welcome to Group Chat App
                    </div>
                    <div>
                        Create the groups or channels to get started. Click on any chat to get started.
                    </div>
                    <div>

                    </div>
                </div>
            </section>
        </React.Fragment>
    )
}

export default ChatSplashScreen