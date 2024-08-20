import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/Auth";
import chatSlice from "./reducers/chat";
import typingSlice from "./reducers/typing";
import onlineSlice from "./reducers/online";

const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [chatSlice.name]: chatSlice.reducer,
        [typingSlice.name]: typingSlice.reducer,
        [onlineSlice.name]: onlineSlice.reducer
    }
});

export default store