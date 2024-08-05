import { createSlice } from "@reduxjs/toolkit"

const initialState = {

    typingArray: [
        // {
        //     chatId: "",
        //     user: {
        //         user_name: "",
        //         _id: ""
        //     }
        // }
        // {
        //     chatId: "669f850e76d2bbb1f715451d",
        //     user: {
        //         user_name: "Sagar",
        //         _id: "669f850e76d2bbb1f715451e"
        //     }
        // }
    ]
}


const typingSlice = createSlice({
    name: 'typing',
    initialState,
    reducers: {
        pushInTypingArray: (state, action) => {
            console.log({ ...action.payload })
            state.typingArray.push(action.payload)
        },
        popInTypingArray: (state, action) => {
            state.typingArray = state.typingArray.filter((item) => item.chatId + "" !== action.payload.chatId + "")
        }
    }

})
export const { pushInTypingArray, popInTypingArray } = typingSlice.actions
export default typingSlice