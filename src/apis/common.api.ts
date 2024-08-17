import { baseApi, UploadImageUri } from "./apiHelper"

export const uploadImage = async (img: File) => {
    const formData = new FormData();
    formData.append('file', img); 
    const res = await baseApi.post(UploadImageUri, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return res.data
}