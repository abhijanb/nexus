import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface TypingUser {
    userId: string;
    userName: string;
}

interface TypingState {
    typingUsers: Record<string, TypingUser[]>;
}

const initialState: TypingState = {
    typingUsers: {},
};

const typingSlice = createSlice({
    name: "typing",
    initialState,
    reducers: {
        setTyping(state, action: PayloadAction<{ key: string; userId: string; userName: string; isTyping: boolean }>) {
            const { key, userId, userName, isTyping } = action.payload;
            if (!state.typingUsers[key]) {
                state.typingUsers[key] = [];
            }
            if (isTyping) {
                if (!state.typingUsers[key].find((u) => u.userId === userId)) {
                    state.typingUsers[key].push({ userId, userName });
                }
            } else {
                state.typingUsers[key] = state.typingUsers[key].filter((u) => u.userId !== userId);
                if (state.typingUsers[key].length === 0) {
                    delete state.typingUsers[key];
                }
            }
        },
        clearTyping(state, action: PayloadAction<string>) {
            delete state.typingUsers[action.payload];
        },
    },
});

export const { setTyping, clearTyping } = typingSlice.actions;
export default typingSlice.reducer;
