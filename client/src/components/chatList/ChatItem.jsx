import { Avatar, AvatarGroup, Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { MyToggleUiValues } from '../../context/ToggleUi';
import { Link } from '../styles/StyledComponent';

function ChatItem({
    avatar = [],
    name,
    _id,
    lastmessage,
    group_chat = false,
    sameSender,
    lastOnline,
    isOnline,
    newMessageAlert,
    index = 0,
    handleDeleteChat
}) {

    const { setUiState } = MyToggleUiValues();
    const { typingArray } = useSelector(state => state.typing);
    const typingUser = typingArray?.find((ele) => ele.chatId + "" === _id + "")
    return (
        <Link
            sx={{
                padding: "0",
                borderBottom: "1px solid white"
            }}
            to={`/chat/${_id}`}
            onContextMenu={(e) => {
                e.preventDefault();
                setUiState((prev) => ({ ...prev, isDeleteMenu: true }))
                handleDeleteChat(e, _id, group_chat)
            }} >
            <motion.div
                initial={{ opacity: 0, y: "-100%" }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                    display: 'flex',
                    alignItems: "center",
                    padding: "1rem",
                    background: sameSender ? "linear-gradient(to bottom, #5aa6f1, #278aee)" : "unset",
                    color: sameSender ? "white" : "unset",
                    position: "relative"
                }}>

                {/* <AvatarCard avatar={avatar} max={2} /> */}
                <AvatarGroup max={3} sx={{
                    marginRight: "1rem"
                }}>
                    {(
                        avatar.map((i, index) => (
                            <Avatar key={index} src={i} />
                        ))
                    )}
                </AvatarGroup>

                <Stack >
                    <Typography variant="h5" >{name}</Typography>
                    {newMessageAlert && (
                        <Typography variant="body2">{newMessageAlert.count} New Message</Typography>
                    )}
                </Stack>

                {
                    isOnline && (
                        <Box sx={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "cyan",
                            position: "absolute",
                            top: "30%",
                            right: "1rem",
                            transform: "translateY(-50%)",
                            border: "1px solid rgb(46, 99, 91)"
                        }}>
                        </Box>
                    )
                }
                {typingUser && <Stack sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0
                }}>
                    <Typography variant="body2" >{`${typingUser?.user?.user_name} is typing...`}</Typography>

                </Stack>}
            </motion.div>

        </Link>
    )
}

export default memo(ChatItem); // now this component will render when state variable inside it will rerender. It won't rerender when parent components rerenders