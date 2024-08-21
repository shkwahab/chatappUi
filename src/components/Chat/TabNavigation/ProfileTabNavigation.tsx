import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { useMutation } from '@tanstack/react-query'
import { uploadImage } from '@/apis/common.api'
import { UpdateUser } from '@/apis/user.api'
import { Auth, SingleRoom, UpdateUserDto } from '@/apis/types'
import { login } from "@/redux/slices/auth-slice"
import { FaCamera } from "react-icons/fa";
import { MdEdit } from 'react-icons/md'
import { TiTick } from 'react-icons/ti'
import { showGuideNotification, showSuccessNotification } from '@/utils/notifcation'
import { getRoomDetail } from '@/apis/rooms.api'

interface ProfileTabNavigationProps {
  room: SingleRoom
  setCurrentRoom: (room: SingleRoom) => void
}

const ProfileTabNavigation: React.FC<ProfileTabNavigationProps> = ({ room, setCurrentRoom }) => {
  const authCtx = useSelector((state: RootState) => state.authCtx)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState({
    isName: false, isEmail: false, isUserName: false
  })
  const [ProfileEdit, setProfileEdit] = useState<UpdateUserDto>({})
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>()

  const handleNameEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileEdit(prev => ({ ...prev, name: e.target.value }))
  }
  const handleUserNameEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileEdit(prev => ({ ...prev, username: e.target.value }))
  }


  const handleUploadPic = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const updateProfileMutate = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: async ({ id, updateUserDto }: { id: string, updateUserDto: UpdateUserDto }) => {
      const res = await UpdateUser(id, updateUserDto);
      return res;
    },
    onSuccess: async() => {
      if (authCtx && authCtx.user) {
        const newAuthCtx: Auth = {
          ...authCtx,
          user: {
            ...authCtx.user,
            name: ProfileEdit.name || authCtx.user.name,
            username: ProfileEdit.username || authCtx.user.username,
            email: ProfileEdit.email || authCtx.user.email,
          },
        };
        const newRoom: SingleRoom = await getRoomDetail(room.room.id)
        setCurrentRoom(newRoom)
        showSuccessNotification("Profile updated successfully")
        dispatch(login(newAuthCtx))
        setIsEditing({ isName: false, isEmail: false, isUserName: false })
      }
    },
    onError: (error) => {
      showGuideNotification("Error updating profile");
      console.error("Failed to update profile:", error);
    },
  });

  const imgMutate = useMutation({
    mutationKey: ["uploadimg"],
    mutationFn: async (file: File) => {
      const response = await uploadImage(file);
      return response;
    },
    onSuccess: async (res: { img: string }) => {
      if (!authCtx?.user?.id) return;

      const updatedUser = { ...authCtx.user, img: res.img };

      const newAuthCtx: Auth = { ...authCtx, user: updatedUser };

      // Update the room data
      const newRoom = await getRoomDetail(room.room.id)

      try {
        // Update the user profile on the server
        await updateProfileMutate.mutateAsync({ id: updatedUser.id, updateUserDto: { img: res.img } });

        // Dispatch the updated user to the global auth context
        dispatch(login(newAuthCtx));

        // Update the room with the new user data
        setCurrentRoom(newRoom);


      } catch (error) {
        console.error("Error updating profile image:", error);
      }
    },
    onError: (error) => {
      console.error("Failed to upload image:", error);
    },
  });


  useEffect(() => {
    if (selectedFile) {
      imgMutate.mutateAsync(selectedFile);
    }
  }, [selectedFile]);

  if (!authCtx) return null;

  return (
    <React.Fragment>
      <div className="relative group cursor-pointer" onClick={handleUploadPic}>
        <img
          className="w-full h-[250px] object-cover object-center group-hover:brightness-50"
          src={selectedFile ? URL.createObjectURL(selectedFile) : authCtx.user?.img}
          alt={authCtx.user?.name}
        />
        <div className="absolute top-16 left-24 z-10 hidden md:hidden group-hover:block">
          <FaCamera className="text-8xl text-white" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>


      <div className="flex flex-col p-4">
        <div className="font-normal text-lg mt-2 flex justify-between">
          <div>Name</div>
          <div onClick={() => setIsEditing({ isName: true, isEmail: false, isUserName: false })} className="cursor-pointer">
            {isEditing.isName && authCtx.user?.id ? (
              <TiTick onClick={() => updateProfileMutate.mutateAsync({ id: authCtx.user?.id as string, updateUserDto: ProfileEdit })} className="text-xl" />
            ) : (
              <MdEdit className="text-lg" />
            )}
          </div>
        </div>
        {isEditing.isName ? (
          <input type="text" className="outline-none border-2 rounded-md border-gray-600 p-2" defaultValue={authCtx.user?.name} onChange={handleNameEdit} />
        ) : (
          <div className="font-semibold">{authCtx.user?.name}</div>
        )}

        <div className="font-normal text-lg mt-2 flex justify-between">
          <div>Username</div>
          <div onClick={() => setIsEditing({ isName: false, isEmail: false, isUserName: true })} className="cursor-pointer">
            {isEditing.isUserName ? (
              <TiTick onClick={() => updateProfileMutate.mutateAsync({ id: authCtx.user?.id as string, updateUserDto: ProfileEdit })} className="text-xl" />
            ) : (
              <MdEdit className="text-lg" />
            )}
          </div>
        </div>
        {isEditing.isUserName ? (
          <input type="text" className="outline-none border-2 rounded-md border-gray-600 p-2" defaultValue={authCtx.user?.username} onChange={handleUserNameEdit} />
        ) : (
          <div className="font-semibold">{authCtx.user?.username}</div>
        )}

        <div className="font-normal text-lg mt-2">Email</div>
        <div className="font-semibold">{authCtx.user?.email}</div>
      </div>
    </React.Fragment>
  );
}

export default ProfileTabNavigation;
