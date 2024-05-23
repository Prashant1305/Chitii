import { Stack } from '@mui/material'
import React, { Fragment, useRef } from 'react';
import { IconButton } from '@mui/material';
import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material'
import { InputBox } from './styles/StyledComponent';
import FileMenu from './Dialogs/FileMenu';
import { sampleMessage } from './constants/sampleData';
import MessageComponent from './shared/MessageComponent';



function Chat() {
    const containerRef = useRef(null)
    return (
        <Fragment>
            <Stack
                ref={containerRef}
                boxSizing={"border-box"}
                padding={"1rem"}
                spacing={"1rem"}
                height={"90%"}
                sx={{
                    overflowX: "hidden",
                    overflowY: "auto",
                }}
            >
                {
                    sampleMessage.map(i => (
                        <MessageComponent message={i} user={{ _id: "user2_ka_id" }} key={i._id} />
                    ))
                }
            </Stack>
            <form
                style={{
                    height: "10%"
                }}>
                <Stack
                    direction={"row"}
                    height={"100%"}
                    padding={"1rem"}
                    alignItems={"center"}
                    position={"relative"}>
                    <IconButton sx={{
                        backgroundColor: "rgb(4, 237, 254)",
                        color: "rgb(255, 255, 255)",
                        '&:hover': {
                            backgroundColor: 'rgb(4, 135, 242)',
                        },
                        position: "absolute",
                        left: "1.5rem",
                        rotate: "30deg"
                    }}>
                        <AttachFileIcon />
                    </IconButton>

                    <InputBox placeholder='Type your text here' />

                    <IconButton type='submit' sx={{
                        backgroundColor: "rgb(4, 237, 254)",
                        color: "rgb(255, 255, 255)",
                        margin: "1.2rem",
                        '&:hover': {
                            backgroundColor: 'rgb(4, 135, 242)',
                        },
                    }}>
                        <SendIcon />
                    </IconButton >
                </Stack>
            </form>

            {/* < FileMenu /> */}
        </Fragment>
    )
}

export default Chat