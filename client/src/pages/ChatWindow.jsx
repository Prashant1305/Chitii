import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Drawer, Grid, Skeleton } from '@mui/material'
import ChatList from '../components/chatList/ChatList'
import { sampleChats } from '../components/constants/sampleData'
import Chat from '../components/ChatWindow/Chat'
import SelectChat from '../components/ChatWindow/SelectChat'
import { MyToggleUiValues } from '../context/ToggleUi'
import { toast } from 'react-toastify'
import { get_my_chats } from '../utils/ApiUtils'
import { useDispatch, useSelector } from 'react-redux'
import { useSocketEvent } from '../hooks/socket_hooks'
import { REFETCH_CHATS, START_TYPING, STOP_TYPING } from '../components/constants/events'
import { GetSocket } from '../utils/Socket'
import { popInTypingArray, pushInTypingArray } from '../redux/reducers/typing'

function ChatWindow() {
    const params = useParams();
    const chatId = params.chatId;
    const [chatIsLoading, setChatIsLoading] = useState(false);
    const { uiState, setUiState } = MyToggleUiValues()
    const [chats, setChats] = useState([])
    const handleDeleteChat = (e, _id, groupChat) => {
        e.preventDefault();
        console.log("delete chat", _id, groupChat)
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

    const eventHandler = { [START_TYPING]: startTypingListner, [STOP_TYPING]: stopTypingListener, [REFETCH_CHATS]: refetchChatsListner }

    useSocketEvent(socket, eventHandler);

    useEffect(() => {
        my_chats();
        setUiState((prev) => ({ ...prev, mobileBtnExist: true }))

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
                {
                    chatIsLoading ? <Skeleton /> : <ChatList
                        chats={chats}
                        chatId={chatId}
                        newMessagesAlert={chatNotification.newMessageAlert}
                        handleDeleteChat={handleDeleteChat}
                        onlineUsers={["1", "2"]} />
                }
                {/* <ChatList
                    chats={chats}
                    chatId={chatId}
                    newMessagesAlert={[{
                        chatId,
                        count: 4
                    }]}
                    handleDeleteChat={handleDeleteChat}
                    onlineUsers={["1", "2"]} /> */}
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
                    console.log("clicked")
                    setUiState({ ...uiState, isMobileOpen: false })
                }}>
                <ChatList
                    chats={sampleChats}
                    chatId={chatId}
                    newMessagesAlert={[{
                        chatId,
                        count: 4
                    }]}
                    handleDeleteChat={handleDeleteChat}
                    onlineUsers={["1", "2"]} />
            </Drawer>
            )}
        </Grid>
    )
}

export default ChatWindow