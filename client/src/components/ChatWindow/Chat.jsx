import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material';
import { IconButton, Skeleton, Stack, Typography } from '@mui/material';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { all_messages_of_chat, send_message_api } from '../../utils/ApiUtils';
import FileMenu from '../Dialogs/FileMenu';
import { START_TYPING, STOP_TYPING } from '../constants/events';
import MessageComponent from '../shared/MessageComponent';
import { InputBox } from '../styles/StyledComponent';

import { v4 as uuid } from 'uuid';
import { MyToggleUiValues } from '../../context/ToggleUi';
import { popMessageAlert } from '../../redux/reducers/chat';
import { GetSocket } from '../../context/SocketConnectContext';


function Chat({ chatId }) {
    const containerRef = useRef(null)
    const containerRef1 = useRef(null)
    const bottomScrollRef = useRef(null)

    const socket = GetSocket()
    const [sendMessage, setSendMessage] = useState({ attachments: undefined, conversationId: chatId, text_content: "" });
    const [files, setFiles] = useState([]);
    const dispatch = useDispatch();
    const [oldMessages, setOldMessages] = useState([]);
    const [messageIsLoading, setMessageIsLoading] = useState(false);
    const [messageAtEndOfMessages, setMessageAtEndOfMessages] = useState("");
    let oldMessageFetchDetails = "";

    const user = useSelector(state => state.auth);
    const chatNotification = useSelector(state => state.chat);
    const { uiState, setUiState } = MyToggleUiValues();
    let page = 1;
    let totalPageOfChat = 0;

    const [iAmTyping, setIAmTyping] = useState(false);
    const typingTimeout = useRef(null);

    const submitHandler = async (e) => {
        e.preventDefault()
        const form_data = new FormData();
        if (files?.length > 0) {
            files?.forEach(file => {
                form_data.append("attachments", file);
            });
        }
        form_data.append("conversationId", sendMessage.conversationId);
        form_data.append("text_content", sendMessage.text_content);

        if (!sendMessage?.text_content.trim() && files.length === 0) return;
        const toastId = toast.loading("sending message...")
        try {
            const res = await send_message_api(form_data);
            if (res.status === 200) {
                toast.update(toastId, {
                    render: res?.data?.message || "message sent succesfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
        } catch (error) {
            toast.update(toastId, {
                render: error?.response?.data?.message || "failed to send message",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
            console.log(error);
        } finally {
            setSendMessage({ attachments: [], conversationId: chatId, text_content: "" });
            setFiles([]);
        }
    }

    const handleAttachFile = (e) => {

        setUiState({ ...uiState, isFileMenu: true })
    }

    const handleInputMessageChange = (e) => {
        e.preventDefault();
        setSendMessage({ ...sendMessage, text_content: e.target.value })
        if (!iAmTyping) {
            socket.emit(START_TYPING, { chatId });
            setIAmTyping(true);
        }
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current)
        }

        typingTimeout.current = setTimeout(() => {

            socket.emit(STOP_TYPING, { chatId })
            setIAmTyping(false);

        }, 500);
    }

    useEffect(() => {
        if (bottomScrollRef.current && page === 1) {
            bottomScrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [oldMessages])

    useEffect(() => {
        const newMessages = chatNotification.newMessageAlert.find((notification) => (notification.chatId === chatId))
        if (newMessages) {
            setOldMessages([...oldMessages, ...newMessages.messageData])
            console.log("first")
            dispatch(popMessageAlert(chatId));
        }
    }, [chatNotification])

    useEffect(() => {
        setSendMessage({ attachments: [], conversationId: chatId, text_content: "" });
        dispatch(popMessageAlert(chatId));
        const fetchChatData = async (chatId) => {
            setMessageIsLoading(true);
            const toastId = toast.loading("fetching first page message");
            try {
                const res = await all_messages_of_chat(chatId, page);
                if (res.status === 200) {
                    toast.update(toastId, {
                        render: "Messages fetched successfully",
                        type: "success",
                        isLoading: false,
                        autoClose: 1000,
                    })
                    page++;
                    setOldMessages(res.data.messages)
                    totalPageOfChat = res.data.totalPages;
                    oldMessageFetchDetails = "";
                }
                else {
                    toast.update(toastId, {
                        render: res.data.message || "oops",
                        type: "info",
                        isLoading: false,
                        autoClose: 1000,
                    })
                }
            } catch (error) {
                console.log(error);
                toast.update(toastId, {
                    render: error?.response?.data?.message || "failed to retrive messages, plz try later",
                    type: "error",
                    isLoading: false,
                    autoClose: 1000,
                })
            } finally {
                setMessageIsLoading(false);
            }
        }

        // infinite scroll starts
        const fetchOldmessage = async (chatId) => {
            if (page <= totalPageOfChat) {
                oldMessageFetchDetails = "loading";
                setMessageAtEndOfMessages((prev) => "loading")
                try {
                    console.log("page= ", page, totalPageOfChat, "chatId ", chatId)

                    const res = await all_messages_of_chat(chatId, page);
                    if (res.status === 200) {
                        toast.success("Messages fetched successfully");
                        setOldMessages((prev) => {
                            return [...res.data.messages, ...prev]
                        })
                        page++;

                        if (page > totalPageOfChat) {
                            oldMessageFetchDetails = "end of messages";
                            setMessageAtEndOfMessages((prev) => "end of messages")

                        } else {
                            oldMessageFetchDetails = ""
                            setMessageAtEndOfMessages((prev) => "")
                        }
                    }
                } catch (error) {
                    console.log(error);
                    toast.error(error.response.data.message || "failed to retrive messages, plz try later")
                    oldMessageFetchDetails = "failed"
                }
            } else {
                oldMessageFetchDetails = "end of messages"
                setMessageAtEndOfMessages((prev) => "end of messages")
            }
        }
        const infiniteScroll = () => {
            if (containerRef1.current?.scrollTop === 0 && !messageIsLoading && oldMessageFetchDetails === "") {
                fetchOldmessage(chatId);
            }
        }
        containerRef?.current.addEventListener("scroll", infiniteScroll)
        // infinite scroll ends
        if (chatId) {
            fetchChatData(chatId, page);
        }
        return (() => {
            setSendMessage({ attachments: [], conversationId: chatId, text_content: "" });
            setOldMessages([]);
            page = 1;
            totalPageOfChat = 0;
            containerRef?.current?.removeEventListener("scroll", infiniteScroll);
        })
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
                {messageAtEndOfMessages?.length > 0 && <Typography p={"2rem"}
                    variant='h6'
                    textAlign={"center"}>{messageAtEndOfMessages}</Typography>}

                {messageIsLoading ? <Skeleton
                    animation="wave"
                    variant="rectangular"
                    sx={{
                        width: "100%",
                        height: "100%",
                    }}

                /> :
                    (oldMessages?.length > 0 ? oldMessages.map(i => (<MessageComponent message={i} user={{ _id: user?.user?._id }} key={i?._id || uuid()} />
                    )) : <Typography
                        p={"2rem"}
                        variant='h4'
                        textAlign={"center"}>
                        Start Conversation
                    </Typography>)
                }
                <div ref={bottomScrollRef} ></div>
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

                    <InputBox placeholder='Type your text here' value={sendMessage.text_content} onChange={handleInputMessageChange} />

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