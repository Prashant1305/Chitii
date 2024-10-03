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
    const [notificationData, setNotificationData] = useState([])
    const { uiState, setUiState } = MyToggleUiValues();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    // getting meesages alert from state variable
    const { newMessageAlert } = useSelector(state => state.chat);

    const fetchNotification = async () => {
        try {
            setIsLoading(true);
            const res = await my_notification();
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

    const freindRequestHandler = async ({ _id, accept }) => {
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
                fetchNotification();
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
        fetchNotification();

        dispatch(resetNotificationCount())
    }, []);
    return (
        <Dialog open={uiState.isNotification} onClose={() => { setUiState({ ...uiState, isNotification: false }) }}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"30rem"} >
                <DialogTitle>Notifications</DialogTitle>
                {isLoading ? <Skeleton /> : (
                    notificationData.map((i, index) => {
                        return (<React.Fragment key={uuid()}>
                            <NotificationItem
                                sender={{ name: i.sender.user_name, avatar: i.sender.avatar_url }}
                                _id={i._id}
                                handler={freindRequestHandler}
                                key={i._id}
                                type={"FriendRequestNotification"} />
                            {(index < notificationData.length - 1 || notificationData.length > 0) && <Divider />}
                        </React.Fragment>)
                    })
                )
                }
                {
                    newMessageAlert.length > 0 && (
                        newMessageAlert.map((i, index) => {
                            return (<>
                                <NotificationItem
                                    sender={{ name: i.messageData[0].sender.user_name, avatar: i.messageData[0].sender.avatar_url }}
                                    _id={i.chatId}
                                    handler={freindRequestHandler}
                                    key={i.chatId}
                                    type={"NewMessageNotification"}
                                    messageData={i.messageData}
                                />
                                {(index < newMessageAlert.length - 1) && <Divider />}
                            </>)
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

const NotificationItem = memo(({ sender, _id, handler, type, messageData }) => {
    const { name, avatar } = sender;
    const navigate = useNavigate()
    // console.log({ _id })

    switch (type) {
        case "FriendRequestNotification":
            return (
                <ListItem >
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
                            {`${name} sent you freind request`}
                        </Typography>
                        <Stack direction={{
                            xs: "column",
                            sm: "row"
                        }}>
                            <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
                            <Button color="error" onClick={() => handler({ _id, accept: false })}>Decline</Button>
                        </Stack>
                    </Stack>
                </ListItem>)

        case "NewMessageNotification":
            return (
                <ListItem onClick={() => {
                    navigate(`./chat/${messageData[0].conversation}`)
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
                            {`${name.length > 10 ?
                                name.slice(0, 10) + "..." : name
                                } sent you ${messageData.length} message${messageData.length > 1 ? "s" : ""} `}
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