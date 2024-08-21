import axios from 'axios';

export const BASE_API_URL = import.meta.env.VITE_BASE_URL;
export const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL;
export const SOCKET_MESSAGES_PATH = import.meta.env.VITE_SOCKET_MESSAGES_BASE_PATH;
export const SOCKET_ROOM_PATH = import.meta.env.VITE_SOCKET_ROOMS_BASE_PATH;

export const baseApi = axios.create({
    baseURL: BASE_API_URL,
});

// Request interceptor to include token
baseApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
baseApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

// API endpoints
export const LoginUri = "/auth";
export const RegisterUri = "/users";
export const CreateRoomUri = "/rooms"
export const UpdateRoomUri = "/rooms/"
export const GetAllRooms = "/rooms"
export const DeleteRoomUri = "/rooms/"
export const AddRoomsRequestUri = "/rooms/sendRequest"
export const AcceptRequestUri="/rooms/acceptRequest"
export const SendInvitationUri="/rooms/join"
export const AcceptInvitationUri="/rooms/acceptInvitation"
export const BlockMemberUri="/rooms/blockUnblockMember/"
export const GetSingleRoomUri = "/rooms"
export const GetUserUri = "/users";
export const UpdateUserUri = "/users/";
export const SendMessageUri = "/messages"
export const GetUserRoomsUri = "/rooms/user/"
export const GetRoomsMessagesUri = "/messages/rooms/"
export const EditMessageUri = "/messages"
export const DeleteMessageUri = "/messages"
export const UploadImageUri = "/upload/image"
export const ReadMessageUri = "/messages/readMessages"
export const DeleteInvitationUri = "/rooms/rejectInvitation"
export const LeaveGroupUri="/rooms/leaveRoom"
