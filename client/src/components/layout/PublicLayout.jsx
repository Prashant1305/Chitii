import { Backdrop, Grid } from '@mui/material'
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSocketEvent } from '../../hooks/socket_hooks'
import { incrementNotificationCount, setNewMessagesAlert } from '../../redux/reducers/chat'
import { CALL_INCOMING, CHAT_JOINED, CHAT_LEFT, NEW_MESSAGE, NEW_REQUEST, ONLINE_USERS } from '../constants/events'
import Header from '../header/Header'
import Profile from '../profile.jsx/Profile'
import { MyToggleUiValues } from '../../context/ToggleUi'
import { setOnlineUsersArray } from '../../redux/reducers/online'
import IncomingCallDialog from '../Dialogs/call/IncomingCallDialog'
import { GetSocket } from '../../context/SocketConnectContext'
const Search = lazy(() => import("../Dialogs/call/IncomingCallDialog"));


function PublicLayout() {
    const socket = GetSocket();
    const dispatch = useDispatch();
    const { uiState, setUiState } = MyToggleUiValues()
    const [incomingCallUserData, setIncomingCallUserData] = useState({});

    const { user } = useSelector(state => state.auth);


    const newMessageHandler = useCallback((data) => {
        dispatch(setNewMessagesAlert(data));

    }, []);

    const newRequestHandler = useCallback((data) => {
        toast.info(data.msg)
        dispatch(incrementNotificationCount())
    }, []);


    const onlineListner = useCallback((data) => {
        dispatch(setOnlineUsersArray(data.users))

    }, [])

    const callIncomingHandler = useCallback((data) => { // data={user:{username,avatar_url,_id:userId of sender},roomId}
        console.log(data)
        console.log("callIcoming")
        setIncomingCallUserData(data);
        setUiState({ ...uiState, isIncomingCallDialogOpen: true })
    }, []);

    const eventHandlers = {
        [NEW_MESSAGE]: newMessageHandler,
        [NEW_REQUEST]: newRequestHandler,
        [ONLINE_USERS]: onlineListner,
        [CALL_INCOMING]: callIncomingHandler
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
                    lg={uiState.isProfileSectionOn ? 9 : 12}
                    height={"100%"}
                    sx={{
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    }} >
                    <Outlet />
                </Grid>

                <Grid item md={4} lg={uiState.isProfileSectionOn ? 3 : 0} sx={{
                    display: { xs: "none", md: "block", lg: uiState.isProfileSectionOn },
                    padding: "2rem",
                    bgcolor: "rgba(0,0,0,0.85)"
                }} height={"100%"} >
                    <Profile />
                </Grid>
            </Grid>
            {
                uiState?.isIncomingCallDialogOpen && <Suspense fallback={<Backdrop open />}><IncomingCallDialog incomingCallUserData={incomingCallUserData} /></Suspense>
            }

        </>

    )
}

export default PublicLayout