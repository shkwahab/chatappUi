import { baseApi, GetUserUri, LoginUri, RegisterUri } from "@/apis//apiHelper"
import { CreateUserDto, login } from "@/apis/types"


export const loginFunc = async (body: login) => {
    const res = await baseApi.post(LoginUri, body)
    return res.data;
}
export const getUser = async (id:string) => {
    const res = await baseApi.get(GetUserUri+"/"+id)
    return res.data;
}
export const registerUser = async (body: CreateUserDto) => {
    const res = await baseApi.post(RegisterUri, body)
    return res.data
}