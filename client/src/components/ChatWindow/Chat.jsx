import { Skeleton, Stack, Typography } from '@mui/material'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material'
import { InputBox } from '../styles/StyledComponent';
import FileMenu from '../Dialogs/FileMenu';
import { sampleMessage } from '../constants/sampleData';
import MessageComponent from '../shared/MessageComponent';
import { GetSocket } from '../../utils/Socket';
import { NEW_MESSAGE } from '../constants/events';
import { all_messages_of_chat, chat_details, send_message_api } from '../../utils/ApiUtils';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useSocketEvent } from '../../hooks/socket_hooks';
import infiniteScroll from '../lib/infiniteScroll';
import { MyToggleUiValues } from '../../context/ToggleUi';
import { v4 as uuid } from 'uuid';


function Chat({ chatId }) {
    const containerRef = useRef(null)
    const containerRef1 = useRef(null)

    const socket = GetSocket()
    const [sendMessage, setSendMessage] = useState({ attachments: undefined, conversationId: chatId, text_content: "" });
    const [files, setFiles] = useState([]);
    const [oldMessages, setOldMessages] = useState([]);
    const [messageIsLoading, setMessageIsLoading] = useState(false);
    const [member, setMember] = useState([]);
    const [oldMessageFetchDetails, setOldMessageFetchDetails] = useState("end of messages");
    let page = 1;
    const user = useSelector(state => state.auth);
    const { uiState, setUiState } = MyToggleUiValues();
    let totalPageOfChat = 10;

    const submitHandler = async (e) => {
        e.preventDefault()

        const form_data = new FormData();
        if (files) {
            files?.forEach(file => {
                form_data.append("attachments", file);
            });
        }
        form_data.append("conversationId", sendMessage.conversationId);
        form_data.append("text_content", sendMessage.text_content);

        if (!sendMessage?.text_content.trim()) return;

        try {
            const res = await send_message_api(form_data);
            if (res.status = 200) {
                toast.success("message sent succesfully");
            }
        } catch (error) {
            toast.error(error.response.data.message || "failed to send message");
            console.log(error);
        } finally {
            setSendMessage({ attachments: [], conversationId: chatId, text_content: "" });
        }
        setFiles([]);
    }

    const handleAttachFile = (e) => {

        setUiState({ ...uiState, isFileMenu: true })
    }

    const newMessageHandler = useCallback((data) => {
        const temp = { ...data };
        console.log("newMessage event triggereed and sensed at client", data);
        console.log()
        if (data.conversation === chatId) {
            setOldMessages([...oldMessages, temp])
        }
    }, [oldMessages]);
    const eventHandler = { [NEW_MESSAGE]: newMessageHandler }
    useSocketEvent(socket, eventHandler);

    const fetchOldmessage = async (chatId) => {
        console.log("page= ", page, totalPageOfChat)
        if (page <= totalPageOfChat) {
            setOldMessageFetchDetails("loading");
            try {
                const res = await all_messages_of_chat(chatId, page);
                if (res.status === 200) {
                    toast.success("Messages fetched successfully");
                    page++;
                    setOldMessages((prev) => {
                        return [...res.data.messages, ...prev]
                    })
                    console.log(res.data.totalPages)
                    totalPageOfChat = res.data.totalPages;
                    setOldMessageFetchDetails("end of messages");
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message || "failed to retrive messages, plz try later")
                setOldMessageFetchDetails("failed")
            }
        }
    }
    useEffect(() => {

        if (containerRef) {
            infiniteScroll(containerRef, fetchOldmessage, chatId);
        }
    }, [containerRef, chatId])


    useEffect(() => {
        setSendMessage({ attachments: [], conversationId: chatId, text_content: "" });
        setOldMessages([]);
        page = 1;
        totalPageOfChat = 10;
        const fetchChatData = async (chatId) => {
            setMessageIsLoading(true);
            try {
                const res = await all_messages_of_chat(chatId, page);
                if (res.status === 200) {
                    toast.success("Messages fetched successfully");
                    page++;
                    setOldMessages(res.data.messages)
                    totalPageOfChat = res.data.totalPages;
                    setOldMessageFetchDetails("");
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message || "failed to retrive messages, plz try later")
            } finally {
                setMessageIsLoading(false);
            }
        }
        const fetchChatDetails = async (chatId) => {
            setMessageIsLoading(true);
            try {
                const res = await chat_details(chatId);
                if (res.status === 200) {
                    setMember(res.data.message.members);
                }
            } catch (error) {
                toast.error(error.response.data.message || "Error fetching chat details")
            } finally {
                setMessageIsLoading(false);
            }
        }

        fetchChatDetails(chatId);
        fetchChatData(chatId, page);

    }, [chatId]);

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
                <Typography p={"2rem"}
                    variant='h6'
                    textAlign={"center"}>{oldMessageFetchDetails}</Typography>
                {messageIsLoading ? <Skeleton sx={{
                    "height": "100%"
                }} /> :
                    (oldMessages?.length > 0 ? oldMessages.map(i => (
                        <MessageComponent message={i} user={{ _id: user?.user._id }} key={i._id || uuid()} />
                    )) : <Typography
                        p={"2rem"}
                        variant='h4'
                        textAlign={"center"}>
                        Start Conversation
                    </Typography>)
                }
            </Stack>
            <form
                style={{
                    height: "10%"
                }} onSubmit={submitHandler}>
                <Stack
                    direction={"row"}
                    height={"100%"}
                    padding={"0.5rem"}
                    alignItems={"center"}
                    position={"relative"}>
                    <IconButton sx={{
                        backgroundColor: "rgb(4, 237, 254)",
                        color: "rgb(255, 255, 255)",
                        '&:hover': {
                            backgroundColor: 'rgb(4, 135, 242)',
                        },
                        marginRight: "-2.6rem",
                        // position: "absolute",
                        // left: "1.5rem",
                        rotate: "30deg"
                    }}
                        onClick={handleAttachFile} ref={containerRef1}>
                        <AttachFileIcon />
                    </IconButton>

                    <InputBox placeholder='Type your text here' value={sendMessage.text_content} onChange={(e) => {
                        setSendMessage({ ...sendMessage, text_content: e.target.value })
                    }} />

                    <IconButton type='submit' sx={{
                        backgroundColor: "rgb(4, 237, 254)",
                        color: "rgb(255, 255, 255)",
                        margin: "1rem",
                        '&:hover': {
                            backgroundColor: 'rgb(4, 135, 242)',
                        },
                    }}>
                        <SendIcon />
                    </IconButton >
                </Stack>
            </form>

            {containerRef1.current && < FileMenu anchor={containerRef.current} files={files} setFiles={setFiles} />}
        </Fragment>
    )
}

export default Chat