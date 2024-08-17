import { toast } from "react-toastify";


export const showSuccessNotification = (message: string) => {
    toast.success(message, {
        position: "top-center"
    });
}

export const showErrorNotification = (message: string) => {
    toast.error(message, {
        position: "top-center"
    });
}

export const showGuideNotification = (message: string) => {
    toast.info(message, {
        position: "top-center"
    });
}
