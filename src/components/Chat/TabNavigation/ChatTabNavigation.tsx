import { useQuery } from '@tanstack/react-query';
import React, { useState, useRef, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { getNextRoomPage, getRoomDetail, getUserRooms } from '@/apis/rooms.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Rooms, SingleRoom } from '@/apis/types';
import { TbSocial } from "react-icons/tb";
import { HiUserGroup } from "react-icons/hi";
import AddChatPopup from '@/utils/Popup';
import AddRoomModal from '@/components/Chat/TabNavigation/AddRoomModal';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { SOCKET_BASE_URL, SOCKET_ROOM_PATH } from '@/apis/apiHelper';
import { queryClient } from '@/App';
import { io } from 'socket.io-client';




interface ChatTabNavigationProps {
    setCurrentRoom: (room: SingleRoom) => void
    room: SingleRoom
}
const ChatTabNavigation: React.FC<ChatTabNavigationProps> = ({ setCurrentRoom, room }) => {

    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
    const authCtx = useSelector((state: RootState) => state.authCtx);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [rooms, setRooms] = useState<Rooms>({
        count: 0,
        next: null,
        previous: null,
        result: []
    });
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const roomsNextPageRef = useRef<HTMLDivElement>(null);

    const id = authCtx?.user?.id;
    const [addChatToggle, setAddChatToggle] = useState<boolean>(false);

    const { data: initialRooms, isSuccess, isError, error } = useQuery<Rooms>({
        queryKey: ["UserRooms", id],
        queryFn: async () => {
            if (id) {
                try {
                    const data = await getUserRooms(id);
                    return data;
                } catch (err) {
                    console.error("Failed to fetch rooms:", err);
                    return { count: 0, next: null, previous: null, result: [] };
                }
            }
            return { count: 0, next: null, previous: null, result: [] };
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (isSuccess && initialRooms) {
            setRooms(initialRooms);
            setNextPageUrl(initialRooms.next);
        }
    }, [initialRooms, isSuccess]);

    const fetchNextPage = async () => {
        if (nextPageUrl) {
            try {
                const nextRoom = await getNextRoomPage(nextPageUrl);
                setRooms(prevRooms => ({
                    ...prevRooms,
                    result: [...prevRooms.result, ...nextRoom.result],
                    next: nextRoom.next,
                }));
                setNextPageUrl(nextRoom.next);
            } catch (err) {
                console.error("Failed to fetch next rooms:", err);
            }
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            }, {
            threshold: 1.0, // Load more data when the ref is fully visible
        }
        );

        if (roomsNextPageRef.current) {
            observer.observe(roomsNextPageRef.current);
        }

        return () => {
            if (roomsNextPageRef.current) {
                observer.unobserve(roomsNextPageRef.current);
            }
        };
    }, [nextPageUrl]);

    if (isError) {
        console.error(error);
    }

    const { data: roomData } = useQuery<SingleRoom>({
        queryKey: ["currentChatRoom", currentRoomId],
        queryFn: async () => {
            const res = await getRoomDetail(currentRoomId)
            return res
        },
        enabled: !!currentRoomId
    })

    useEffect(() => {
        if (roomData) {
            setCurrentRoom(roomData)
        }
    }, [roomData])


    const formatTime = (date: Date | undefined) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    };

    const chatsFilter = [
        { id: 1, filter: "all" },
        { id: 2, filter: "groups" },
        { id: 3, filter: "channels" },
    ];

    const [activeChatFilter, setActiveChatFilter] = useState<number>(1);

    const filteredRooms = rooms.result.filter((room) => {
        if (searchQuery) {
            return room.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        switch (activeChatFilter) {
            case 1:
                return true;
            case 2:
                return !room.isPublic;
            case 3:
                return room.isPublic;
            default:
                return false;
        }
    });
    const updateRoom = async () => {
        const res: SingleRoom = await getRoomDetail(room.room.id)
        setCurrentRoom(res)
    }
    useEffect(() => {
        if (authCtx?.token) {
            const socket = io(SOCKET_BASE_URL + SOCKET_ROOM_PATH, {
                extraHeaders: {
                    Authorization: `Bearer ${authCtx?.token as string}`
                }
            })
            socket.connect()
            socket.on('joinRoom', () => {
                queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
            });
            socket.on('sentInvitation', () => {
                queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
            });
            socket.on('acceptInvitation', () => {
                queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
            });
            socket.on('sentInvitationRequest', () => {
                queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
            });
            socket.on('acceptRequest', () => {
                queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
            });
            socket.on('rejectInvitation', () => {
                queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
            });
            socket.on('blockUnblockMember', () => {
                updateRoom()
            });

        }
    }, [authCtx])

    return (
        <React.Fragment>
            <div className="   p-4 flex items-center w-full justify-between">
                <div className='text-xl text-gray-800'>Chats</div>
                <div onClick={() => setAddChatToggle(true)} className='cursor-pointer relative'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <FaPlus
                                    className='text-primary text-xl hover:bg-primary hover:text-white transition-all duration-300 bg-gray-100 p-1 rounded-md'
                                />
                            </TooltipTrigger>
                            <TooltipContent className=' bg-gray-800 text-white outline-none border-none'>
                                <p>Add Chat</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>



                </div>
            </div>

            <div className="h-full">
                <div className="px-4">
                    <div className='flex  justify-between   my-4 rounded-md p-2 bg-gray-800 text-white items-center px-4 space-x-2'>
                        <div>
                            <IoMdSearch className='text-xl  text-white' />
                        </div>
                        <div>
                            <input
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                name="search"
                                id="search"
                                className='bg-transparent w-[80%] outline-none placeholder:text-gray-400'
                                placeholder='Search'
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 flex relative  z-[99999] items-center  space-x-8 md:justify-start md:space-x-2">
                    {chatsFilter.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setActiveChatFilter(item.id)
                            }}
                            className={`cursor-pointer ${activeChatFilter === item.id ? "text-white bg-primary" : "bg-gray-400 text-white"} p-2 rounded-md px-4 text-sm capitalize`}
                        >
                            {item.filter}
                        </div>
                    ))}
                    <AddChatPopup
                        title='Add Chat Room'
                        isOpen={addChatToggle}
                        onClose={() => setAddChatToggle(false)}
                        children={<AddRoomModal close={() => setAddChatToggle(false)} />}
                    />
                </div>

                <div className='my-4  py-2 flex space-y-4 flex-col'>
                    {filteredRooms.map((item) => (
                        <div onClick={() => {
                            setCurrentRoomId(item.id)
                        }} className={`cursor-pointer ${room.room.id === item.id ? "bg-gray-800 text-white " : ""} px-4 py-2`} key={item.id}>
                            <div className="flex items-center  space-x-2">
                                <div>
                                    {!(item.img.includes("http")) &&
                                        (
                                            item.isPublic ?
                                                <TbSocial className={`p-2  text-4xl rounded-full ${room.room.id === item.id ? "bg-white text-black" : "bg-gray-300"}`} /> :
                                                <HiUserGroup className={`p-2  text-4xl rounded-full ${room.room.id === item.id ? "bg-white text-black" : "bg-gray-300"}`} />
                                        )
                                    }
                                    {item.img !== "" &&
                                        <img className='w-8 object-cover object-center h-8 mr-1 rounded-full' src={item.img} alt={item.name} />
                                    }
                                </div>
                                <div className="flex flex-col w-full space-y-0">
                                    <div className="flex items-center justify-between w-full">
                                        <div className='capitalize text-lg'>{item.name}</div>
                                        <div className='text-sm'>
                                            {item.lastMessage?.createdAt && formatTime(item.lastMessage.createdAt)}
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <div className='text-sm pb-1'>{item.lastMessage?.message.slice(0, 40)}  {item.lastMessage?.message && item.lastMessage?.message.length > 40 && "... "}</div>
                                        <div className={`text-xs pb-1 ${item.unread === 0 ? "hidden" : ""} bg-primary p-1 px-2  rounded-full text-white`}>{item.unread}</div>
                                        <div className={`text-xs p-1 text-white px-2 rounded-full ${item.adminId === authCtx?.user?.id && item.unread > 0 && item.actions > 0
                                            ? "hidden"
                                            : item.adminId === authCtx?.user?.id && item.actions > 0
                                                ? "bg-yellow-500"
                                                : "hidden"
                                            }`}>
                                            {item.actions > 0 && item.actions}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={roomsNextPageRef} style={{ height: "1px" }} />
                </div>
            </div>
        </React.Fragment>
    );
}

export default ChatTabNavigation;
