import React, { memo } from 'react'
import { Link } from '../styles/StyledComponent'
import { Box, Stack, Typography } from '@mui/material'
import AvatarCard from '../shared/AvatarCard';

function ChatItem({
    avatar = [],
    name,
    _id,
    lastmessage,
    groupChat = false,
    sameSender,
    lastOnline,
    isOnline,
    newMessageAlert,
    index = 0,
    handleDeleteChat
}) {
    return (
        <Link sx={{ padding: "0", }} to={`/chat/${_id}`} onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)} >
            <div style={{
                display: 'flex',
                alignItems: "center",
                padding: "1rem",
                backgroundColor: sameSender ? "black" : "unset",
                color: sameSender ? "white" : "unset",
                position: "relative"
            }}>

                <AvatarCard avatar={avatar} />

                <Stack>
                    <Typography>{name}</Typography>
                    {newMessageAlert && (
                        <Typography>{newMessageAlert.count} New Message</Typography>
                    )}
                </Stack>

                {
                    isOnline && (
                        <Box sx={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "green",
                            position: "absolute",
                            top: "50%",
                            right: "1rem",
                            transform: "translateY(-50%)"
                        }}>
                        </Box>
                    )
                }

            </div>
        </Link>
    )
}

export default memo(ChatItem); // now this component will render when state variable inside it will rerender. It won't rerender when parent components rerenders