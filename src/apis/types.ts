import React from "react"

export type login = {
    email: string
    password: string
}

export type LoginResult = {
    id: string
    token: string
    refreshToken: string
}

export type User = {
    id: string
    name: string
    username: string
    email: string
    img: string
    createdAt: Date
    updatedAt: Date | null
}
export type UpdateUserDto = {
    name?: string
    username?: string
    email?: string
    img?: string
}
export type Auth = {
    isLogin: boolean
    user: User | null,
    token: string | null | Storage
}


export interface CreateUserDto {
    name: string
    username: string
    email: string
    password: string
}

export interface HomeProps {
    user: User | null;
}
export interface Widgets {
    id: number,
    name?: string
    icon?: React.ReactNode,
    activeTab?: string,
    url?: string
    logout?: Function
}

type LastMesage = {
    id: string;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

type room = {
    name: string
    img?: string
    isPublic?: boolean
    adminId: string
}

type members = {
    userId: string
}[]
type Unread = {
    id: string
    messageId: string
    userId: string
    roomId: string
    isRead: boolean
    readAt: Date

}
type Membership = {
    id: string
    userId: string,
    request: "NONE" | "REQUEST" | "INVITATION",
    roomId: string,
    role: "ADMIN" | "USER",
    isBlocked: boolean,
    isApproved: boolean,
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date | null
}[]

export type Result = {
    id: string
    unread: number
    actions: number
    roomMemberships?: Membership
    name: string
    img: string
    createdAt: Date
    isPublic: boolean
    adminId: string
    updatedAt: Date | null
    deletedAt?: Date | null
    lastMessage: LastMesage | null
}


export interface CreateRoomDto {
    room: room,
    members?: members
}
export interface Rooms {
    count: number
    next: string | null
    previous: string | null
    result: Result[] | []
}

export interface Option {
    id: string;
    username: string;
    role?:"ADMIN"|"USER"
}



export interface SingleRoom {
    room: {
        id: string
        name: string
        img: string
        isPublic: boolean
        adminId: string
        createdAt: Date
        updatedAt: Date | null
        deletedAt: Date | null
    },
    users: {
        id: string
        name: string
        username: string
        img: string
        email: string
        createdAt: Date
        updatedAt: Date | null,
        roomMemberships: {
            createdAt: Date | null
            userId: string
        }
    }[],
    actions:
    {
        id: string
        userId: string
        request: "INVITATION"
        roomId: string
        role: "USER"
        isBlocked: boolean
        isApproved: boolean
        createdAt: Date
        updatedAt: Date,
        user: {
            username: string
            img: string
        }
    }[],
    blockMembers: {
        id: string
        username: string
    }[]
    | [],
    oldUsers: {
        deletedAt: Date | null;
        user: {
            id: string;
            username: string;
        }
    }[]
}


export interface SendMessageDto {
    roomId: string
    senderId: string
    message: string
}


export type MessageSender = {
    id: string
    name: string
    username: string
    img: string
    email: string
    createdAt: Date
    updatedAt: Date | null
}
export type MessageResult = {
    id: string
    message: string
    createdAt: Date
    updatedAt: Date | null
    sender: MessageSender
    receiver?: MessageSender
    readMessageUser: [] |
    {
        id: string
        username: string
        img: string
    }[]
}[]

export interface RoomsMessages {
    count: number
    next: string | null
    previous: string | null
    results: MessageResult | []
    unRead: Unread[]
}


export interface EditMessageDto {
    messageId: string
    userId: string
    message: string
}

export interface DeleteMessageDto {
    messageId: string
    userId: string
}

export interface AddRoomsRequestDto {
    userId: string
    roomId: string
}[]


export interface UpdateRoomDto {
    name: string
    img: string
    isPublic: boolean
}


export interface ReadMessageDto {
    messageId: string
    userId: string
    roomId: string
}[]


export interface AcceptRequestDto {
    userId: string
    roomId: string
}


export interface AcceptInvitationDto {
    adminId: string
    userId: string
    roomId: string
}


export interface SendInvitationDto {
    userId: string
    roomId: string
    isApproved: boolean,
    role?: "ADMIN" | "USER"
}


export interface BlockMemberDto {
    userId: string
    roomId: string
    isBlocked: boolean
}

export interface RejectInvitationDto {
    adminId: string
    userId: string
    roomId: string
}


export interface LeaveGroupDto {
    userId: string
    roomId: string
}