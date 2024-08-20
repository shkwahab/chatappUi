import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { signOut } from '@/redux/slices/auth-slice';
import { HomeProps, SingleRoom, Widgets } from '@/apis/types';
import { MdOutlineChat } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { MdChatBubbleOutline } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { TbSocial } from "react-icons/tb";
import { RiLockPasswordLine } from "react-icons/ri";
import { LiaSignOutAltSolid } from "react-icons/lia";
import ChatSplashScreen from '@/components/Chat/ChatSplashScreen';
import TabNavigation from "@/components/Chat/TabNavigation"
import { AppDispatch } from '@/redux/store';
import ChatScreen from '@/components/Chat/ChatScreen';
import RoomDetailSidebar from '@/components/Chat/TabNavigation/RoomDetailSidebar';
import Popup from '@/utils/Popup';
import AddMembersModal from '@/components/Chat/TabNavigation/AddMembersModal';
import UpdateRoomModal from '@/components/Chat/TabNavigation/UpdateRoomModal';
import DeleteRoomModal from '@/components/Chat/TabNavigation/DeleteRoomModal';
import ImagePopup from '@/components/Chat/ImagePopup';
import LeaveRoom from '@/components/Chat/TabNavigation/LeaveRoom';
import LeavePopup from "@/utils/Popup"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



export const initialRoom: SingleRoom = {
  room: {
    id: "",
    name: "",
    adminId: "",
    isPublic: false,
    img: "",
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null
  },
  users: [{
    id: "",
    email: "",
    img: "",
    name: "",
    username: "",
    createdAt: new Date(),
    updatedAt: null,
    roomMemberships: {
      createdAt: null,
      userId: ""
    }
  }],
  actions: [],
  blockMembers: [{
    id: "",
    username: ""
  }],
  oldUsers: [
    {
      user: {
        id: "",
        username: ""
      },
      deletedAt: null,
    }
  ]
}
const Home: React.FC<HomeProps> = ({ user }) => {

  const [imageModalToggle, setImageModalToggle] = useState<boolean>(false)
  const [image, setImage] = useState<{
    img: string,
    alt: string
  }>({
    img: "",
    alt: ""
  })
  const [isLeaveRoom, setIsLeaveRoom] = useState<boolean>(false)
  const [profileWidgetToggle, setProfileWidgetToggle] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState(2)
  const [invitePopup, setInvitationPopup] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>()
  const [updateRoomPopup, setUpdateRoomPopup] = useState<boolean>(false)
  const [deleteRoomPopup, setDeleteRoomPopup] = useState<boolean>(false)
  const [showRoomDetailsTab, setShowRoomDetailsTab] = useState<boolean>(false)
  const [currentRoom, setCurrentRoom] = useState<SingleRoom>(initialRoom)

  const handleLeaveRoom = () => {
    setIsLeaveRoom(!isLeaveRoom)
  }

  const profileWidgets: Widgets[] = [
    {
      id: 0,
      activeTab: "GetStarted",
    },
    {
      id: 1,
      activeTab: "Profile",
      name: "Profile",
      icon: <FaRegUserCircle className=' text-gray-900  font-semibold' />
    },
    {
      id: 2,
      activeTab: "Chat",
      name: "Chats",
      icon: <MdChatBubbleOutline className=' text-gray-900  font-semibold' />
    },
    {
      id: 5,
      activeTab: "Change Password",
      name: "Change Password",
      icon: <RiLockPasswordLine className=' text-gray-900  font-semibold' />,
      url: "/auth-change-password"
    },
    {
      id: 6,
      name: "Log out",
      icon: <LiaSignOutAltSolid className=' text-gray-900  font-semibold' />,
      logout: () => { }
    },
  ]

  const navigationTabs = [
    {
      id: 1,
      name: "profile",
      icon: <FaRegUserCircle className={`${activeTab === 1 ? "text-primary" : "text-gray-400"}  md:text-3xl  text-3xl  font-semibold`} />
    },
    {
      id: 2,
      name: "chats",
      icon: <MdChatBubbleOutline className={`${activeTab === 2 ? "text-primary" : "text-gray-400"} text-3xl  md:text-3xl   font-semibold`} />
    },
    {
      id: 3,
      name: "groups",
      icon: <HiUserGroup className={`${activeTab === 3 ? "text-primary" : "text-gray-400"} md:text-3xl  text-3xl  font-semibold`} />
    },
    {
      id: 4,
      name: "channels",
      icon: <TbSocial className={` ${activeTab === 4 ? "text-primary" : "text-gray-400"} md:text-3xl  text-3xl  font-semibold`} />
    }
  ]

  const handleSelectRoom = (room: SingleRoom) => {
    setCurrentRoom(room)
  }

  return (
    <React.Fragment>
      <aside id="navigation-sidebar" className={`fixed bottom-0 md:top-0 left-0 z-[100] w-full md:w-16 md:h-screen transition-transform md:translate-x-0 ${currentRoom.room.id != "" ? "hidden md:block" : ""}`} aria-label="Sidebar">
        <div className="h-full md:flex-col justify-between relative py-4   overflow-hidden bg-gray-700">
          <ul className='flex p-4 space-x-8 md:space-x-0 md:space-y-10 md:flex-col items-center'>
            <MdOutlineChat className='text-primary text-4xl md:text-3xl mr-1 md:mr-0 font-semibold' />
            {navigationTabs.map((item) => {
              return (
                <TooltipProvider >
                  <Tooltip >
                    <TooltipTrigger>
                      <li onClick={() => setActiveTab(item.id)} className='  cursor-pointer'>
                        {item.icon}
                      </li>
                    </TooltipTrigger>
                    <TooltipContent className='absolute ml-6 bg-gray-800 text-white outline-none border-none -mt-10 md:block hidden '>
                      <p className=' capitalize' >{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              );
            })}
          </ul>

          {/* Bottom section for Profile (Mobile & Desktop) */}
          <div className="flex justify-center  md:flex-col md:-mt-12 md:items-end md:h-full   w-full">
            {/* Mobile profile image */}
            <ul className="md:hidden font-medium absolute right-10 bottom-8">
              <li className="cursor-pointer">
                <DropdownMenu>
                  <DropdownMenuTrigger className=' outline-none w-full'>
                    <img src={user?.img} alt={user?.name} className=" w-8 h-8 rounded-full mx-auto" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=' -top-48 -left-40 absolute z-[999999]'>
                    {profileWidgets.filter((widget) => widget.name).map((item) => {
                      return <DropdownMenuItem key={item.id}> <li className=' list-none cursor-pointer' onClick={() => {
                        if (item.logout) {
                          dispatch(signOut())
                        }
                        setActiveTab(item.id)
                        setProfileWidgetToggle(!profileWidgetToggle)
                      }} key={item.id}>
                        <ul className="flex  w-[180px] justify-between">
                          <li className=''>
                            {item.name}
                          </li>
                          <li>
                            {item.icon}
                          </li>
                        </ul>
                      </li>
                      </DropdownMenuItem>
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>

            {/* Desktop profile image */}
            <ul className="hidden md:block w-full relative    ">
              <li className="cursor-pointer w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger className=' outline-none w-full'>
                    <img src={user?.img} alt={user?.name} className=" w-8 h-8 rounded-full mx-auto" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=' -top-48 left-4 absolute z-[999999]'>
                    {profileWidgets.filter((widget) => widget.name).map((item) => {
                      return <DropdownMenuItem key={item.id}> <li className=' list-none cursor-pointer' onClick={() => {
                        if (item.logout) {
                          dispatch(signOut())
                        }
                        setActiveTab(item.id)
                        setProfileWidgetToggle(!profileWidgetToggle)
                      }} key={item.id}>
                        <ul className="flex  w-[180px] justify-between">
                          <li className=''>
                            {item.name}
                          </li>
                          <li>
                            {item.icon}
                          </li>
                        </ul>
                      </li>
                      </DropdownMenuItem>
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

              </li>
            </ul>
          </div>
        </div>
      </aside>


      {/* active tab */}
      <aside id="activeTab-sidebar" className="fixed top-0  w-full  md:bg-white  z-5 md:z-40 md:ml-16 md:w-80 md:h-screen " aria-label="Sidebar">
        <div className="h-full w-full  overflow-y-auto overflow-x-hidden ">
          <ul className="space-y-2  font-medium">
            <div className={`${currentRoom.room.id != "" ? "hidden md:block" : ""}`}>
              <TabNavigation room={currentRoom} setCurrentRoom={handleSelectRoom} activeTab={activeTab} />
            </div>
          </ul>
        </div>
      </aside>



      {/* chats */}
      <div className=' h-screen md:ml-[380px] overflow-hidden  bg-gray-100'>
        <React.Fragment>
          {currentRoom.room.id != "" ?
            <React.Fragment>
              <ChatScreen
                setCurrentRoom={handleSelectRoom}
                openRoomDetailTab={() => {
                  setShowRoomDetailsTab(true);
                }} room={currentRoom} />
            </React.Fragment> :
            <div className='hidden md:block'>
              <ChatSplashScreen />
            </div>
          }
        </React.Fragment>

      </div>

      <aside id="activeTab-sidebar" className={`fixed top-0 right-0 bg-white z-40  transition-transform duration-300 overflow-y-auto w-full md:w-80 h-screen transform ${showRoomDetailsTab ? "  " : "hidden "} `} aria-label="Sidebar">
        <div className="h-full w-full overflow-y-auto overflow-x-hidden ">
          <RoomDetailSidebar
            room={currentRoom}
            setLeaveRoom={handleLeaveRoom}
            setCurrentRoom={handleSelectRoom}
            onAdd={() => {
              setInvitationPopup(true)
            }}
            onUpdate={
              () => {
                setUpdateRoomPopup(true)
              }
            }
            onDelete={
              () => {
                setDeleteRoomPopup(true)
              }
            }
            onclose={() => {
              setShowRoomDetailsTab(false)
            }}
            setImage={setImage}
            setImageModalToggle={setImageModalToggle}
          />

        </div>
      </aside>
      <LeavePopup
        isOpen={isLeaveRoom}
        onClose={handleLeaveRoom}
        title="Leave Group"
      >
        <LeaveRoom
          leaveRoomDto={{
            roomId: currentRoom.room.id,
            userId: user?.id as string
          }}
          setCurrentRoom={handleSelectRoom}
          close={() => {
            setIsLeaveRoom(!isLeaveRoom)
          }}
        />
      </LeavePopup>

      <Popup children={<React.Fragment>
        <AddMembersModal
          room={currentRoom} close={() => { setInvitationPopup(false) }} />
      </React.Fragment>} title="Add Members" isOpen={invitePopup} onClose={() => {
        setInvitationPopup(false)
      }} />
      <Popup children={<React.Fragment>
        <UpdateRoomModal
          setCurrentRoom={handleSelectRoom}
          room={currentRoom} onClose={() => { setUpdateRoomPopup(false) }} />
      </React.Fragment>} title="Update Chat Room" isOpen={updateRoomPopup} onClose={() => {
        setUpdateRoomPopup(false)
      }} />
      <Popup children={<React.Fragment>
        <DeleteRoomModal
          setCurrentRoom={handleSelectRoom}
          room={currentRoom} onclose={() => { setDeleteRoomPopup(false) }} />
      </React.Fragment>} title="Delete Chat Room" isOpen={deleteRoomPopup} onClose={() => {
        setDeleteRoomPopup(false)
      }} />
      <Popup children={<ImagePopup img={image.img} alt={image.alt} />} onClose={() => {
        setImageModalToggle(false)
      }} isOpen={imageModalToggle}
      />
    </React.Fragment >
  )
}

export default Home