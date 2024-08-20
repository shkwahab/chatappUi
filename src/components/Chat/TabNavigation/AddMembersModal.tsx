import React, { FormEvent, useEffect, useState } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GetAllUsers } from '@/apis/user.api';
import { AddRoomsRequestDto, Option, SingleRoom, User } from '@/apis/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { showGuideNotification, showSuccessNotification } from '@/utils/notifcation';
import { adMemberRequest } from '@/apis/rooms.api';


interface Modal {
    close: () => void,
    room: SingleRoom
}
const AddMembersModal: React.FC<Modal> = ({ close, room }) => {
    const authCtx = useSelector((state: RootState) => state.authCtx)
    const myUser = authCtx.user
    const [options, setOptions] = useState<Option[]>([
        { username: 'Option 1', id: "1" }
    ]);
    const { data: members, isError, error } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: GetAllUsers
    })
    if (isError) {
        console.log(error)
    }
    useEffect(() => {
        if (members && members.length > 0 && myUser) {
            const newOptions = members
            .filter((user) => !room.users.map((item) => item.id).includes(user.id))
            .map((item) => ({
              id: item.id,
              username: item.username,
            }));          
            setOptions(newOptions);
        }
    }, [members]);

    const [selectedValue, setSelectedValue] = useState<Option[]>([]);
    const onSelect = (selectedList: Option[]) => {
        setSelectedValue(selectedList);
    };

    const onRemove = (selectedList: Option[]) => {
        setSelectedValue(selectedList);
    };

    const mutate = useMutation({
        mutationKey: ["sendRequest"],
        mutationFn: adMemberRequest,
        onSuccess: () => {
            showSuccessNotification("Request Sent Successfully")
            close()
        },
        onError: () => {
            showGuideNotification("Invitation Already Send")
            close()
        }
    })
    const handleFormSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            const sendRequest: AddRoomsRequestDto[] = selectedValue.map((member) => ({
                userId: member.id,
                roomId: room.room.id
            }));
            mutate.mutateAsync(sendRequest)
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <React.Fragment>
            <form onSubmit={handleFormSubmit} className=" flex flex-col space-y-4   p-10 py-4 pb-10 w-[250px] md:w-[600px]">
                <div>
                    <div className='my-2'>Members</div>
                    <Multiselect
                        id='members'
                        placeholder='Select Members'
                        options={options}
                        selectedValues={selectedValue}
                        onSelect={onSelect}
                        onRemove={onRemove}
                        displayValue="username"
                    />
                </div>
                <div className=' flex items-center space-x-4 justify-end'>
                    <div className=' cursor-pointer' onClick={close}>
                        Close
                    </div>
                    <button type="submit" className='bg-primary text-sm sm:text-base p-2 rounded-md text-white md:px-4'>
                        Send Invitation
                    </button>
                </div>
            </form>
        </React.Fragment>
    )
}

export default AddMembersModal