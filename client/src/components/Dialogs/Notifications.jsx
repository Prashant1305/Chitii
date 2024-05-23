import { Avatar, Button, Dialog, DialogTitle, ListItem, Stack, Typography } from '@mui/material'
import React, { memo } from 'react'
import { sampleNotifications } from "../constants/sampleData"
import { MyToggleUiValues } from '../../context/ToggleUi';

function Notifications() {
    const freindRequesthandler = ({ _id, accept }) => {

    }
    const { isNotification, setIsNotification } = MyToggleUiValues();
    return (
        <Dialog open={isNotification} onClose={() => { setIsNotification(prev => !prev) }}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
                <DialogTitle>Notifications</DialogTitle>
                {
                    sampleNotifications.length > 0 ? (
                        sampleNotifications.map((i) => <NotificationItem
                            sender={i.sender}
                            _id={i._id}
                            handler={freindRequesthandler}
                            key={i._id} />)
                    ) : <Typography textAlign={"center"}>No notifications</Typography>
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