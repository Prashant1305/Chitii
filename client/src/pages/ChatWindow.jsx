import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Drawer, Grid } from '@mui/material'
import ChatList from '../components/chatList/ChatList'
import { sampleChats } from '../components/constants/sampleData'
import Chat from '../components/Chat'
import SelectChat from '../components/ChatWindow/SelectChat'
import { MyToggleUiValues } from '../context/ToggleUi'

function ChatWindow() {
    const params = useParams();
    const chatId = params.chatId;
    const { isMobileOpen, setIsmobileOpen, setMobileBtnExist } = MyToggleUiValues()
    console.log(chatId)
    const handleDeleteChat = (e, _id, groupChat) => {
        e.preventDefault();
        console.log("delete chat", _id, groupChat)
    }
    useEffect(() => {
        setMobileBtnExist(true);
        return () => {
            setMobileBtnExist(false)
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
                <ChatList
                    chats={sampleChats}
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
                md={8}
                lg={8}
                height={"100%"}
                sx={{
                    backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                }} >
                {chatId ? <Chat /> : <SelectChat />}
            </Grid>
            <Drawer
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
                open={isMobileOpen} onClose={() => { setIsmobileOpen(false) }}>
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
        </Grid>
    )
}

export default ChatWindow