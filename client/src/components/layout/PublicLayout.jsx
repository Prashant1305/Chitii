import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Header from '../header/Header'
import { Grid } from '@mui/material'
import ChatList from '../chatList/ChatList'
import { sampledChats } from '../constants/sampleData'
import Profile from '../profile.jsx/Profile'

function PublicLayout() {
    const params = useParams();
    const chatId = params.chatId;
    const handleDeleteChat = (e, _id, groupChat) => {
        e.preventDefault();
        console.log("delete chat", _id, groupChat)
    }
    return (
        <>

            <Header />
            <Grid container height={"calc(100vh - 4rem)"}>
                {/* <Grid item
                    sm={4}
                    md={3}
                    sx={{
                        display: { xs: "none", sm: "block" },
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                        border: "2px solid white"
                    }} height={"100%"} >
                    <ChatList
                        chats={sampledChats}
                        chatId={chatId}
                        newMessagesAlert={[{
                            chatId,
                            count: 4
                        }]}
                        handleDeleteChat={handleDeleteChat}
                        onlineUsers={["1", "2"]} />
                </Grid>

                <Grid item
                    xs={12}
                    sm={8}
                    md={5}
                    lg={6}
                    height={"100%"}
                    sx={{
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    }} >
                    <Outlet />
                </Grid> */}
                {/*  edited */}
                <Grid item
                    xs={12}
                    sm={12}
                    md={8}
                    lg={9}
                    height={"100%"}
                    sx={{
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    }} >
                    <Outlet />
                </Grid>

                <Grid item md={4} lg={3} sx={{
                    display: { xs: "none", md: "block" },
                    padding: "2rem",
                    bgcolor: "rgba(0,0,0,0.85)"
                }} height={"100%"} >
                    <Profile />
                </Grid>
            </Grid>

        </>

    )
}

export default PublicLayout