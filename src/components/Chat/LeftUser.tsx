import React, { useState, useEffect } from 'react';
import { SingleRoom } from '@/apis/types';

interface LeftUserProps {
    room: SingleRoom;
}

const LeftUser: React.FC<LeftUserProps> = ({ room }) => {
    const [leftUserIds, setLefUserIds] = useState(new Set<string>());

    useEffect(() => {
        // Update the set of left user IDs whenever the room's old users change
        setLefUserIds((prevIds) => {
            const newIds = new Set(prevIds);
            room.oldUsers.forEach((user) => {
                newIds.add(user.user.id);
            });
            return newIds;
        });
    }, [room.oldUsers]);

    return (
        <div className="flex justify-center text-white my-4">
            {room.oldUsers.map((user) => {
                if (!leftUserIds.has(user.user.id)) {
                    return null;
                }

                return (
                    <div
                        className="inline-block p-2 px-4 rounded-md bg-gray-800"
                        key={user.user.id}
                    >
                        ~ {user.user.username} has left the room
                    </div>
                );
            })}
        </div>
    );
};

export default LeftUser;
