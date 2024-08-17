import React, { FormEvent } from 'react'
import { SingleRoom } from '../../../apis/types'
import { useMutation } from '@tanstack/react-query'
import { deleteRoom } from '../../../apis/rooms.api'
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifcation'
import { queryClient } from '../../../App'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../redux/store'
import { clearRoom } from '../../../redux/slices/room-slice'

interface DeleteRoomProps {
  room: SingleRoom,
  onclose: () => void
}
const DeleteRoomModal: React.FC<DeleteRoomProps> = ({ room, onclose }) => {
  const dispatch = useDispatch<AppDispatch>()


  const mutate = useMutation({
    mutationKey: ["deleteRoom"],
    mutationFn: async (id: string) => {
      const res = await deleteRoom(id)
      return res
    },
    onSuccess: () => {
      showSuccessNotification("Chat Room Deleted Successfully")
      queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
      dispatch(clearRoom())
      onclose()
    },
    onError: () => {
      showErrorNotification("Failed to Delete Room")
    }
  })

  const DeleteRoom = async (e: FormEvent) => {
    try {
      e.preventDefault()
      mutate.mutateAsync(room.room.id)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <React.Fragment>
      <form onSubmit={DeleteRoom} className="p-4 w-[250px] md:w-[400px]">
        <div className='flex flex-col space-y-2'>
          <div>
            Would you like to delete the room? 
          </div>

        </div>
        <div className="flex space-x-4 items-center justify-end my-4 mt-8">
          <div className=' cursor-pointer' onClick={() => {
            onclose()
          }}>Cancel</div>
          <button type="submit" className='bg-primary text-white p-2 px-4 rounded-md'>Yes</button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default DeleteRoomModal