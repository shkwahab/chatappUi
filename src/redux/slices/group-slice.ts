import { Rooms } from "@/apis/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Rooms = {
    count: 0,
    next: null,
    previous: null,
    result: []
};

const groupSlice = createSlice({
    name: "groupRooms",
    initialState,
    reducers: {
        setGroup(state: Rooms, action: PayloadAction<Rooms>) {
            const { count, next, previous, result } = action.payload;
            state.count = count
            state.next = next,
                state.previous = previous,
                state.result = result
        },
        clearGroup(state: Rooms) {
            state.count = 0;
            state.previous = null;
            state.next = null;
            state.result = [];
        }
    }
});

export const { setGroup, clearGroup } = groupSlice.actions;

export default groupSlice.reducer;
