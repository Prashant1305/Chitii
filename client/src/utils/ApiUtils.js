import axios from "axios";
import { baseUrl } from "../Constant";

export const signup_api = async (data) => {
    const url = `${baseUrl}/api/auth/signup`;
    const res = await axios.post(url, data, {
        headers: {
            "Content-Type": "application/json",
        }
    })
    return res;
}

export const login_api = async (data) => {
    const url = `${baseUrl}/api/auth/login`;
    console.log(data);
    const res = await axios.post(url, data, {
        headers: {
            "Content-Type": "application/json",
        }
    })
    return res;
}