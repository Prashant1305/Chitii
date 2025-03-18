import { Avatar, Button, Dialog, DialogTitle, Divider, ListItem, Skeleton, Stack, Typography } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MyToggleUiValues } from '../../context/ToggleUi';
import { resetNotificationCount } from '../../redux/reducers/chat';
import { accept_friend_request, my_notification } from '../../utils/ApiUtils';
import { v4 as uuid } from 'uuid';


function Notifications() {
    const [notificationData, setNotificationData] = useState([]);
    const { uiState, setUiState } = MyToggleUiValues();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    let page = 0, limit = 2;

    // getting meesages alert from state variable
    const { newMessageAlert } = useSelector(state => state.chat);

    const fetchNotification = async (page, limit) => {
        try {
            setIsLoading(true);
            const res = await my_notification(page, limit);
            if (res.status === 200) {
                setNotificationData(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || "failed to get notification")
        }
        finally {
            setIsLoading(false);
        }
    }

    const freindRequestHandler = async (setDisableBtn, { _id, accept }) => {
        const toastId = toast.loading("updating Friend Request");
        try {
            const res = await accept_friend_request({ requestId: _id, accept })
            if (res.status === 200) {
                toast.update(toastId, {
                    render: accept ? "Request Accepted" : "Request Rejected",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
                setDisableBtn(true);
            }
        } catch (error) {
            toast.update(toastId, {
                render: error?.response?.data?.message || "failed to take action, plz try later",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
            console.log(error);
        }
    }
    useEffect(() => {
        fetchNotification(page, limit);

        // dispatch(resetNotificationCount())
    }, []);
    return (
        <Dialog open={uiState.isNotification} onClose={() => { setUiState({ ...uiState, isNotification: false }) }}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"35rem"} >
                <DialogTitle>Notifications</DialogTitle>
                {isLoading ? <Skeleton /> : (
                    notificationData.map((i, index) => {
                        return (<React.Fragment key={uuid()}>
                            <NotificationItem
                                sender={{ name: i.from.user_name, avatar: i.from.avatar_url }}
                                content={i.message}
                                request_id={i.request}
                                handler={freindRequestHandler}
                                key={i._id}
                                type={i.type}
                                chat_id={i.chat_id}
                                status={i.status}
                            />
                            {(index < notificationData.length - 1) && <Divider />}
                        </React.Fragment>)
                    })
                )
                }

                {
                    notificationData.length === 0 && newMessageAlert.length === 0 && <Typography textAlign={"center"}>No notifications</Typography>
                }
            </Stack>
        </Dialog>
    )
}

const NotificationItem = memo(({ sender, request_id, handler, type, content, chat_id, status }) => {
    const { name, avatar } = sender;
    const { setUiState } = MyToggleUiValues();
    const navigate = useNavigate();
    const [disableBtn, setDisableBtn] = useState(false);

    switch (type) {
        case "friend_request":
            return (
                <ListItem
                    sx={{
                        backgroundColor:
                            status === 'read' ? '#ffffff' : '#f0f0f0',
                        padding: '1rem',
                        borderRadius: '4px'
                    }}>
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={"1rem"}
                        width={"100%"}
                    >
                        <Avatar src={avatar} />
                        <Typography
                            variant='body1'
                            sx={{
                                flexGlow: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%"
                            }}>
                            {content ? content : (`${name} sent you freind request`)}
                        </Typography>
                        <Stack direction={{
                            xs: "column",
                            sm: "row"
                        }}>
                            <Button disabled={disableBtn} onClick={() => handler(setDisableBtn, { _id: request_id, accept: true })}>Accept</Button>
                            <Button disabled={disableBtn} color="error" onClick={() => handler(setDisableBtn, { _id: request_id, accept: false })}>Decline</Button>
                        </Stack>
                    </Stack>
                </ListItem>)

        case "new_message":
            console.log(sender)
            return (
                <ListItem onClick={() => {
                    navigate(`./chat/${chat_id}`)
                    setUiState(prev => ({ ...prev, isNotification: false }));
                }} sx={{
                    cursor: "pointer"
                }}>
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={"1rem"}
                        width={"100%"}>
                        <Avatar src={avatar} />
                        <Typography
                            variant='body1'
                            sx={{
                                flexGlow: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%"
                            }}>
                            {content}
                        </Typography>
                        <Stack direction={{
                            xs: "column",
                            sm: "row"
                        }}>
                        </Stack>
                    </Stack>
                </ListItem>
            )
        default:
            return <Typography>ERROR IN NOTIFICATION ITEM</Typography>

    }
}
)

export default Notifications