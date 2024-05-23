import { Box, Stack, Typography } from '@mui/material';
import React, { memo } from 'react';
import moment from "moment";
import { fileFormat } from "../lib/features"
import RenderAttachment from './RenderAttachment';

function MessageComponent({ message, user }) {
    const { sender, content, attachments = [], createdAt } = message;
    const sameSender = sender?._id === user?._id;
    // console.log(createdAt)
    const timeAgo = moment(createdAt).fromNow();


    return (
        <Stack style={{
            alignSelf: sameSender ? "flex-end" : "flex-start",
            backgroundColor: sameSender ? "#06d9e0d4" : "rgba(0,0,0,0.5)",
            color: "black",
            fontSize: "1.2rem",
            borderRadius: "5px",
            padding: "0.5rem",
            width: "fit-content",
        }}>
            {!sameSender && <Typography style={{
                color: "#05f709",
                fontSize: "0.9rem",
                fontWeight: "500"
            }}>{sender.name}</Typography>}

            {content && <Typography style={{
                fontSize: "1.3rem"
            }} variant='caption' color={"text.secondary"}>{content}</Typography>}

            {attachments.length > 0 && attachments.map((attachment, index) => {
                const url = attachment.url;
                const file = fileFormat(url);
                return <Box key={index} sx={{
                    display: 'flex',
                    margin: "2px",
                    // border: "2px solid green",
                    justifyContent: "center"
                }}>
                    <a
                        href={url}
                        target='_blank'
                        download
                        style={{
                            color: "black",
                            // border: "2px solid red"
                        }}><RenderAttachment url={url} file={file} /></a>
                </Box>
            })}


            <Typography style={{
                alignSelf: "flex-end",
                fontSize: "0.9rem"
            }} variant='caption' color={"text.secondary"}>{timeAgo}</Typography>
        </Stack>
    )
}

export default memo(MessageComponent)