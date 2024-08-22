import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { EditMessageDto, MessageSender, RoomsMessages, SingleRoom } from '@/apis/types';
import { useMutation } from '@tanstack/react-query';
import { EditMessage } from '@/apis/message.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { queryClient } from '@/App';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL, SOCKET_MESSAGES_PATH } from '@/apis/apiHelper';

interface EditProps {
    message: {
        id: string;
        message: string;
        createdAt: Date;
        updatedAt: Date | null;
        sender: MessageSender;
        receiver?: MessageSender;
    },
    onClose: () => void
    room: SingleRoom
}

const EditModal: React.FC<EditProps> = ({ message, onClose, room }) => {
    const authCtx = useSelector((state: RootState) => state.authCtx);
    const formRef = useRef<HTMLFormElement>(null);
    const [editMessageSocket, setEditMessageSocket] = useState<EditMessageDto>()
    useEffect(() => {
        if (authCtx && editMessageSocket) {
            const socket = io(SOCKET_BASE_URL + SOCKET_MESSAGES_PATH, {
                extraHeaders: {
                    Authorization: `Bearer ${authCtx?.token as string}`
                },
                autoConnect: true,
                reconnection: true
            })
            socket.connect()

            socket.on('editMessage', () => {
                queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
                queryClient.invalidateQueries({ queryKey: ["AllRooms"] });
                queryClient.setQueryData<RoomsMessages>(["RoomMessages", room.room.id], (oldData) => {
                    if (!oldData) {
                        return oldData
                    };
                    return {
                        ...oldData,
                        results: oldData.results.map((item) =>
                            item.id === editMessageSocket.messageId ? { ...item, ...editMessageSocket } : item
                        ),
                    };
                });
            });
        }
    }, [authCtx, editMessageSocket])
    const mutate = useMutation({
        mutationKey: ["editMessage", message.id],
        mutationFn: EditMessage,
        onSuccess: (updatedMessage) => { // Receive the updated message from the API response
            if (room.room.id != "") {
                queryClient.setQueryData<RoomsMessages>(["RoomMessages", room.room.id], (oldData) => {
                    if (!oldData) return oldData;
                  
                    return {
                        ...oldData,
                        results: oldData.results.map((item) =>
                            item.id === updatedMessage.id ? { ...item, ...updatedMessage } : item
                        ),
                    };
                });
                queryClient.invalidateQueries({ queryKey: ['UserRooms'] });

            }
            onClose();
        }
    });

    const editMessage = async (e: FormEvent) => {
        try {
            if (authCtx.user?.id) {
                e.preventDefault();
                if (!formRef.current) {
                    return;
                }
                const formData = new FormData(formRef.current);
                const msg = formData.get("message") as string;
                const body: EditMessageDto = {
                    message: msg,
                    messageId: message.id,
                    userId: authCtx.user?.id,
                    roomId: room.room.id
                };
                setEditMessageSocket(body)
                mutate.mutateAsync(body);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <React.Fragment>
            <form ref={formRef} onSubmit={editMessage} className="p-4 w-[250px] md:w-[400px]">
                <div className='flex flex-col space-y-2'>
                    <label htmlFor="message" className='text-base font-sans font-medium text-gray-800'>
                        Message
                    </label>
                    <input
                        type="text"
                        name='message'
                        id="message"
                        defaultValue={message.message}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none block w-11/12 p-2.5"
                    />
                </div>
                <div className="flex justify-center my-4 mt-8">
                    <button type="submit" className='bg-primary text-white p-2 px-4 rounded-md'>
                        Save
                    </button>
                </div>
            </form>
        </React.Fragment>
    );
};

export default EditModal;
