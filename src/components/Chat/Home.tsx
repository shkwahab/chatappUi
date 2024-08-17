import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../../redux/slices/auth-slice';
import { HomeProps, SingleRoom, Widgets } from '../../apis/types';
import { MdOutlineChat } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { MdChatBubbleOutline } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { TbSocial } from "react-icons/tb";
import { RiLockPasswordLine } from "react-icons/ri";
import { LiaSignOutAltSolid } from "react-icons/lia";
import ChatSplashScreen from './ChatSplashScreen';
import TabNavigation from "./TabNavigation"
import { AppDispatch, RootState } from '../../redux/store';
import ChatScreen from './ChatScreen';
import RoomDetailSidebar from './TabNavigation/RoomDetailSidebar';
import Popup from '../../utils/Popup';
import AddMembersModal from './TabNavigation/AddMembersModal';
import UpdateRoomModal from './TabNavigation/UpdateRoomModal';
import DeleteRoomModal from './TabNavigation/DeleteRoomModal';
import ImagePopup from './ImagePopup';

const Home: React.FC<HomeProps> = ({ user }) => {
  const [activeInfoTab, setActiveInfoTab] = useState(0)
  const [imageModalToggle, setImageModalToggle] = useState<boolean>(false)
  const [image, setImage] = useState<{
    img: string,
    alt: string
  }>({
    img: "",
    alt: ""
  })
  const [profileWidgetToggle, setProfileWidgetToggle] = useState<boolean>(false)
  const [activeTabInfo, setActiveTabInfo] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState(2)
  const [invitePopup, setInvitationPopup] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>()
  const [updateRoomPopup, setUpdateRoomPopup] = useState<boolean>(false)
  const [deleteRoomPopup, setDeleteRoomPopup] = useState<boolean>(false)
  const [showRoomDetailsTab, setShowRoomDetailsTab] = useState<boolean>(false)
  const room: SingleRoom = useSelector((state: RootState) => state.room)

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

  const tabsInfo = [
    {
      id: 1,
      name: "profile"
    },
    {
      id: 2,
      name: "chats"
    },
    {
      id: 3,
      name: "groups"
    },
    {
      id: 4,
      name: "channels"
    },

  ]

  const navigationTabs = [
    {
      id: 1,
      name: "profile",
      icon: <FaRegUserCircle className={`${activeTab === 1 ? "text-primary" : "text-gray-400"}  md:text-3xl  text-2xl  font-semibold`} />
    },
    {
      id: 2,
      name: "chats",
      icon: <MdChatBubbleOutline className={`${activeTab === 2 ? "text-primary" : "text-gray-400"} text-2xl  md:text-3xl   font-semibold`} />
    },
    {
      id: 3,
      name: "groups",
      icon: <HiUserGroup className={`${activeTab === 3 ? "text-primary" : "text-gray-400"} md:text-3xl  text-2xl  font-semibold`} />
    },
    {
      id: 4,
      name: "channels",
      icon: <TbSocial className={` ${activeTab === 4 ? "text-primary" : "text-gray-400"} md:text-3xl  text-2xl  font-semibold`} />
    }
  ]


  const handleProfileToggle = () => {
    setProfileWidgetToggle(!profileWidgetToggle)
  }

  return (
    <React.Fragment>
      <aside id="navigation-sidebar" className={`fixed bottom-0 md:top-0 left-0 z-10 w-full md:w-16 md:h-screen transition-transform md:translate-x-0 ${room.room.id != "" ? "hidden md:block" : ""}`} aria-label="Sidebar">
        <div className="h-full relative py-4 overflow-hidden bg-gray-700">
          <ul className='flex p-4 space-x-8 md:space-x-0 md:space-y-10 md:flex-col items-center'>
            <MdOutlineChat className='text-primary text-3xl md:text-3xl font-semibold' />
            {navigationTabs.map((item) => {
              return (
                <li onClick={() => setActiveTab(item.id)} className="relative cursor-pointer" onMouseOver={() => {
                  setActiveInfoTab(item.id);
                  setActiveTabInfo(true);
                }} onMouseLeave={() => {
                  setActiveInfoTab(0);
                  setActiveTabInfo(false);
                }} key={item.id}>
                  <p>{item.icon}</p>
                  <div className={`absolute hidden -right-6 w-1 top-0 h-8 bg-primary ${item.id === activeTab ? "md:block" : "md:hidden"}`} />
                </li>
              );
            })}
          </ul>

          {/* For Mobile */}
          <ul className="md:hidden font-medium absolute right-10 bottom-4">
            <li onClick={handleProfileToggle} className="cursor-pointer">
              <img src={user?.img} alt={user?.name} className="w-8 h-8 rounded-full" />
            </li>
          </ul>

          {/* For Desktop */}
          <ul className="hidden md:flex font-medium justify-center">
            <li onClick={handleProfileToggle} className="cursor-pointer absolute bottom-4 w-full text-center">
              <img src={user?.img} alt={user?.name} className="w-8 h-8 rounded-full mx-auto" />
            </li>
          </ul>
        </div>
      </aside>


      {/* active tab */}
      <aside id="activeTab-sidebar" className="fixed top-0  w-full  md:bg-white  z-5 md:z-40 md:ml-16 md:w-80 md:h-screen " aria-label="Sidebar">
        <div className="h-full w-full  overflow-y-auto overflow-x-hidden ">
          <ul className="space-y-2  font-medium">
            <div className={`${room.room.id != "" ? "hidden md:block" : ""}`}>
              <TabNavigation activeTab={activeTab} />
            </div>
          </ul>
        </div>
      </aside>



      {/* chats */}
      <div className=' h-screen md:ml-[380px] bg-gray-100'>
        <React.Fragment>
          {room.room.id != "" ?
            <React.Fragment>
              <ChatScreen openRoomDetailTab={() => {
                setShowRoomDetailsTab(true);
              }} room={room} />
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


      {/* navigation guide icons widgets */}
      {activeTabInfo &&
        <div className=' hidden md:fixed md:top-[70px] md:left-8 z-[100] md:block  md:h-screen'>
          <div className="flex  space-x-4 md:flex-col md:space-y-8 items-center">
            {tabsInfo.map((item) => {
              return <div key={item.id} className={`relative pr-3 bg-black text-sm text-white p-2 rounded-md ${activeInfoTab == item.id ? "" : "invisible"}`}>
                <p className='capitalize'>{item.name}</p>
                <div className='absolute -left-[18px] top-2 -z-10' style={{
                  width: "0",
                  height: "0",
                  borderTop: "10px solid transparent",
                  borderRight: "20px solid #000",
                  borderBottom: "10px solid transparent",
                  borderLeft: "10px solid transparent"
                }}></div>
              </div>
            })}



          </div>

        </div>
      }
      {/* profile widget */}
      {

        profileWidgetToggle &&
        <ul className='  pr-8  flex flex-col space-y-2   bg-gray-50 shadow-md rounded-md absolute p-4 bottom-20 md:bottom-14 md:right-auto right-4 md:left-4 z-[99999]  ' id="profileWidget">
          {profileWidgets.filter((widget) => widget.name).map((item) => {
            return <li className=' cursor-pointer' onClick={() => {
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
          })}
        </ul>

      }

      <Popup children={<React.Fragment>
        <AddMembersModal roomId={room.room.id} close={() => { setInvitationPopup(false) }} />
      </React.Fragment>} title="Add Members" isOpen={invitePopup} onClose={() => {
        setInvitationPopup(false)
      }} />
      <Popup children={<React.Fragment>
        <UpdateRoomModal room={room} onClose={() => { setUpdateRoomPopup(false) }} />
      </React.Fragment>} title="Update Chat Room" isOpen={updateRoomPopup} onClose={() => {
        setUpdateRoomPopup(false)
      }} />
      <Popup children={<React.Fragment>
        <DeleteRoomModal room={room} onclose={() => { setDeleteRoomPopup(false) }} />
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