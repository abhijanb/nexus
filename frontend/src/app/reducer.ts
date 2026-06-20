import { baseApi } from "./baseApi";
import authReducer from "../features/auth/authSlice";
import presenceReducer from "../features/presence/presenceSlice";
import typingReducer from "../features/typing/typingSlice";
import themeReducer from "./themeSlice";

export const reducer = {
    auth: authReducer,
    presence: presenceReducer,
    typing: typingReducer,
    theme: themeReducer,
    [baseApi.reducerPath]: baseApi.reducer,
};
