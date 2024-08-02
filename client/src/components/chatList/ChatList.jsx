import { Stack } from '@mui/material'
import React, { memo } from 'react'
import ChatItem from './ChatItem'
import { useSelector } from 'react-redux';

function ChatList({
    w = "100%",
    chats = [],
    chatId,
    onlineUsers = [],
    newMessagesAlert = [
        { chatId: "", count: 0 },
    ],
    handleDeleteChat, }) {

    const { user, isLoading } = useSelector(state => state.auth);
    return (
        <Stack width={w} direction={"column"} overflow={"auto"} height={"100%"}>
            {
                chats?.map((data, index) => {
                    const { avatar_url, _id, name, group_chat, members } = data;
                    const newMessageAlert = newMessagesAlert.find((alert) => alert.chatId === _id);
                    const isOnline = members.some((member) => onlineUsers.includes(_id))
                    return (
                        <ChatItem
                            index={index}
                            newMessageAlert={newMessageAlert}
                            isOnline={isOnline}
                            avatar={avatar_url || members.filter((member) => (member._id != user._id)).map((member) => {
                                return member.avatar_url;
                            })}

                            name={group_chat ? name : name.replace("-", "").replace(user.user_name, "")}
                            _id={_id}
                            key={_id}
                            group_chat={group_chat}
                            sameSender={chatId === _id}
                            handleDeleteChat={handleDeleteChat}
                        />
                    )
                })
            }
        </Stack>
    )
}

export default memo(ChatList);