import React, { FormEvent, useEffect, useState, useRef } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GetAllUsers } from '../../../apis/user.api';
import { CreateRoomDto, Option, User } from '../../../apis/types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { createRoom } from '../../../apis/rooms.api';
import { showErrorNotification } from '../../../utils/notifcation';
import { queryClient } from '../../../App';


interface Modal {
    close: () => void
}
const AddRoomModal: React.FC<Modal> = ({ close }) => {
    const formRef = useRef<HTMLFormElement>(null);
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
            const newOptions = members.filter((user) => user.id != myUser.id).map((item) => ({
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
        mutationKey: ["UserRooms"],
        mutationFn: createRoom,
        onSuccess: () => {
            if (formRef.current) {
                formRef.current.reset();
            }
            queryClient.invalidateQueries({ queryKey: ['UserRooms'] })
            close()
        },
        onError: () => {
            showErrorNotification("Failed to create chat room")
        }
    })
    const handleFormSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            const form = formRef.current;
            if (form && myUser) {
                const formData = new FormData(form);
                const type = formData.get("type") as string;
                const name = formData.get("name") as string;
            if (type === "") {
                    showErrorNotification("Type of Chat is Required")
                    throw new Error("Fields required")
                }
                const membersIds = selectedValue.map((member) => ({
                    userId: member.id,
                }));
                const data = {
                    type,
                    name,
                    members: membersIds,
                };
                console.log(data)

                const body: CreateRoomDto = {
                    room: {
                        name: data.name,
                        isPublic: type === "group" ? false : true,
                        adminId: myUser.id,
                    },
                    members: membersIds
                }
                mutate.mutateAsync(body)
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <React.Fragment>
            <form ref={formRef} onSubmit={handleFormSubmit} className=" flex flex-col space-y-4    p-10 py-4 pb-10 w-[300px] md:w-[600px]">
                <div>
                    <div className='my-2'>Type</div>
                    <select required id="type" name='type' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                        <option value="" selected>Choose Chat Room Type</option>
                        <option value="group">Group</option>
                        <option value="channel">Channel</option>
                    </select>
                </div>
                <div>
                    <div className='my-2'>Name</div>
                    <input type="text" id="name" name='name' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 " placeholder="Room Name" required />
                </div>
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
                    <button type="submit" className='bg-primary p-2 rounded-md text-white px-4'>
                        Submit
                    </button>
                </div>
            </form>
        </React.Fragment>
    )
}

export default AddRoomModal