import { Avatar, AvatarGroup, Box, Stack, Typography } from '@mui/material';
import React from 'react'
import { motion } from 'framer-motion';
import { Link } from '../styles/StyledComponent';

function FriendsItem({
    avatar_url = [],
    user_name,
    _id,
    index = 0,
    sameCaller,
    status = '',
    isOnline
}) {
    return (
        <Link
            sx={{
                padding: "0",
                borderBottom: "1px solid white",
                textDecoration: "none",
            }}
            to={`/call/${_id}`}
            onContextMenu={(e) => {
                e.preventDefault();
                // setUiState({ ...uiState, isDeleteMenu: true })
                // handleDeleteChat(e, _id, group_chat)
            }} >
            <motion.div
                initial={{ opacity: 0, y: "-100%" }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                    display: 'flex',
                    alignItems: "center",
                    padding: "1rem",
                    background: sameCaller ? "linear-gradient(to bottom, #5aa6f1, #278aee)" : "unset",
                    color: sameCaller ? "white" : "unset",
                    position: "relative"
                }}>

                <AvatarGroup max={3} sx={{
                    marginRight: "1rem"
                }}>
                    {
                        <Avatar key={index} src={avatar_url} />
                    }
                </AvatarGroup>

                <Stack >
                    <Typography variant="h5" >{user_name}</Typography>
                    {true && (
                        <Typography variant="body2"> is in call with you</Typography>
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
                {status !== '' && <Stack sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0
                }}>
                    <Typography variant="body2" >{`${status} is typing...`}</Typography>
                </Stack>}
            </motion.div>

        </Link>

    )
}

export default FriendsItem