import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { SingleRoom, UpdateRoomDto } from '@/apis/types';
import { TbSocial } from "react-icons/tb";
import { HiUserGroup } from "react-icons/hi";
import { MdModeEditOutline } from "react-icons/md";
import { useMutation } from '@tanstack/react-query';
import { updateRoom } from '@/apis/rooms.api';
import { uploadImage } from '@/apis/common.api';
import { showSuccessNotification } from '@/utils/notifcation';
import { queryClient } from '@/App';

interface UpdateRoomProps {
  room: SingleRoom;
  onClose: () => void;
  setCurrentRoom: (room: SingleRoom) => void
}

const UpdateRoomModal: React.FC<UpdateRoomProps> = ({ onClose, room, setCurrentRoom }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleEditClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Mutation for uploading image
  const imgMutate = useMutation({
    mutationKey: ["uploadimg"],
    mutationFn: async (file: File) => {
      const response = await uploadImage(file);
      return response;
    },
    onSuccess: (res: { img: string }) => {
      setImgUrl(res.img);
    },
    onError: (error) => {
      console.error(error)
    }
  });

  // Effect to upload image when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      imgMutate.mutateAsync(selectedFile);
    }
  }, [selectedFile]);

  // Mutation for updating room
  const mutate = useMutation({
    mutationKey: ["updateroom"],
    mutationFn: async (props: { id: string; updateRoomDto: UpdateRoomDto }) => {
      const res = await updateRoom(props.id, props.updateRoomDto);
      return res;
    },

    onSuccess: (res: {
      id: string
      name: string
      img: string
      isPublic: boolean
      adminId: string
      createdAt: Date
      updatedAt: Date | null
    }) => {
      const newRoom: SingleRoom = {
        room: res,
        users: room.users,
        actions: [],
        blockMembers:room.blockMembers
      }
      setCurrentRoom(newRoom)
      showSuccessNotification("Room Updated Successfully")
      queryClient.invalidateQueries({ queryKey: ['UserRooms'] });
      queryClient.invalidateQueries({ queryKey: ["AllRooms"] });

      onClose()
    },

    onError: (error) => {
      console.log(error)
    },

  });

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    const name = formData.get("name") as string;

    if (room && room.room.id) {
      if (imgUrl) {
        const roomDto: UpdateRoomDto = {
          img: imgUrl,
          name,
          isPublic: room.room.isPublic ? true : false,
        };
        const body = {
          id: room.room.id,
          updateRoomDto: roomDto,
        };
        mutate.mutateAsync(body);

      }
    }
  };

  return (
    <React.Fragment>
      <div className="w-[250px] p-4 md:w-[600px]">
        <form onSubmit={handleFormSubmit} ref={formRef}>
          <div className='flex flex-col space-y-4'>
            <div className='flex justify-center mb-4 mt-10'>
              <div className='cursor-pointer relative'>
                {(room.room.img && room.room.img !== "") || selectedFile ? (
                  <button type="button">
                    <img
                      className='w-20 h-20 rounded-full'
                      src={selectedFile ? URL.createObjectURL(selectedFile) : room.room.img}
                      alt={room.room.name}
                    />
                  </button>
                ) : (
                  <button type="button" className="p-4 bg-gray-200 flex rounded-full">
                    {room.room.isPublic ? (
                      <TbSocial className='text-black text-5xl' />
                    ) : (
                      <HiUserGroup className='text-black text-5xl' />
                    )}
                  </button>
                )}
                <div className='absolute right-0 top-2'>
                  <MdModeEditOutline
                    className='text-xl cursor-pointer'
                    onClick={handleEditClick}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className='w-full flex flex-col space-y-2'>
              <label className='text-gray-600 font-medium mb-1' htmlFor="name">
                Name
              </label>
              <input
                type="text"
                name='name'
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none block w-full p-2.5"
                defaultValue={room.room.name}
              />
            </div>
          </div>
          <div className='flex justify-end space-x-4 my-10'>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={mutate.isPending} className='p-2 bg-primary text-white rounded'>{mutate.isPending || imgMutate.isPending ? "Saving" : "Save"}</button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
};

export default UpdateRoomModal;
