import React from 'react'
import ProfileTabNavigation from '@/components/Chat/TabNavigation/ProfileTabNavigation'
import ChatTabNavigation from '@/components/Chat/TabNavigation/ChatTabNavigation'
import GroupsRoomTab from '@/components/Chat/TabNavigation/GroupsRoomTab'
import ChannelRoomTab from '@/components/Chat/TabNavigation/ChannelRomTab'
import { SingleRoom } from '@/apis/types'

interface ActiveTabInfo {
    activeTab: number
    room: SingleRoom
    setCurrentRoom: (room: SingleRoom) => void
}

const index: React.FC<ActiveTabInfo> = ({ activeTab, setCurrentRoom, room }) => {

    switch (activeTab) {
        case 1:
            return (
                <React.Fragment>
                    <ProfileTabNavigation  />
                </React.Fragment>
            )
        case 2:
            return (
                <React.Fragment>
                    <ChatTabNavigation room={room} setCurrentRoom={setCurrentRoom} />
                </React.Fragment>
            )
        case 3:
            return (
                <React.Fragment>
                    <GroupsRoomTab room={room} setCurrentRoom={setCurrentRoom} />
                </React.Fragment>
            )
        case 4:
            return (
                <React.Fragment>
                    <ChannelRoomTab room={room} setCurrentRoom={setCurrentRoom} />
                </React.Fragment>
            )


        default:
            break;
    }


}

export default index