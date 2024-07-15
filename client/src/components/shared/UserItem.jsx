import { Avatar, IconButton, ListItem, Stack, Typography } from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material"
import React from 'react'

function UserItem({ user, handler, handlerIsLoading, isAdded = false, styling = {} }) {
    const { name, _id, avatar_url } = user
    return (
        <ListItem >
            <Stack
                direction={"row"}
                alignItems={"center"}
                spacing={"1rem"}
                width={"100%"}
                {...styling}>

                <Avatar src={avatar_url} />

                <Typography
                    variant='h5'
                    sx={{
                        flexGlow: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%"
                    }}>
                    {name}
                </Typography>

                <IconButton
                    size='small'
                    sx={{
                        bgcolor: isAdded ? "error.main" : "primary.main",
                        color: 'white',
                        "&:hover": {
                            bgcolor: isAdded ? "error.dark" : "primary.dark",
                        },
                    }}

                    disabled={handlerIsLoading}
                >
                    {isAdded ? <RemoveIcon /> : <AddIcon onClick={() => {
                        handler(_id)
                    }} />}
                </IconButton>
            </Stack>
        </ListItem>
    )
}

export default UserItem