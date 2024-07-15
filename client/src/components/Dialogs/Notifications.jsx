import { Avatar, Button, Dialog, DialogTitle, ListItem, Skeleton, Stack, Typography } from '@mui/material'
import React, { memo, useEffect, useState } from 'react'
import { sampleNotifications } from "../constants/sampleData"
import { MyToggleUiValues } from '../../context/ToggleUi';
import { accept_friend_request, my_notification } from '../../utils/ApiUtils';
import { toast } from 'react-toastify';


function Notifications() {
    const [notificationData, setNotificationData] = useState([])
    const { uiState, setUiState } = MyToggleUiValues();
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotification = async () => {
        try {
            setIsLoading(true);
            const res = await my_notification();
            if (res.status === 200) {
                setNotificationData(res.data.message);
                toast.success("Notification fetched successfully");
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
        try {
            const res = await accept_friend_request({ requestId: _id, accept })
            console.log(res)
            if (res.status === 200) {
                accept ? toast.success("Friend Request Accepted") : toast.success("Friend Request Rejected");
                fetchNotification();
            }
        } catch (error) {
            toast.error(error.response.data.message || "failed to take action, plz try later");
            console.log(error);
        }

    }
    useEffect(() => {

        fetchNotification();
    }, []);
    return (
        <Dialog open={uiState.isNotification} onClose={() => { setUiState({ ...uiState, isNotification: false }) }}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
                <DialogTitle>Notifications</DialogTitle>
                {isLoading ? <Skeleton /> : (
                    notificationData.length > 0 ? (
                        notificationData.map((i) => <NotificationItem
                            sender={{ name: i.sender.user_name, avatar: i.sender.avatar_url }}
                            _id={i._id}
                            handler={freindRequestHandler}
                            key={i._id} />)
                    ) : <Typography textAlign={"center"}>No notifications</Typography>)
                }
            </Stack>
        </Dialog>
    )
}

const NotificationItem = memo(({ sender, _id, handler }) => {
    const { name, avatar } = sender;
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
        </ListItem>
    )
})

export default Notifications