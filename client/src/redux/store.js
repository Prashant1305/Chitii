import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/Auth";
import chatSlice from "./reducers/chat";

const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [chatSlice.name]: chatSlice.reducer

    }
});

export default store