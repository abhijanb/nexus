import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface PresenceState {
    onlineUserIds: string[];
}

const initialState: PresenceState = {
    onlineUserIds: [],
};

const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        userOnline(state, action: PayloadAction<string>) {
            if (!state.onlineUserIds.includes(action.payload)) {
                state.onlineUserIds.push(action.payload);
            }
        },
        userOffline(state, action: PayloadAction<string>) {
            state.onlineUserIds = state.onlineUserIds.filter((id) => id !== action.payload);
        },
        setOnlineUsers(state, action: PayloadAction<string[]>) {
            state.onlineUserIds = action.payload;
        },
    },
});

export const { userOnline, userOffline, setOnlineUsers } = presenceSlice.actions;
export default presenceSlice.reducer;
