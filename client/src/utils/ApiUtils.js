import axios from "axios";

const url = "http://localhost:3030/api/auth/login";

export const check = async () => {
    const res = await axios.get(url);
    return res;
}