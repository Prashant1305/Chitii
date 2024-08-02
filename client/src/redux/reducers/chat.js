import { createSlice } from "@reduxjs/toolkit"
import { toast } from "react-toastify"

const initialState = {
    notificationCount: 0,
    newMessageAlert: [
        // {
        //     chatId: "",
        //     count: 0,
        // messageData:[{data1},{data2}]
        // }
    ]
}


const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        incrementNotificationCount: (state) => {
            state.notificationCount += 1
        },
        resetNotificationCount: (state) => {
            state.notificationCount = 0
        },

        setNewMessagesAlert: (state, action) => {
            const index = state.newMessageAlert.findIndex((item) => item.chatId === action.payload.conversation)
            // console.log(action)
            if (index !== -1) {
                state.newMessageAlert[index].count += 1;
                state.newMessageAlert[index].messageData.push(action.payload);
            }
            else {
                state.newMessageAlert.push({
                    chatId: action.payload.conversation,
                    count: 1,
                    messageData: [action.payload]
                })
            }
        },

        popMessageAlert: (state, action) => {
            const index = state.newMessageAlert.findIndex((item) => item.chatId === action.payload)
            if (index === -1) {
                // toast.error("chatId not found in notification")
            }
            else {
                state.newMessageAlert.splice(index, 1) // Remove 1 element at index 
            }
        }
    }

})
export const { incrementNotificationCount, resetNotificationCount, setNewMessagesAlert, popMessageAlert } = chatSlice.actions
export default chatSlice