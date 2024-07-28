import axios from "axios";
import { baseUrl } from "../Constant";

export const signup_api = async (form_data) => {
    const url = `${baseUrl}/api/auth/signup`;
    const res = await axios.post(url, form_data, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return res;
}



export const fetch_user_data = async () => {
    const url = `${baseUrl}/api/user/getmyprofile`;
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const login_api = async ({ emailOrUsername, password }) => {
    const url = `${baseUrl}/api/auth/login`;
    const res = await axios.post(url,
        { emailOrUsername, password },
        {
            withCredentials: true, // for sending cookies , HTTP authentication, and client-side SSL certificates
            headers: {
                "Content-Type": "application/json",
            }
        }
    );
    return res
}

export const logout = async () => {
    const url = `${baseUrl}/api/auth/logout`;
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const get_my_chats = async () => {
    const url = `${baseUrl}/api/chat/getmychats`;
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const search_user = async (anyName) => {
    if (!anyName) {
        anyName = "";
    }
    const url = `${baseUrl}/api/user/search?name=${anyName}`;
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const send_friend_request = async (id) => {
    const url = `${baseUrl}/api/user/sendfriendrequest`
    const res = await axios.put(url, { userId: id }, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        }
    });
    return res;
}

export const my_notification = async () => {
    const url = `${baseUrl}/api/user/getallnotification`
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const accept_friend_request = async (data) => {
    console.log(data)
    const url = `${baseUrl}/api/user/acceptfriendrequest`
    const res = await axios.delete(url, {
        data,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        }
    }
    );
    return res;
}

export const all_messages_of_chat = async (chatId, page) => {
    const url = page ? `${baseUrl}/api/chat/getmessages/${chatId}?page=${page}` : `${baseUrl}/api/chat/getmessages/${chatId}`;
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const chat_details = async (chatId, populate) => {
    const url = populate ? `${baseUrl}/api/chat/${chatId}?populate=true` : `${baseUrl}/api/chat/${chatId}`;
    const res = await axios.get(url, { withCredentials: true });
    return res;

}

export const send_message_api = async (form_data) => {
    const url = `${baseUrl}/api/chat/sendmessage`
    const res = await axios.post(url, form_data, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return res;
}

export const get_my_friends_api = async (chatId) => {
    const url = chatId ? `${baseUrl}/api/user/getmyfriends?conversationId=${chatId}` : `${baseUrl}/api/user/getmyfriends`;
    const res = await axios.get(url, { withCredentials: true });
    return res;
}

export const new_group_chat_api = async (data) => {
    const url = `${baseUrl}/api/chat/newgroupchat`
    const res = await axios.post(url, data, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        }
    });
    return res;
}