import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import { TbSocial } from "react-icons/tb";
import { HiUserGroup } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";


interface RoomSidebarInterface {
    onclose: () => void
    onAdd: () => void
    onUpdate: () => void
    onDelete: () => void
    setImage: React.Dispatch<React.SetStateAction<{
        img: string;
        alt: string;
    }>>
    setImageModalToggle: React.Dispatch<React.SetStateAction<boolean>>
}

const RoomDetailSidebar: React.FC<RoomSidebarInterface> = ({ onclose, setImage, onAdd, onUpdate, onDelete, setImageModalToggle }) => {
    const room = useSelector((state: RootState) => state.room)
    const authCtx = useSelector((state: RootState) => state.authCtx)
    const [actionBar, setActionBarToggle] = useState<boolean>(false)


    const handleActionBarToggle = () => {
        setActionBarToggle(!actionBar)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (event.target instanceof HTMLElement && !event.target.className.includes("actionBar")) {
                handleActionBarToggle()
            }
        };

        if (actionBar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [actionBar, handleActionBarToggle]);


    if (room.room.id != "" && authCtx && authCtx.user && authCtx.user.id)
        return (
            <React.Fragment>
                <div className="flex justify-between items-center pr-4">
                    <div className={`flex  space-x-5 items-center p-4`}>
                        {room.room.img !== "" ?
                            <img className='w-12 h-12 rounded-full' src={room.room.img} alt={room.room.name} /> :
                            <>
                                {room.room.isPublic ?
                                    <React.Fragment>
                                        <TbSocial className='text-2xl' />
                                    </React.Fragment> :
                                    <React.Fragment>
                                        <HiUserGroup className='text-2xl' />
                                    </React.Fragment>
                                }
                            </>
                        }
                        <div>
                            {room.room.name}
                        </div>
                    </div>
                    <div className="flex  space-x-2  items-center">
                        <div className={`actionBar ${authCtx.user.id === room.room.adminId ? "" : "hidden"} relative cursor-pointer `} onClick={handleActionBarToggle}>
                            <BsThreeDotsVertical className='actionBar text-2xl' />
                            <div className={`absolute right-4 top-10 actionBar z-50 flex  flex-col space-y-4 px-8 ${actionBar ? "" : "hidden"} bg-gray-100 shadow-xl p-2 rounded-md w-[200px]`}>
                                <div onClick={() => {
                                    onAdd()
                                    onclose()
                                }} className="actionBar">Add Members</div>
                                <div onClick={() => {
                                    onUpdate()
                                    onclose()
                                }} className="actionBar">Update</div>
                                <div onClick={() => {
                                    onDelete()
                                    onclose()
                                }} className="actionBar">Delete</div>
                            </div>
                        </div>
                        <div className='cursor-pointer' onClick={onclose}>
                            <IoMdClose className='text-2xl' />
                        </div>
                    </div>
                </div>

                <div className='my-4 flex flex-col space-y-4 p-4'>

                    <div className='font-semibold'>
                        Members
                    </div>

                    {room.users.map((item) => {
                        return <React.Fragment key={item.id}>
                            <div onClick={() => {
                                setImage({
                                    img: item.img,
                                    alt: item.name
                                })
                                setImageModalToggle(true)
                            }} className=' cursor-pointer flex space-x-2 items-center'>
                                <div >
                                    <img className='rounded-full w-12 h-12' src={item.img} alt={item.name} />
                                </div>
                                <div className='capitalize'>
                                    {item.name} 
                                </div>
                            </div>
                        </React.Fragment>
                    })}
                </div>


            </React.Fragment>
        )
}

export default RoomDetailSidebar