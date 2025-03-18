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
            // console.log(action.payload)
            state.onlineUsersArray = action.payload
        },
        addOnlineUser: (state, action) => {
            const userId = action.payload + "";
            if (!state.onlineUsersArray.includes(userId)) {
                state.onlineUsersArray.push(userId);
            }
        },
        removeOnlineUser: (state, action) => {
            const userId = action.payload + "";
            state.onlineUsersArray = state.onlineUsersArray.filter(id => id + "" !== userId + "");
        }
    }

})
export const { setOnlineUsersArray, addOnlineUser, removeOnlineUser } = onlineSlice.actions
export default onlineSlice