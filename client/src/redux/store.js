import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/Auth";

const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,

    }
});

export default store