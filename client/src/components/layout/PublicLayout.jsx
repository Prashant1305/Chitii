import { Backdrop, Grid } from '@mui/material'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GetSocket } from '../../context/SocketConnectContext'
import { MyToggleUiValues } from '../../context/ToggleUi'
import { useSocketEvent } from '../../hooks/socket_hooks'
import { incrementNotificationCount } from '../../redux/reducers/chat'
import { addOnlineUser, removeOnlineUser, setOnlineUsersArray } from '../../redux/reducers/online'
import { get_online_friends_api } from '../../utils/ApiUtils'
import { CALL_INCOMING, RINGING, NEW_FRIEND_REQUEST, NEW_MESSAGE, UPDATE_ONLINE_STATUS } from '../constants/events'
import IncomingCallDialog from '../Dialogs/call/IncomingCallDialog'
import Header from '../header/Header'
import Profile from '../profile.jsx/Profile'

function PublicLayout() {
    const socket = GetSocket();
    const dispatch = useDispatch();
    const { uiState, setUiState } = MyToggleUiValues()
    const [incomingCallUserData, setIncomingCallUserData] = useState({});

    const { user } = useSelector(state => state.auth);


    const newMessageHandler = useCallback((data) => {
        dispatch(incrementNotificationCount());
    }, []);

    const newRequestHandler = useCallback((data) => {
        toast.info(data.msg)
        dispatch(incrementNotificationCount())
    }, []);


    const onlineListner = useCallback((data) => {
        //  data = { user_online_status: true, user: { _id: "phalanaDhimka" } } 
        // console.log({ data })

        if (data?.user_online_status === "ONLINE") {
            dispatch(addOnlineUser(data.user));
        } else {
            dispatch(removeOnlineUser(data.user))
        }

    }, [])

    const callIncomingHandler = useCallback((data) => { // data={user:{username,avatar_url,_id:userId of sender},roomId}
        console.log(data)
        console.log("callIcoming")
        setIncomingCallUserData(data);

        setUiState(prev => ({ ...prev, isIncomingCallDialogOpen: true }));
        socket.emit(RINGING, { to: data.user._id, status: "RECEIVED" });
    }, []);

    const eventHandlers = {
        [NEW_MESSAGE]: newMessageHandler,
        [NEW_FRIEND_REQUEST]: newRequestHandler,
        [UPDATE_ONLINE_STATUS]: onlineListner,
        [CALL_INCOMING]: callIncomingHandler
    }
    useSocketEvent(socket, eventHandlers);

    useEffect(() => {
        const fetchOnlineUsersId = async () => {
            try {
                const res = await get_online_friends_api();
                if (res.status === 200) {
                    dispatch(setOnlineUsersArray(res.data.message));
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (user && user?.preferred_online_status === "ONLINE") {
            socket.emit(UPDATE_ONLINE_STATUS, { user_online_status: "ONLINE" });
            fetchOnlineUsersId();
        }
        return (() => {
            // if user leaves public section of application, then he will be offline
            socket.emit(UPDATE_ONLINE_STATUS, { user_online_status: "OFFLINE" })
        })
    }, [user])

    return (
        <>
            <Header />
            <Grid container height={"calc(100vh - 4rem)"}>
                <Grid item
                    xs={12}
                    sm={12}
                    md={uiState.isProfileSectionOn ? 8 : 12}
                    lg={uiState.isProfileSectionOn ? 9 : 12}
                    height={"100%"}
                    sx={{
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    }} >
                    <Outlet />
                </Grid>

                <Grid item
                    md={uiState.isProfileSectionOn ? 4 : 0}
                    lg={uiState.isProfileSectionOn ? 3 : 0}
                    sx={{
                        display: { xs: "none", md: uiState.isProfileSectionOn ? 'block' : 'none', lg: uiState.isProfileSectionOn ? 'block' : 'none' },
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