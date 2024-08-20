import React, { FormEvent } from 'react'
import { DeleteMessageDto, MessageSender, RoomsMessages, SingleRoom } from '@/apis/types';
import { useMutation } from '@tanstack/react-query';
import { DeleteMessage } from '@/apis/message.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { queryClient } from '@/App';

interface DeleteProps {
    message: {
        id: string;
        message: string;
        createdAt: Date;
        updatedAt: Date | null;
        sender: MessageSender;
        receiver?: MessageSender;
    },
    onClose: () => void,
    room:SingleRoom
}
const DeleteModal: React.FC<DeleteProps> = ({ message,room, onClose }) => {
    const authCtx = useSelector((state: RootState) => state.authCtx)
    const mutate = useMutation({
        mutationKey: ["deleteMessage", message.id],
        mutationFn: DeleteMessage,

        onSuccess:  () => {
            if (room.room.id != "") {
                queryClient.invalidateQueries({ queryKey: ['UserRooms'] });

                 queryClient.setQueryData<RoomsMessages>(["RoomMessages", room.room.id], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        results: oldData.results.filter((item) => item.id !== message.id)
                    };
                });
            }

            onClose()

        }
    })
    const deleteMessage = async (e: FormEvent) => {
        try {
            if (authCtx.user?.id) {
                e.preventDefault()
                const body: DeleteMessageDto = {
                    messageId: message.id,
                    userId: authCtx.user.id
                }
                mutate.mutateAsync(body)
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <React.Fragment>
            <form onSubmit={deleteMessage} className="p-4 w-[250px] md:w-[400px]">
                <div className='flex flex-col space-y-2'>
                    <div>
                        Would you like to delete the messages?
                    </div>
                </div>
                <div className="flex space-x-4 items-center justify-end my-4 mt-8">
                    <div className=' cursor-pointer' onClick={() => {
                        onClose()
                    }}>Cancel</div>
                    <button type="submit" className='bg-primary text-white p-2 px-4 rounded-md'>Yes</button>
                </div>
            </form>
        </React.Fragment>
    )
}

export default DeleteModal