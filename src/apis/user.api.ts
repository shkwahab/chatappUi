import { baseApi, GetUserUri, UpdateUserUri } from "@/apis/apiHelper"
import { UpdateUserDto } from "@/apis/types"

export const GetAllUsers = async () => {
    const res = await baseApi.get(GetUserUri)
    return res.data
}

export const UpdateUser = async (id: string, UpdateUserDto: UpdateUserDto) => {
    const res = await baseApi.patch(UpdateUserUri+id, UpdateUserDto)
    return res.data
}