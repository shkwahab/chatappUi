import { AcceptInvitationUri, AcceptRequestUri, AddRoomsRequestUri, baseApi, BlockMemberUri, CreateRoomUri, DeleteInvitationUri, GetAllRooms, GetSingleRoomUri, GetUserRoomsUri, SendInvitationUri, UpdateRoomUri } from "./apiHelper";
import { AcceptInvitationDto, AcceptRequestDto, AddRoomsRequestDto, BlockMemberDto, CreateRoomDto, RejectInvitationDto, SendInvitationDto, UpdateRoomDto } from "./types";

export const getAllRooms = async () => {
    const res = await baseApi.get(GetAllRooms)
    return res.data;
}

export const getUserRooms = async (id: string | null) => {
    const res = await baseApi.get(GetUserRoomsUri + id)
    return res.data;
}

export const createRoom = async (createRoomDto: CreateRoomDto) => {
    const res = await baseApi.post(CreateRoomUri, createRoomDto)
    return res.data
}

export const getNextRoomPage = async (url: string) => {
    const res = await baseApi.get(url)
    return res.data
}

export const getRoomDetail = async (id: string | null) => {
    const res = await baseApi.get(GetSingleRoomUri + "/" + id)
    return res.data
}

export const adMemberRequest = async (memberRequest: AddRoomsRequestDto[]) => {
    const res = await baseApi.post(AddRoomsRequestUri, memberRequest)
    return res.data
}

export const updateRoom = async (id: string, updateRoomDto: UpdateRoomDto) => {
    const res = await baseApi.patch(UpdateRoomUri + id, updateRoomDto)
    return res.data
}

export const deleteRoom = async (id: string) => {
    const res = await baseApi.delete(UpdateRoomUri + id)
    return res.data
}


export const acceptRequest = async (acceptRequestDto: AcceptRequestDto) => {
    const res = await baseApi.patch(AcceptRequestUri, acceptRequestDto);
    return res.data
}

export const acceptInvitation = async (acceptInvitationDto: AcceptInvitationDto) => {
    const res = await baseApi.patch(AcceptInvitationUri, acceptInvitationDto)
    return res.data
}

export const sendInvitation = async (sendInvitationDto: SendInvitationDto) => {
    const res = await baseApi.post(SendInvitationUri, sendInvitationDto)
    return res.data
}

export const blockMember = async (blockMemberDto: BlockMemberDto) => {
    const res = await baseApi.patch(BlockMemberUri, blockMemberDto)
    return res.data
}

export const rejectInvitation = async (rejectInvitationDto: RejectInvitationDto) => {
    const res = await baseApi.delete(DeleteInvitationUri + "/" + rejectInvitationDto.adminId + "/" + rejectInvitationDto.roomId + "/" + rejectInvitationDto.userId)
    return res.data
}