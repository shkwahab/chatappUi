import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { IoMdSearch } from "react-icons/io";
import { acceptRequest, getAllRooms, getNextRoomPage, getRoomDetail, sendInvitation } from '@/apis/rooms.api';
import {  useSelector } from 'react-redux';
import {  RootState } from '@/redux/store';
import { AcceptRequestDto, Rooms, SendInvitationDto, SingleRoom } from '@/apis/types';
import { HiUserGroup } from "react-icons/hi";
import { showErrorNotification } from '@/utils/notifcation';
import { queryClient } from '@/App';

interface GroupsRoomTabProps {
    room: SingleRoom
    setCurrentRoom: (room: SingleRoom) => void
}
const GroupsRoomTab: React.FC<GroupsRoomTabProps> = ({ room, setCurrentRoom }) => {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
    const authCtx = useSelector((state: RootState) => state.authCtx);
    const [acceptRequestDto, setAcceptRequestDto] = useState<AcceptRequestDto>({
        roomId: "",
        userId: ""
    })
    const [sendInvitationDto, setSendInvitationDto] = useState<SendInvitationDto>({
        roomId: "",
        userId: "",
        isApproved: false
    })
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [rooms, setRooms] = useState<Rooms>({
        count: 0,
        next: null,
        previous: null,
        result: []
    });
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const roomsNextPageRef = useRef<HTMLDivElement>(null);

    const { data: initialRooms, isSuccess, isError, error } = useQuery<Rooms>({
        queryKey: ["AllRooms"],
        queryFn: getAllRooms
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


    const filteredRooms = rooms.result.filter((room) => {
        if (searchQuery) {
            return room.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return !(room.isPublic)
    });
    const acceptRequestMutate = useMutation({
        mutationKey: ["acceptRequest"],
        mutationFn: acceptRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["AllRooms"] })
            queryClient.invalidateQueries({ queryKey: ["UserRooms"] })
        },
        onError: (error) => {
            showErrorNotification("Failed to accept request.Something went wrong")
            console.error(error)
        }
    })
    const acceptRequestCallback = async (e: FormEvent) => {
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
            queryClient.invalidateQueries({ queryKey: ["AllRooms"] })
        },
        onError: (error) => {
            showErrorNotification("Failed to send invite. Something went wrong.")
            console.error(error)
        }
    })

    const sendInvitationCallback = async (e: FormEvent) => {
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
                                                <HiUserGroup className={`p-2  text-4xl rounded-full ${room.room.id === item.id ? "bg-white text-black" : "bg-gray-300"}`} />
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
                                                                <form className={` ${member.request === "INVITATION" ? "hidden" : ""} text-xs w-8/12 cursor-pointer bg-primary p-2 text-white rounded-md`} onSubmit={acceptRequestCallback}>
                                                                    <button onClick={() => {
                                                                        setAcceptRequestDto({
                                                                            roomId: member.roomId,
                                                                            userId: member.userId
                                                                        })

                                                                    }} type="submit" key={member.id}>
                                                                        {member.request === "REQUEST" ? `${acceptRequestMutate.isPending ? "Sending Request" : "Accept Request"}` : ""}
                                                                    </button>
                                                                </form>
                                                                <div className={`${member.request === "INVITATION" ? "" : "hidden"} text-xs w-8/12  bg-green-600 p-2 text-white rounded-md`}>
                                                                    Invitation Sent
                                                                </div>
                                                            </React.Fragment>
                                                        })
                                                        :
                                                        <form onSubmit={sendInvitationCallback} className="text-xs w-8/12 cursor-pointer bg-primary p-2 text-white rounded-md">
                                                            <button type="submit" onClick={() => {
                                                                setSendInvitationDto({
                                                                    isApproved: false,
                                                                    roomId: item.id,
                                                                    userId: authCtx.user?.id as string
                                                                })
                                                            }}>
                                                                {sendInvitationMutate.isPending && "Sending Invitation"}
                                                                {sendInvitationMutate.isSuccess && "Invitation Sent"}
                                                                {!(sendInvitationMutate.isSuccess || sendInvitationMutate.isPending) && "Send Invitation"}
                                                            </button>
                                                        </form>

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

export default GroupsRoomTab;
