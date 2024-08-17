import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SingleRoom } from "../../apis/types";

// Define initial state with a default value
const initialState: SingleRoom = {
    room: {
        id: "",
        name: "",
        adminId: "",
        isPublic:false,
        img: "",
        createdAt: new Date(),
        updatedAt: null,
    },
    users: [{
        id: "",
        email: "",
        img: "",
        name: "",
        username: "",
        createdAt: new Date(),
        updatedAt: null
    }],
    actions:[]
};

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        handleSelectRoom(state, action: PayloadAction<SingleRoom>) {
            // Update state directly
            return action.payload;
        },
        clearRoom(state) {
            // Clear room data if needed
            return initialState;
        }
    }
});

export const { handleSelectRoom, clearRoom } = roomSlice.actions;

export default roomSlice.reducer;
