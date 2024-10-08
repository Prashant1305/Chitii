import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: `${server}` }),
    tagTypes: ["Chat"],

    endpoints: (builder) => ({
        myChats: builder.query({
            query: () => ({
                url: "/chat/myChats",
                method: "GET",
                credentials: "include"
            }),
            providesTags: ["Chat"],
        })
    })
})

export default api;
export const { useMyChatsQuery } = api