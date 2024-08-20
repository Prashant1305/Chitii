import { createSlice } from "@reduxjs/toolkit"

const initialState = {

    onlineUsersArray: [
        //     userId in string format
    ]
}


const onlineSlice = createSlice({
    name: 'onlineUsersArray',
    initialState,
    reducers: {
        setOnlineUsersArray: (state, action) => {
            console.log(action.payload)
            state.onlineUsersArray = action.payload
        },
    }

})
export const { setOnlineUsersArray } = onlineSlice.actions
export default onlineSlice