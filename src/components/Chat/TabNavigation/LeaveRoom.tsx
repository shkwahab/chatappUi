import { leaveRoom } from '@/apis/rooms.api'
import { LeaveGroupDto, SingleRoom } from '@/apis/types'
import { queryClient } from '@/App'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { initialRoom } from '@/components/Chat/Home'

interface LeaveRoomProps {
    leaveRoomDto: LeaveGroupDto
    setCurrentRoom: (room: SingleRoom) => void
    close: () => void
}
const LeaveRoom: React.FC<LeaveRoomProps> = ({ leaveRoomDto, setCurrentRoom, close }) => {
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