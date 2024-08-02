import { Box, Stack, Typography } from '@mui/material';
import React, { memo } from 'react';
import moment from "moment";
import { fileFormat, transformImage } from "../lib/features"
import RenderAttachment from './RenderAttachment';
import { motion } from 'framer-motion'

function MessageComponent({ message, user }) {
    const { sender, text_content, attachments = [], createdAt } = message;
    const sameSender = sender?._id === user?._id;
    // console.log(sender)
    const timeAgo = moment(createdAt).fromNow();

    return (
        <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            whileInView={{ opacity: 1, x: 0 }}
            style={{
                alignSelf: sameSender ? "flex-end" : "flex-start",
                backgroundColor: sameSender ? "#06d9e0d4" : "rgba(0,0,0,0.3)",
                color: "black",
                fontSize: "1.2rem",
                borderRadius: "5px",
                padding: "0.5rem",
                width: "fit-content",
            }}>
            <Box >
                {!sameSender && <Typography style={{
                    color: "#05f709",
                    fontSize: "0.9rem",
                    fontWeight: "500"
                }}>{sender.user_name}</Typography>}

                {text_content && <Typography style={{
                    fontSize: "1.1rem"
                }} variant='caption' color={"text.secondary"}>{text_content}</Typography>}

                {attachments.length > 0 && attachments.map((attachment) => {
                    const url = transformImage(attachment.url);
                    const file = fileFormat(url);
                    return <Box key={attachment?.public_id} sx={{
                        display: 'flex',
                        margin: "2px",
                        // border: "2px solid green",
                        justifyContent: "center"
                    }}>
                        <a
                            href={url}
                            target='_blank'
                            rel="noreferrer"
                            download
                            style={{
                                color: "black",
                                // border: "2px solid red"
                            }}><RenderAttachment url={url} file={file} /></a>
                    </Box>
                })}

            </Box>
            <Typography style={{
                alignSelf: "flex-end",
                fontSize: "0.7rem",
                alignSelf: "flex-end"
            }} variant='caption' color={"text.secondary"}>{timeAgo}</Typography>
        </motion.div>
    )
}

export default memo(MessageComponent)