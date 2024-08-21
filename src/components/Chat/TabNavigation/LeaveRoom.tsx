import { leaveRoom } from '@/apis/rooms.api'
import { LeaveGroupDto, SingleRoom } from '@/apis/types'
import { queryClient } from '@/App'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { initialRoom } from '@/components/Chat/Home'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { io } from 'socket.io-client'
import { SOCKET_BASE_URL, SOCKET_ROOM_PATH } from '@/apis/apiHelper'

interface LeaveRoomProps {
    leaveRoomDto: LeaveGroupDto
    setCurrentRoom: (room: SingleRoom) => void
    close: () => void
}
const LeaveRoom: React.FC<LeaveRoomProps> = ({ leaveRoomDto, setCurrentRoom, close }) => {
    const authCtx=useSelector((state:RootState)=>state.authCtx)
    const leaveRoomMutate = useMutation({
        mutationKey: ["leaveRoom"],
        mutationFn: leaveRoom,
        onSuccess: () => {
            setCurrentRoom(initialRoom)
            queryClient.invalidateQueries({ queryKey: ["AllRooms"] })
            queryClient.invalidateQueries({ queryKey: ["UserRooms"] })

        },
        onError: (error) => {
            console.error(error)
        }
    })

    const leaveRoomCallback = () => {
        close()
        leaveRoomMutate.mutateAsync(leaveRoomDto)
    }

    useEffect(() => {
        if (authCtx?.token) {
            const socket = io(SOCKET_BASE_URL + SOCKET_ROOM_PATH, {
                extraHeaders: {
                    Authorization: `Bearer ${authCtx?.token as string}`
                }
            })
            socket.connect()
            socket.on('leaveRoom', () => {
                queryClient.invalidateQueries({ queryKey: ["RoomMessages"] })
                queryClient.invalidateQueries({ queryKey: ["RoomMessages",leaveRoomDto.roomId] })
            });
        }
    }, [authCtx])
    return (
        <React.Fragment>
            <div className=' p-4 w-[250px] md:w-[600px] '>
                <div className=''>
                    Are you sure you like to leave room?
                </div>
                <div className="flex flex-col  mb-4 my-4 items-center ">

                    <div onClick={leaveRoomCallback} className=' p-2 px-4  cursor-pointer font-medium rounded-md text-lg text-white bg-red-500'>
                        Yes
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default LeaveRoom