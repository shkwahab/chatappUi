import React from 'react'
import ProfileTabNavigation from './ProfileTabNavigation'
import ChatTabNavigation from './ChatTabNavigation'
import GroupsRoomTab from './GroupsRoomTab'
import ChannelRoomTab from './ChannelRomTab'

interface ActiveTabInfo {
    activeTab: number
}

const index: React.FC<ActiveTabInfo> = ({ activeTab }) => {

    switch (activeTab) {
        case 1:
            return (
                <React.Fragment>
                    <ProfileTabNavigation />
                </React.Fragment>
            )
        case 2:
            return (
                <React.Fragment>
                    <ChatTabNavigation />
                </React.Fragment>
            )
        case 3:
            return (
                <React.Fragment>
                    <GroupsRoomTab />
                </React.Fragment>
            )
        case 4:
            return (
                <React.Fragment>
                    <ChannelRoomTab/>
                </React.Fragment>
            )
       

        default:
            break;
    }


}

export default index