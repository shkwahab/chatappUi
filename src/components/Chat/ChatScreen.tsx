import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AcceptInvitationDto, MessageSender, RejectInvitationDto, RoomsMessages, SendMessageDto, SingleRoom } from '@/apis/types';
import { TbSocial } from "react-icons/tb";
import { HiUserGroup } from "react-icons/hi";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from 'emoji-picker-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GetRoomMessages, ReadMessages, SendMessage } from '@/apis/message.api';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifcation';
import { useQueryClient } from '@tanstack/react-query';
import { BsThreeDotsVertical } from "react-icons/bs";
import Popup from '@/utils/Popup';
import { FaChevronDown } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { IoTrashOutline, IoCopyOutline } from "react-icons/io5";
import EditModal from '@/components/Chat//TabNavigation/MessageActionModals/EditModal';
import DeleteModal from '@/components/Chat//TabNavigation/MessageActionModals/DeleteModal';
import { IoMdArrowRoundBack } from "react-icons/io";
import ImagePopup from '@/components/Chat/ImagePopup';
import { HiSpeakerWave } from "react-icons/hi2";
import { acceptInvitation, getRoomDetail, rejectInvitation } from '@/apis/rooms.api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { initialRoom } from '@/components/Chat/Home'
import { ReadMessageIcon } from "@/assets/ReadMessage"

interface ChatRoomInterfaceProps {
    room: SingleRoom,
    openRoomDetailTab: () => void,
    setCurrentRoom: (room: SingleRoom) => void

}

enum Action {
    update,
    delete,
    none

}

const ChatScreen: React.FC<ChatRoomInterfaceProps> = ({ room, openRoomDetailTab, setCurrentRoom }) => {
    const queryClient = useQueryClient();
    const authCtx = useSelector((state: RootState) => state.authCtx);
    const formRef = useRef<HTMLFormElement>(null);
    const chatContainerRef = useRef<HTMLDivElement | any>(null);
    const [emojiToggle, setEmojiToggle] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [messageActionModal, setMessageActionModal] = useState<Action>(2)
    const [imageModalToggle, setImageModalToggle] = useState<boolean>(false)
    const [imageUserModalToggle, setImageUserModalToggle] = useState<boolean>(false)
    const [imageInvitationModalToggle, setImagInvitationModalToggle] = useState<boolean>(false)
    const [selectedUserImage, setSelectedUserImage] = useState<{
        img: string
        alt: string
    }>(
        {
            img: "",
            alt: ""
        }
    )
    const [rejectInviteDto, setRejectInviteDto] = useState<RejectInvitationDto | null>(null);
    const [acceptInvitationDto, setAcceptInvitationtDto] = useState<AcceptInvitationDto>({
        adminId: "",
        roomId: "",
        userId: ""
    })
    const [isMessageMenuModalOpen, setIsMessageMenuModalOpen] = useState<boolean>(false)
    const [selectedMessage, setSelectedMessage] = useState<{
        id: string;
        message: string;
        createdAt: Date;
        updatedAt: Date | null;
        sender: MessageSender;
        receiver?: MessageSender;
    }>({
        id: "",
        message: "",
        createdAt: new Date(),
        updatedAt: null,
        sender: {
            id: "",
            img: "",
            email: "",
            username: "",
            name: "",
            createdAt: new Date(),
            updatedAt: null,
        }
    })
    const [actionToggle, setActionToggle] = useState<boolean>(false);
    const hanldeActionToggle = () => {
        setActionToggle(!actionToggle);
    }

    const formatTime = (date: Date | undefined) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    };
    const formatDate = (date: Date | undefined, displayedDates: Set<string>) => {
        if (!date) return '';

        const formattedDate = new Date(date).toDateString();

        if (!displayedDates.has(formattedDate)) {
            displayedDates.add(formattedDate);
            return formattedDate;
        }

        return '';
    }
    const displayedDates = new Set<string>();

    const handleEmoji = (emoji: any) => {
        setMessage((prevMessage) => prevMessage + emoji.emoji);
        setEmojiToggle(!emojiToggle);
    };
    const copyToClipboard = (text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            document.body.removeChild(textArea);
        }
    };


    const { data: RoomMessages } = useQuery<RoomsMessages>({
        queryKey: ["RoomMessages", room.room.id],
        queryFn: async () => {
            const res = await GetRoomMessages(room.room.id);
            return res;
        },
        enabled: !!room.room.id
    });

    const mutate = useMutation({
        mutationKey: ["messages"],
        mutationFn: SendMessage,
        onSuccess: async () => {
            if (formRef.current) {
                formRef.current.reset();
            }
            setMessage("");
            await queryClient.invalidateQueries({
                queryKey: ["RoomMessages", room.room.id],
                refetchType: 'active',
                exact: true
            });

            await queryClient.invalidateQueries({
                queryKey: ['UserRooms'],
                refetchType: 'active',
            });
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        },
        onError: () => {
            showErrorNotification("Failed to send message");
        }
    });

    const readMessageMutate = useMutation({
        mutationKey: ["readMessages"],
        mutationFn: ReadMessages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["RoomMessages", room.room.id] });
            queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
        }
    })

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (authCtx && authCtx.user && authCtx.user?.id) {
            if (!formRef.current) return;
            const formData = new FormData(formRef.current);
            const message = formData.get("message") as string;
            const body: SendMessageDto = {
                message: message ? message : "",
                roomId: room.room.id,
                senderId: authCtx.user?.id
            };
            mutate.mutateAsync(body);
        }
    };

    const loadPreviousChats = async () => {
        if (RoomMessages?.next) {
            try {
                const res: RoomsMessages = await GetRoomMessages(room.room.id, RoomMessages.next);
                const scrollPosition = chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop;

                queryClient.setQueryData(["RoomMessages", room.room.id], (oldMessages: RoomsMessages | undefined) => {
                    if (!oldMessages) return res;
                    return {
                        ...oldMessages,
                        results: [...oldMessages.results, ...res.results],
                        next: res.next,
                        previous: res.previous,
                    };
                });

                setTimeout(() => {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - scrollPosition;
                }, 0);

            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }
    };

    const handleScroll = async (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            const unreadMessages = RoomMessages?.results.filter((message) =>
                RoomMessages.unRead.map((item) => item.messageId).includes(message.id)
            );

            if (unreadMessages && unreadMessages.length > 0 && authCtx && authCtx?.user && authCtx?.user?.id) {
                unreadMessages.forEach((msg) => {
                    readMessageMutate.mutate({
                        messageId: msg.id,
                        userId: authCtx?.user?.id as string,
                        roomId: room.room.id
                    });
                });
            }
        }
        if (scrollTop === 0) {
            loadPreviousChats();
        }
    };
    const [action, setAction] = useState<boolean>(false)
    const handleAction = (state: boolean) => {
        setAction(state)
    }
    useEffect(() => {
        if (action === false) {
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [RoomMessages]);


    const { isSuccess: isRejected, isPending: isRejectPending } = useQuery({
        queryKey: ["rejectInvitation"],
        queryFn: async () => {
            if (rejectInviteDto?.adminId && rejectInviteDto?.roomId && rejectInviteDto?.userId) {
                const res = await rejectInvitation({
                    adminId: rejectInviteDto.adminId as string,
                    roomId: rejectInviteDto.roomId as string,
                    userId: rejectInviteDto.userId as string
                });
                return res;
            }
        },
        enabled: !!rejectInviteDto,
    });

    useEffect(() => {
        if (isRejected && rejectInviteDto) {
            queryClient.invalidateQueries({
                queryKey: ['UserRooms'],
                refetchType: 'active',
            });
            queryClient.invalidateQueries({
                queryKey: ['AllRooms'],
                refetchType: 'active',
            });
            const updatedRoom = {
                ...room,
                actions: room.actions.filter((item) => item.userId !== rejectInviteDto.userId),
            };
            setCurrentRoom(updatedRoom);
            // Show success notification
            showSuccessNotification("Invitation rejected successfully");

            // Clear rejectInviteDto state
            setRejectInviteDto(null);
        }

    }, [isRejectPending, rejectInviteDto]);

    const acceptInvitationMutate = useMutation({
        mutationKey: ["acceptnvitation"],
        mutationFn: acceptInvitation,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
            queryClient.invalidateQueries({ queryKey: ["AllRooms"] });
            showSuccessNotification("Invitation accepted successfully");
            const updatedRoom: SingleRoom = await getRoomDetail(acceptInvitationDto.roomId as string)
            setCurrentRoom(updatedRoom);
        },
        onError: (error) => {
            showErrorNotification("Failed to accept invite. Something went wrong")
            console.error(error)
        }
    })


    const acceptInviteCallback = async (e: FormEvent, acceptInvitationDto: AcceptInvitationDto) => {
        try {
            e.preventDefault()
            if (acceptInvitationDto.adminId != "") {
                acceptInvitationMutate.mutateAsync(acceptInvitationDto)
            } else {
                throw new Error("Required Data is missing")
            }
        } catch (error) {
            console.error(error)
        }
    }

    type Message = {
        id: string;
        sender: {
            id: string;
            name: string;
            img: string;
            email: string;
            username: string;
            createdAt: Date
            updatedAt: Date | null
        };
        message: string;
        createdAt: Date;
        readMessageUser: [] |
        {
            id: string
            username: string
            img: string
        }[]
        updatedAt: Date | null
        isSystemMessage?: boolean;
    };



    function addJoinAndLeaveMessages(room: SingleRoom, messages: Message[]): Message[] {
        const updatedMessages = [...messages];

        const currentUserIds = new Set(room.users.map(user => user.id));

        room.oldUsers.forEach(oldUser => {
            const alreadyExists = updatedMessages.some(
                msg => msg.isSystemMessage && msg.message.includes(oldUser.user.username)
            );

            if (!alreadyExists) {
                const membership = room.users.find(user => user.id === oldUser.user.id)?.roomMemberships;

                const leaveMessageDate = membership?.createdAt || oldUser.deletedAt || new Date();

                updatedMessages.push({
                    id: `leave-${oldUser.user.id}`,
                    sender: {
                        id: 'system',
                        name: 'System',
                        username: "",
                        img: '',
                        email: "",
                        createdAt: new Date(),
                        updatedAt: null,
                    },
                    message: `~${oldUser.user.username} has left the room`,
                    createdAt: leaveMessageDate,
                    updatedAt: null,
                    isSystemMessage: true,
                    readMessageUser: []
                });
            }
        });

        room.users.forEach(user => {
            if (!currentUserIds.has(user.id)) {
                const alreadyExists = updatedMessages.some(
                    msg => msg.isSystemMessage && msg.message.includes(user.username)
                );

                if (!alreadyExists) {
                    updatedMessages.push({
                        id: `join-${user.id}`,
                        sender: {
                            id: 'system',
                            name: 'System',
                            username: "",
                            img: '',
                            email: "",
                            createdAt: new Date(),
                            updatedAt: null,
                        },
                        message: `~${user.username} has joined the room`,
                        createdAt: new Date(), // You can adjust the date as needed
                        updatedAt: null,
                        isSystemMessage: true,
                        readMessageUser: []
                    });
                }
            }
        });

        return updatedMessages;
    }
    const RoomMessagesWitheEvents = addJoinAndLeaveMessages(room, RoomMessages?.results || []);

    if (authCtx && authCtx.user && authCtx.user.id)
        return (
            <div className="relative h-screen  flex flex-col">
                <div className="bg-gray-700 p-4 text-white">
                    <div className=" flex  justify-between items-center space-x-4">
                        <div className='flex md:block items-center  md:space-x-0 space-x-4 '>
                            <div onClick={() => {
                                setCurrentRoom(initialRoom)
                            }} className='cursor-pointer md:hidden'>
                                <IoMdArrowRoundBack />
                            </div>
                            <div className='flex space-x-4 cursor-pointer items-center' onClick={() => {
                                if (room.room.img.includes("http"))
                                    setImageModalToggle(true)
                            }}>
                                <div >
                                    {room.room.img !== "" ?
                                        <img className='w-8 h-8 rounded-full' src={room.room.img} alt={room.room.name} /> :
                                        <>
                                            {room.room.isPublic ?
                                                <TbSocial className='text-4xl text-black bg-white p-2 rounded-full' /> :
                                                <HiUserGroup className='text-4xl text-black bg-white p-2 rounded-full' />
                                            }
                                        </>
                                    }
                                </div>
                                <div className='flex space-y-0 flex-col'>

                                    <div className=' capitalize'>{room.room.name}</div>
                                    <div>
                                        {room.users.slice(0, 10).map((item, index) => (
                                            <span key={item.id} className='text-xs capitalize'>
                                                {item.id === authCtx.user?.id ? "You" : item.name}
                                                {index < room.users.slice(0, 10).length - 1 && ", "}
                                            </span>
                                        ))}
                                        {room.users.length > 10 && <div className='text-xs'>...and more</div>}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className={`flex space-x-6 `}>
                            <div className={`   relative ${room.room.adminId === authCtx?.user?.id ? "" : "hidden"}`}>
                                <div className={room.actions.length > 0 ? "" : "hidden"}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <button onClick={hanldeActionToggle} disabled={room.actions.length < 1}>
                                                <HiSpeakerWave className='text-2xl ' />
                                            </button>
                                            <div className={` absolute bg-yellow-600 p-1 px-2 text-xs  rounded-full -top-4 left-4 ${room.actions.length < 1 ? "hidden" : ""}`}>
                                                {room.actions.length}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className=' w-[300px] mr-10 max-h-[400px] overflow-y-auto'>
                                            {room.actions.map((item) => {
                                                return <div className='flex flex-col space-y-4 px-2' key={item.id}>
                                                    <DropdownMenuItem>
                                                        <div>
                                                            <span onClick={() => {
                                                                setSelectedUserImage({
                                                                    img: item.user.img,
                                                                    alt: item.user.username
                                                                })
                                                                setImagInvitationModalToggle(true)
                                                            }} className=" cursor-pointer  font-semibold">
                                                                ~ {item.user.username + " "}
                                                            </span>
                                                            has requested to join room.
                                                        </div>
                                                        <div className='flex space-x-4 justify-end my-1 '>
                                                            <div onClick={async () => {
                                                                setRejectInviteDto({
                                                                    adminId: authCtx?.user?.id as string,
                                                                    userId: item.userId as string,
                                                                    roomId: room.room.id as string
                                                                })
                                                            }} className=' px-2 cursor-pointer text-xs bg-red-600 text-white p-1 rounded-md'>
                                                                Reject
                                                            </div>
                                                            <div onClick={(e) => {
                                                                const updatedDto = {
                                                                    adminId: authCtx?.user?.id as string,
                                                                    userId: item.userId as string,
                                                                    roomId: room.room.id as string
                                                                };

                                                                setAcceptInvitationtDto(updatedDto);
                                                                acceptInviteCallback(e, updatedDto);
                                                            }} className=' px-2 cursor-pointer text-xs bg-primary text-white p-1 rounded-md'>
                                                                Accept
                                                            </div>
                                                        </div>

                                                    </DropdownMenuItem>

                                                </div>
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                </div>
                            </div>
                            <div className=' cursor-pointer' onClick={() => {
                                openRoomDetailTab()
                            }}>
                                <BsThreeDotsVertical className='text-2xl' />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="relative flex-1  bg-pattern bg-gray-900  overflow-y-auto" onScroll={handleScroll} ref={chatContainerRef}>
                    <div className="relative z-0 ">
                        <div className='flex flex-col p-4 py-10 pb-24  px-5'>
                            {RoomMessagesWitheEvents
                                ?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                ?.map((item) => {
                                    return <div key={item.id} className=" text-white message-container" >
                                        <div className="flex justify-center">
                                            <div className={`${!(displayedDates.has(new Date(item.createdAt).toDateString())) ? "" : "hidden"} inline-block  font-sans text-center bg-gray-700 p-2`}>
                                                {formatDate(item.createdAt, displayedDates)}
                                            </div>
                                        </div>

                                        <div className={` flex flex-col ${item.sender.id === authCtx.user?.id ? "items-end" : " items-start  "} ${item.isSystemMessage && "items-center"}`}>
                                            <div className={`relative p-4 my-4 mb-1 pr-8 md:pr-4 ${authCtx.user?.id === item.sender.id ? "hover:pr-8" : ""} ${item.sender.id === authCtx.user?.id ? "bg-primary text-white" : "bg-gray-200  text-black"} group max-w-56 md:max-w-96 ${item.isSystemMessage && "bg-gray-800  text-white"} rounded-lg text-sm`}>
                                                <div className=' text-gray-800 flex items-center space-x-1   text-xs'>

                                                    <div
                                                        onClick={() => {
                                                            if (!item.isSystemMessage) {
                                                                setSelectedUserImage({
                                                                    img: item.sender.img,
                                                                    alt: item.sender.name
                                                                });
                                                                setImageUserModalToggle(true);
                                                            }
                                                        }}
                                                        className={`cursor-pointer ${item.sender.id === authCtx.user?.id ? "hidden" : ""} text-primary font-semibold`}
                                                    >
                                                        {item.isSystemMessage ? "" : `~${item.sender.name}`}
                                                    </div>
                                                    <div className={` flex space-x-2 items-center ${item.sender.id === authCtx.user?.id ? "hidden" : ""} ${item.isSystemMessage && "hidden"}`}>
                                                        {formatTime(item.createdAt)}
                                                        <div className='ml-4'>
                                                            <DropdownMenu >
                                                                <DropdownMenuTrigger className=' outline-none border-none'>
                                                                    <ReadMessageIcon width={20} height={18} color={"#2563eb"} />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className=' outline-none border-none'>
                                                                    {item.readMessageUser.filter(user => user.id !== item.sender.id as string).map((subItem) => {
                                                                        return <DropdownMenuItem className=' outline-none border-none' key={subItem.id}>
                                                                            <div className='flex items-center space-x-2'>
                                                                                <div>
                                                                                    <img className='w-8 h-8 object-cover object-center rounded-full' src={subItem.img} alt={subItem.username} />
                                                                                </div>
                                                                                <div>
                                                                                    {subItem.username}
                                                                                </div>
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                    })}

                                                                </DropdownMenuContent>
                                                            </DropdownMenu>

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div >
                                                        {item.message}
                                                    </div>

                                                    <div className={` flex ${item.sender.id !== authCtx.user?.id ? "hidden" : ""} space-x-5 items-center justify-end m-2 mb-0 mt-1 text-xs text-gray-300   `}>
                                                        {formatTime(item.createdAt)}
                                                        <div className='ml-4'>
                                                            <DropdownMenu >
                                                                <DropdownMenuTrigger className=' outline-none border-none'>
                                                                    <ReadMessageIcon width={20} height={18} color={"#fff"} />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className=' outline-none border-none'>
                                                                    {item.readMessageUser.filter(user => user.id !== authCtx?.user?.id as string).map((subItem) => {
                                                                        return <DropdownMenuItem className=' outline-none border-none' key={subItem.id}>
                                                                            <div className='flex items-center space-x-2'>
                                                                                <div>
                                                                                    <img className='w-8 h-8 object-cover object-center rounded-full' src={subItem.img} alt={subItem.username} />
                                                                                </div>
                                                                                <div>
                                                                                    {subItem.username}
                                                                                </div>
                                                                            </div>
                                                                        </DropdownMenuItem>

                                                                    })}

                                                                </DropdownMenuContent>
                                                            </DropdownMenu>

                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`absolute  bottom-6 
                                            top-2 right-2 transition-transform duration-300 transform opacity-100 md:opacity-0 group-hover:opacity-100 group-hover:translate-y-2 ${authCtx.user?.id === item.sender.id ? "" : "hidden"}`}>
                                                    <DropdownMenu >
                                                        <DropdownMenuTrigger  >
                                                            <FaChevronDown
                                                                className={`  cursor-pointer relative`}
                                                            />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className=' w-[150px]'>
                                                            <DropdownMenuItem>
                                                                <div onClick={() => {
                                                                    setSelectedMessage(item)
                                                                    setIsMessageMenuModalOpen(true)
                                                                    handleAction(true)
                                                                    setMessageActionModal(Action.update)
                                                                }} className="flex cursor-pointer justify-between items-center w-full">
                                                                    <div >Update</div>
                                                                    <div><MdEdit /></div>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <div onClick={() => {
                                                                    setSelectedMessage(item)
                                                                    setIsMessageMenuModalOpen(true)
                                                                    handleAction(true)
                                                                    setMessageActionModal(Action.delete)
                                                                }} className=' flex cursor-pointer justify-between items-center w-full'>
                                                                    <div>Delete</div>
                                                                    <div><IoTrashOutline /></div>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <div onClick={() => {
                                                                    setSelectedMessage(item)
                                                                    copyToClipboard(item.message)
                                                                    showSuccessNotification("Message Copied Successfully")
                                                                }} className=' flex cursor-pointer justify-between items-center w-full'>
                                                                    <div>Copy</div>
                                                                    <div><IoCopyOutline /></div>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>


                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                })}

                        </div>

                    </div>
                </div>

                <form ref={formRef} onSubmit={sendMessage} className='absolute bg-gray-700  bottom-0 p-4 w-full'>

                    {room.room.deletedAt !== null ?
                        <React.Fragment>
                            <div className="text-white text-center">
                                Admin has deleted this room
                            </div>
                        </React.Fragment>
                        : <React.Fragment>
                            {
                                (room?.blockMembers?.some((blocked) => blocked.id === authCtx?.user?.id as string)) ?
                                    <React.Fragment>
                                        <div className="text-white text-center">
                                            Admin has blocked you can't send the message
                                        </div>
                                    </React.Fragment> :
                                    <div className="flex items-center space-x-4">
                                        <div className='relative'>
                                            <BsEmojiSmile className='cursor-pointer  text-white' onClick={() => setEmojiToggle(!emojiToggle)} />
                                            {emojiToggle && (
                                                <div className="absolute -top-96 z-40">
                                                    <EmojiPicker onEmojiClick={handleEmoji} height="350px" width="350px" />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            defaultValue={message}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            type="text"
                                            id="message"
                                            name='message'
                                            className="bg-gray-700 border text-white text-sm rounded-lg outline-none block w-full p-2.5"
                                            placeholder='Type your message here...'
                                        />
                                        <button type="submit" className='bg-primary p-2 rounded-md'>
                                            <IoMdSend className='text-2xl text-white' />
                                        </button>
                                    </div>
                            }
                        </React.Fragment>
                    }

                </form>

                <Popup title={Action.update === messageActionModal ? "Edit Message" : "Delete Message"} children={<React.Fragment>
                    {Action.update === messageActionModal ?
                        <EditModal room={room} onClose={() => {
                            setIsMessageMenuModalOpen(false)
                            handleAction(false)
                        }} message={selectedMessage} /> :
                        <DeleteModal onClose={() => {
                            setIsMessageMenuModalOpen(false)
                            handleAction(false)
                        }} message={selectedMessage}
                            room={room}

                        />
                    }
                </React.Fragment>}
                    isOpen={isMessageMenuModalOpen}
                    onClose={() => {
                        setIsMessageMenuModalOpen(false)
                    }}
                />

                <Popup children={<React.Fragment>
                    <ImagePopup img={selectedUserImage.img} alt={selectedUserImage.alt} />
                </React.Fragment>} isOpen={imageInvitationModalToggle} onClose={() => {
                    setImagInvitationModalToggle(false)
                }} />
                <Popup children={<React.Fragment>
                    <ImagePopup img={room.room.img} alt={room.room.name} />
                </React.Fragment>} isOpen={imageModalToggle} onClose={() => {
                    setImageModalToggle(false)
                }} />
                <Popup children={<React.Fragment>
                    <ImagePopup img={selectedUserImage.img} alt={selectedUserImage.alt} />
                </React.Fragment>} isOpen={imageUserModalToggle} onClose={() => {
                    setImageUserModalToggle(false)

                }} />

            </div>
        );
};

export default ChatScreen;
