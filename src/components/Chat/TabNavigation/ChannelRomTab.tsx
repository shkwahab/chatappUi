import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { IoMdSearch } from "react-icons/io";
import { acceptRequest, getAllRooms, getNextRoomPage, getRoomDetail, sendInvitation } from '@/apis/rooms.api';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { AcceptRequestDto, Rooms, SendInvitationDto, SingleRoom } from '@/apis/types';
import { showErrorNotification } from '@/utils/notifcation';
import { queryClient } from '@/App';
import { SOCKET_BASE_URL, SOCKET_ROOM_PATH } from '@/apis/apiHelper';
import { io } from 'socket.io-client';
import { TbSocial } from "react-icons/tb";
import { setGroup } from '@/redux/slices/group-slice';

interface ChannelRoomTabProps {
    room: SingleRoom
    setCurrentRoom: (room: SingleRoom) => void
}
const ChannelRoomTab: React.FC<ChannelRoomTabProps> = ({ room, setCurrentRoom }) => {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
    const authCtx = useSelector((state: RootState) => state.authCtx);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const groups = useSelector((state: RootState) => state.groups)
    const dispatch = useDispatch<AppDispatch>()
    const handleSelectChannel = (groups: Rooms) => {
        dispatch(setGroup(groups))
    }
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const roomsNextPageRef = useRef<HTMLDivElement>(null);

    const { data: initialRooms, isSuccess, isError, error } = useQuery<Rooms>({
        queryKey: ["AllChannels"],
        queryFn: getAllRooms
    });

    useEffect(() => {
        if (isSuccess && initialRooms) {
            handleSelectChannel(initialRooms)
            setNextPageUrl(initialRooms.next);
        }
    }, [initialRooms, isSuccess]);

    const fetchNextPage = async () => {
        if (nextPageUrl) {
            try {
                const nextRoom: Rooms = await getNextRoomPage(nextPageUrl);
                const newGroups: Rooms = {
                    result: [...groups.result, ...nextRoom.result],
                    next: nextRoom.next,
                    count: groups.count,
                    previous: nextRoom.previous
                };

                handleSelectChannel(newGroups)
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
        if (roomData)
            setCurrentRoom(roomData)
    }, [roomData])


    const formatTime = (date: Date | undefined) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    };


    const filteredRooms = groups.result.filter((room) => {
        if (searchQuery) {
            return room.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return (room.isPublic)
    });
    const acceptRequestMutate = useMutation({
        mutationKey: ["acceptRequest"],
        mutationFn: acceptRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["AllChannels"] })
            queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
        },
        onError: (error) => {
            showErrorNotification("Failed to accept request.Something went wrong")
            console.error(error)
        }
    })
    const acceptRequestCallback = async (e: FormEvent, acceptRequestDto: AcceptRequestDto) => {
        try {
            e.preventDefault()
            if (acceptRequestDto.roomId != "") {
                acceptRequestMutate.mutateAsync(acceptRequestDto)
            } else {
                console.log(acceptRequestDto)
                throw new Error("Required Data is Missing")
            }
        } catch (error) {
            console.log(error)
            showErrorNotification(error as string)
        }
    }


    const sendInvitationMutate = useMutation({
        mutationKey: ["sendInvitation"],
        mutationFn: sendInvitation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["AllChannels"] })
        },
        onError: (error) => {
            showErrorNotification("Failed to send invite. Something went wrong.")
            console.error(error)
        }
    })

    const sendInvitationCallback = async (e: FormEvent, sendInvitationDto: SendInvitationDto) => {
        try {
            e.preventDefault()
            if (sendInvitationDto.roomId != "") {
                sendInvitationMutate.mutateAsync(sendInvitationDto)
            } else {
                throw new Error("Required Data is missing")
            }
        } catch (error) {
            console.error(error)
        }
    }



    const revalidater = async () => {
        // @ts-ignore
        const initialRooms: Rooms = await getAllRooms()
        if (initialRooms) {
            const pagenumber = Math.ceil(initialRooms?.count / 10);
            const fetchedRooms: Rooms = {
                count: 0,
                next: null,
                previous: null,
                result: []
            };
            // Concatenate results from each page
            for (let page = 1; page <= pagenumber; page++) {
                const roomsData: Rooms = await getNextRoomPage(`/rooms?page=${page}`);
                // @ts-ignore
                fetchedRooms.result.push(...roomsData.result);
                fetchedRooms.count = roomsData.count;
                fetchedRooms.next = roomsData.next;
                fetchedRooms.previous = roomsData.previous;
            }
            handleSelectChannel(fetchedRooms)
        }
    }

    useEffect(() => {
        if (authCtx?.token) {
            const socket = io(SOCKET_BASE_URL + SOCKET_ROOM_PATH, {
                extraHeaders: {
                    Authorization: `Bearer ${authCtx?.token as string}`
                },
                autoConnect: true,
                reconnection: true
            });
            socket.connect();

            // General event handler function
            const handleSocketEvent = (message?: any) => {
                if (message) {
                    console.log(message);
                }
                revalidater()
            };

            // Array of event names that need to trigger the same logic
            const events = [
                'joinRoom',
                'sentInvitation',
                'acceptInvitation',
                'sentInvitationRequest',
                'acceptRequest',
                'rejectInvitation',
                'leaveRoom'
            ];

            events.forEach(event => {
                socket.on(event, handleSocketEvent);
            });


        }
    }, [authCtx, queryClient]);

    if (authCtx && authCtx.user && authCtx.user.id)
        return (
            <React.Fragment>

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


                    <div className='my-4  py-2 flex space-y-4 flex-col'>
                        {filteredRooms.map((item) => {
                            const isMemberShip = item.roomMemberships?.some(membership =>
                                membership.userId === authCtx.user?.id && membership.isApproved === true
                            );
                            const isPendingMember = item.roomMemberships?.some((member) => {
                                const isMatch = (member.userId === authCtx.user?.id) && member.isApproved === false;
                                return isMatch;
                            });



                            return <div onClick={() => {
                                if (isMemberShip) {
                                    setCurrentRoomId(item.id)

                                }
                            }} className={`${isMemberShip ? "cursor-pointer" : ""}  ${room.room.id === item.id ? "bg-gray-800 text-white " : ""} px-4 py-2`} key={item.id}>
                                <div className="flex items-center  space-x-2">
                                    <div>
                                        {!(item.img.includes("http")) &&
                                            (
                                                <TbSocial className={`p-2  text-4xl rounded-full ${room.room.id === item.id ? "bg-white text-black" : "bg-gray-300"}`} />
                                            )
                                        }
                                        {item.img !== "" &&
                                            <React.Fragment>
                                                <img className='w-8 h-8 rounded-full' src={item.img} alt={item.name} />
                                            </React.Fragment>
                                        }

                                    </div>
                                    <div className={`flex ${isMemberShip ? "flex-col" : ""}  w-full space-y-1`}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className='capitalize text-lg'>{item.name}</div>
                                            <div className={`text-sm ${isMemberShip ? "" : "hidden"}`}>
                                                {item.lastMessage?.createdAt && formatTime(item.lastMessage.createdAt)}
                                            </div>
                                        </div>
                                        {isMemberShip ?
                                            <div className="flex justify-between">
                                                <div className='text-sm pb-1'>{item.lastMessage?.message}</div>
                                                <div className={`text-xs pb-1 ${item.unread === 0 ? "hidden" : ""} bg-primary p-1 px-2  rounded-full text-white`}>{item.unread}</div>

                                            </div>
                                            : <React.Fragment>
                                                {
                                                    isPendingMember ?
                                                        item.roomMemberships?.filter((member) => member.userId === authCtx.user?.id).map((member) => {
                                                            return <React.Fragment>
                                                                <form className={` ${member.request === "INVITATION" || member.request === "NONE" ? "hidden" : ""} flex justify-center items-center text-xs w-8/12 cursor-pointer bg-primary p-2 text-white rounded-md`} onSubmit={(e) => {
                                                                    const acceptRequestDto = {
                                                                        roomId: member.roomId,
                                                                        userId: member.userId
                                                                    }
                                                                    acceptRequestCallback(e, acceptRequestDto)
                                                                    revalidater()

                                                                }}>
                                                                    <button disabled={acceptRequestMutate.isSuccess} type="submit" key={member.id}>
                                                                        {member.request === "REQUEST" ? `${acceptRequestMutate.isPending ? "Sending Request" : "Accept Request"}` : ""}
                                                                    </button>
                                                                </form>
                                                                <form className={` ${member.request === "NONE" ? "" : "hidden"} flex justify-center items-center text-xs mx-auto w-8/12  ${!sendInvitationMutate.isSuccess ? "bg-primary cursor-pointer" : " bg-green-600"}  p-2 text-white rounded-md`} onSubmit={(e) => {
                                                                    const inviteDto = {
                                                                        isApproved: true,
                                                                        roomId: member.roomId,
                                                                        userId: authCtx.user?.id as string,
                                                                        room: member.role
                                                                    }
                                                                    sendInvitationCallback(e, inviteDto)
                                                                }}>
                                                                    <button disabled={sendInvitationMutate.isSuccess} type="submit" key={member.id}>
                                                                        {sendInvitationMutate.isPending && "Joining"}
                                                                        {sendInvitationMutate.isSuccess && "Joined"}
                                                                        {!(sendInvitationMutate.isSuccess || sendInvitationMutate.isPending) && "Join Room"}
                                                                    </button>
                                                                </form>
                                                                <div className={`${member.request === "INVITATION" ? "" : "hidden"} flex justify-center items-center text-xs w-8/12  bg-green-600 p-2 text-white rounded-md`}>
                                                                    Joined
                                                                </div>
                                                            </React.Fragment>
                                                        })
                                                        :
                                                        <React.Fragment>
                                                            <form onSubmit={(e) => {
                                                                const inviteDto = {
                                                                    isApproved: true,
                                                                    roomId: item.id,
                                                                    userId: authCtx.user?.id as string
                                                                }
                                                                sendInvitationCallback(e, inviteDto)
                                                            }} className={`text-xs w-8/12 flex justify-center items-center  ${!sendInvitationMutate.isSuccess ? "bg-primary cursor-pointer" : " bg-green-600"}  p-2 text-white rounded-md`}>
                                                                <button disabled={sendInvitationMutate.isSuccess} type="submit">
                                                                    {sendInvitationMutate.isPending && "Joining"}
                                                                    {sendInvitationMutate.isSuccess && "Joined"}
                                                                    {!(sendInvitationMutate.isSuccess || sendInvitationMutate.isPending) && "Join Room"}

                                                                </button>
                                                            </form>

                                                        </React.Fragment>
                                                }
                                            </React.Fragment>
                                        }
                                    </div>

                                </div>

                            </div>
                        })}
                        <div ref={roomsNextPageRef} style={{ height: "1px" }} />
                    </div>
                </div>
            </React.Fragment >
        );
}

export default ChannelRoomTab;
