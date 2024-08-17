import React, { FormEvent, useRef } from 'react'
import { EditMessageDto, MessageSender } from '../../../../apis/types';
import { useMutation } from '@tanstack/react-query';
import { EditMessage } from '../../../../apis/message.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { queryClient } from '../../../../App';

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
}
const EditModal: React.FC<EditProps> = ({ message, onClose }) => {
    const authCtx = useSelector((state: RootState) => state.authCtx)
    const room = useSelector((state: RootState) => state.room)
    const formRef = useRef<HTMLFormElement>(null)
    const mutate = useMutation({
        mutationKey: ["editMessage", message.id],
        mutationFn: EditMessage,
        onSuccess: () => {
            if (room.room.id != "") {
                queryClient.invalidateQueries({ queryKey: ["RoomMessages", room.room.id] });
                queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
            }
            onClose()
        }
    })
    const editMessage = async (e: FormEvent) => {
        try {
            if (authCtx.user?.id) {
                e.preventDefault()
                if (!formRef.current) {
                    return
                }
                const formData = new FormData(formRef.current)
                const msg = formData.get("message") as string
                const body: EditMessageDto = {
                    message: msg,
                    messageId: message.id,
                    userId: authCtx.user?.id
                }
                mutate.mutateAsync(body)
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <React.Fragment>
            <form ref={formRef} onSubmit={editMessage} className="p-4 w-[250px] md:w-[400px]">
                <div className='flex flex-col space-y-2'>
                    <label htmlFor="message" className='text-base font-sans font-medium text-gray-800' >
                        Message
                    </label>
                    <input type="text" name='message' id="message" defaultValue={message.message} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  outline-none block w-11/12 p-2.5" />
                </div>
                <div className="flex justify-center my-4 mt-8">
                    <button type="submit" className='bg-primary text-white p-2 px-4 rounded-md'>Save</button>
                </div>
            </form>
        </React.Fragment>
    )
}

export default EditModal