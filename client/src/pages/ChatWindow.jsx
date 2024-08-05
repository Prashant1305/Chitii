import { Drawer, Grid, Skeleton } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import ChatList from '../components/chatList/ChatList'
import Chat from '../components/ChatWindow/Chat'
import SelectChat from '../components/ChatWindow/SelectChat'
import { CHAT_JOINED, ONLINE_USERS, REFETCH_CHATS, START_TYPING, STOP_TYPING } from '../components/constants/events'
import DeleteChatMenu from '../components/Dialogs/DeleteChatMenu'
import { MyToggleUiValues } from '../context/ToggleUi'
import { useSocketEvent } from '../hooks/socket_hooks'
import { popInTypingArray, pushInTypingArray } from '../redux/reducers/typing'
import { get_my_chats } from '../utils/ApiUtils'
import { GetSocket } from '../utils/Socket'

function ChatWindow() {
    const params = useParams();
    const chatId = params.chatId;
    const [chatIsLoading, setChatIsLoading] = useState(false);
    const { uiState, setUiState } = MyToggleUiValues()
    const [chats, setChats] = useState([])
    const deleteMenuAnchor = useRef(null)
    const [deleteChat, setDeleteChat] = useState({});
    const [onlineUsers, setOnlineUsers] = useState([]);

    const handleDeleteChat = (e, _id, group_chat) => {
        e.preventDefault();
        setDeleteChat({ _id, group_chat });
        deleteMenuAnchor.current = e.currentTarget;
        // try
    }
    const chatNotification = useSelector(state => state.chat);
    const socket = GetSocket();
    const dispatch = useDispatch()


    const my_chats = async () => {
        try {
            setChatIsLoading(true)
            const res = await get_my_chats();
            setChats(res?.data?.message)
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || "failed to retrive chats, plz try later")
        }
        finally {
            setChatIsLoading(false)
        }
    }

    const startTypingListner = useCallback(
        (data) => {
            console.log("form startyping listner", data)
            // store data in typing
            dispatch(pushInTypingArray(data));

            // removing data after some seconds, when user closes it before event fires
            // setTimeout(() => {
            //     dispatch(popInTypingArray(data))
            // }, [2500])

        }, []
    )

    const refetchChatsListner = useCallback(() => {
        my_chats();
    }, [])

    const stopTypingListener = useCallback((data) => {
        console.log("form stop typing listner", data)

        dispatch(popInTypingArray(data))
    }, [])

    const onlineListner = useCallback((data) => {
        console.log("onlineListner", data)
        setOnlineUsers(data.users);
    }, [])

    const eventHandler = { [START_TYPING]: startTypingListner, [STOP_TYPING]: stopTypingListener, [REFETCH_CHATS]: refetchChatsListner, [ONLINE_USERS]: onlineListner }

    useSocketEvent(socket, eventHandler);

    useEffect(() => {
        my_chats();
        setUiState((prev) => ({ ...prev, mobileBtnExist: true }))
        socket.emit(CHAT_JOINED, {})// firing to get online users
        return () => {
            setUiState((prev) => ({ ...prev, mobileBtnExist: false }))
        };
    }, [])
    return (
        <Grid container height={"calc(100vh - 4rem)"}>
            <Grid item
                sm={4}
                md={4}
                lg={4}
                sx={{
                    display: { xs: "none", sm: "block" },
                    backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    border: "1px solid white"
                }} height={"100%"} >
                <DeleteChatMenu deleteMenuAnchor={deleteMenuAnchor} deleteChat={deleteChat} setDeleteChat={setDeleteChat} />
                {
                    chatIsLoading ? <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width={"90%"} height={"90%"}
                        sx={{
                            margin: "auto",
                            mt: "2rem",
                        }}
                    /> : <ChatList
                        chats={chats}
                        chatId={chatId}
                        newMessagesAlert={chatNotification.newMessageAlert}
                        handleDeleteChat={handleDeleteChat}
                        onlineUsers={onlineUsers} />
                }
            </Grid>

            <Grid item
                xs={12}
                sm={8}
                md={8}
                lg={8}
                height={"100%"}
                sx={{
                    backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                }} >
                {chatId ? <Chat chatId={chatId} /> : <SelectChat />}
            </Grid>
            {chatIsLoading ? <Skeleton /> : (<Drawer
                PaperProps={{
                    sx: {
                        width: "50vw",
                        display: {
                            xs: "block",
                            sm: "none"
                        },
                        height: "calc(100vh - 4rem)",
                        top: "4rem",
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))"
                    }
                }}
                open={uiState.isMobileOpen} onClose={() => {
                    setUiState({ ...uiState, isMobileOpen: false })
                }}>
                {chatIsLoading ? <Skeleton
                    animation="wave"
                    variant="rectangular"
                    height={"100%"}
                    width={"100%"} />
                    :
                    <ChatList
                        chats={chats}
                        chatId={chatId}
                        newMessagesAlert={chatNotification.newMessageAlert}
                        handleDeleteChat={handleDeleteChat}
                        onlineUsers={onlineUsers} />}
            </Drawer>
            )}
        </Grid>
    )
}

export default ChatWindow