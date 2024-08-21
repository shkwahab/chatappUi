import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { TbSocial } from "react-icons/tb";
import { HiUserGroup } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BlockMemberDto,  SingleRoom } from '@/apis/types';
import { BlockMemberDto as UnBlockMemberDto } from '@/apis/types';
import { useMutation } from '@tanstack/react-query';
import { blockMember,  getRoomDetail,  unBlockMember } from '@/apis/rooms.api';
import { queryClient } from '@/App';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL, SOCKET_ROOM_PATH } from '@/apis/apiHelper';

interface RoomSidebarInterface {
    room: SingleRoom
    onclose: () => void
    onAdd: () => void
    onUpdate: () => void
    onDelete: () => void
    setLeaveRoom:() => void
    setCurrentRoom: (room: SingleRoom) => void;
    setImage: React.Dispatch<React.SetStateAction<{
        img: string;
        alt: string;
    }>>
    setImageModalToggle: React.Dispatch<React.SetStateAction<boolean>>
}

const RoomDetailSidebar: React.FC<RoomSidebarInterface> = ({ onclose,setLeaveRoom, room, setImage, onAdd, onUpdate, onDelete, setImageModalToggle, setCurrentRoom }) => {
    const authCtx = useSelector((state: RootState) => state.authCtx)
    const [actionBar, setActionBarToggle] = useState<boolean>(false)
    const [blockMemberDto, setBlockMemberDto] = useState<BlockMemberDto>()
 
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

    const unBlockMemberMutate = useMutation({
        mutationKey: ["unBlockMember"],
        mutationFn: async ({ adminId, unBlockMemberDto }: { adminId: string, unBlockMemberDto: UnBlockMemberDto }) => {
            const res = await unBlockMember({ adminId, unBlockMemberDto });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
            queryClient.invalidateQueries({ queryKey: ["AllRooms"] });
            const blockuserId = blockMemberDto?.userId as string;

            const newRoom = {
                ...room,
                blockMembers: room.blockMembers.filter((blocked) => blocked.id !== blockuserId)
            };
            setCurrentRoom(newRoom)
        },
        onError: (error) => {
            console.error(error)
        }
    });


    const unBlockMemberCallback = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, unBlockMemberDto: UnBlockMemberDto) => {
        try {
            e.preventDefault()
            const adminId = authCtx?.user?.id as string
            unBlockMemberMutate.mutateAsync({ adminId, unBlockMemberDto })
        } catch (error) {
            console.error(error)
        }
    }
    const blockMemberMutate = useMutation({
        mutationKey: ["blockMember"],
        mutationFn: async ({ adminId, blockMemberDto }: { adminId: string, blockMemberDto: BlockMemberDto }) => {
            const res = await blockMember({ adminId, blockMemberDto });
            return res;
        },
        onSuccess: async() => {
            queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
            queryClient.invalidateQueries({ queryKey: ["AllRooms"] });
            const res:SingleRoom=await getRoomDetail(blockMemberDto?.roomId as string)
            setCurrentRoom(res)
        },
        onError: (error) => {
            console.error(error)
        }
    });


    const blockMemberCallback = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, blockMemberDto: BlockMemberDto) => {
        try {
            e.preventDefault()
            const adminId = authCtx?.user?.id as string
            blockMemberMutate.mutateAsync({ adminId, blockMemberDto })
        } catch (error) {
            console.error(error)
        }
    }
  
    useEffect(()=>{
        if(authCtx?.token as string){
            const roomsocket = io(SOCKET_BASE_URL + SOCKET_ROOM_PATH, {
                extraHeaders: {
                    Authorization: `Bearer ${authCtx?.token as string}`
                }
            })
            roomsocket.on('blockUnblockMember', () => {
                // console.log("hahah")
            });
        }
    },[authCtx])
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
                        <div className=' capitalize'>
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
                    <div>
                        {room.users.map((item) => {
                            return <React.Fragment key={item.id}>
                                <div className=' flex  justify-between items-center my-6'>
                                    <div onClick={() => {
                                        setImage({
                                            img: item.img,
                                            alt: item.name
                                        })
                                        setImageModalToggle(true)
                                    }} className='flex cursor-pointer space-x-2 items-center'>
                                        <div   >
                                            <img className='rounded-full w-12 h-12' src={item.img} alt={item.name} />
                                        </div>
                                        <div className='capitalize'>
                                            {item.name}
                                        </div>
                                    </div>
                                    <div>
                                        <button onClick={setLeaveRoom} className={`${authCtx?.user?.id === item?.id ? "" : "hidden"} text-white bg-red-500 p-2 rounded-md`}>
                                            Leave Room
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                if (room?.blockMembers?.some((blocked) => blocked.id === item.id)) {
                                                    setBlockMemberDto({ roomId: room.room.id, userId: item.id, isBlocked: false });
                                                    unBlockMemberCallback(e, { roomId: room.room.id, userId: item.id, isBlocked: false });
                                                } else {
                                                    setBlockMemberDto({ roomId: room.room.id, userId: item.id, isBlocked: true });
                                                    blockMemberCallback(e, { roomId: room.room.id, userId: item.id, isBlocked: true });
                                                }
                                            }}
                                            className={`${room.room.adminId === authCtx?.user?.id ? "" : "hidden"} cursor-pointer ${room?.blockMembers?.some((blocked) => blocked.id === item.id)
                                                ? "bg-red-500"
                                                : "bg-gray-800"
                                                }  ${item.id === authCtx?.user?.id ? "hidden" : ""} p-2 rounded-md text-white`}
                                        >
                                            <div >
                                                {room?.blockMembers?.some((blocked) => blocked.id === item.id)
                                                    ? "UnBlock"
                                                    : "Block"}
                                            </div>
                                        </button>

                                    </div>
                                </div>
                            </React.Fragment>
                        })}
                    </div>
                </div>


            </React.Fragment>
        )
}

export default RoomDetailSidebar