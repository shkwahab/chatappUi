import { baseApi, DeleteMessageUri, EditMessageUri, GetRoomsMessagesUri, ReadMessageUri, SendMessageUri } from "./apiHelper"
import {  DeleteMessageDto, EditMessageDto, ReadMessageDto, SendMessageDto } from "./types"

export const SendMessage = async (sendMessageDto: SendMessageDto) => {
    const res = await baseApi.post(SendMessageUri, sendMessageDto)
    return res.data
}

export const GetRoomMessages = async (id: string, next?: string) => {
    if (next) {
        const res = await baseApi.get(next)
        return res.data
    } else {
        const res = await baseApi.get(GetRoomsMessagesUri + id)
        return res.data
    }
}


export const EditMessage = async (EditMessageDto: EditMessageDto) => {
    const res = await baseApi.patch(EditMessageUri, EditMessageDto)
    return res.data
}

export const DeleteMessage = async (DeleteMessageDto: DeleteMessageDto) => {
    const res = await baseApi.delete(DeleteMessageUri + "/" + DeleteMessageDto.messageId + "/" + DeleteMessageDto.userId)
    return res.data
}



export const ReadMessages = async (ReadMessageDto:ReadMessageDto)=>{
    const res= await baseApi.patch(ReadMessageUri,ReadMessageDto)
    return res.data
}