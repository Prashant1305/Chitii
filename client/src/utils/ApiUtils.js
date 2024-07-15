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