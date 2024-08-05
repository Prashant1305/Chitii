import { Grid } from '@mui/material'
import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSocketEvent } from '../../hooks/socket_hooks'
import { incrementNotificationCount, setNewMessagesAlert } from '../../redux/reducers/chat'
import { GetSocket } from '../../utils/Socket'
import { CHAT_JOINED, CHAT_LEFT, NEW_MESSAGE, NEW_REQUEST } from '../constants/events'
import Header from '../header/Header'
import Profile from '../profile.jsx/Profile'

function PublicLayout() {
    const socket = GetSocket();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);

    const newMessageHandler = useCallback((data) => {
        dispatch(setNewMessagesAlert(data));

    }, []);

    const newRequestHandler = useCallback((data) => {
        toast.info(data.msg)
        dispatch(incrementNotificationCount())
    }, []);

    const eventHandlers = {
        [NEW_MESSAGE]: newMessageHandler,
        [NEW_REQUEST]: newRequestHandler
    }
    useSocketEvent(socket, eventHandlers);

    useEffect(() => {
        if (user) {
            socket.emit(CHAT_JOINED, {})
        } else {
            socket.emit(CHAT_LEFT, {})
        }
        return (() => {
            // if user leaves public section of application, then he will be offline
            socket.emit(CHAT_LEFT, {});
        })
    }, [user])

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