import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, Stack, Typography } from '@mui/material'
import React from 'react'
import { MyToggleUiValues } from '../../../context/ToggleUi'
import CallReceivedIcon from '@mui/icons-material/CallReceived';

function IncomingCallDialog({ incomingCallUserData }) {
    const { uiState, setUiState } = MyToggleUiValues()
    const handleAccept = () => {

    }
    const handleDecline = () => {

    }
    return (
        <Dialog open={true} onClose={() => {
            setUiState({ ...uiState, incomingCallDialogOpen: false })
        }} >
            <DialogTitle ><CallReceivedIcon sx={{
                marginRight: "0.3rem",
                fontSize: "2.5rem",
            }} />Incoming call</DialogTitle>
            <DialogContent sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <Avatar src={incomingCallUserData?.user.avatar_url} />
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
                    {incomingCallUserData?.user.user_name}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAccept}>Accept</Button>
                <Button color='error' onClick={handleDecline}>Decline</Button>
            </DialogActions>
        </Dialog>
    )
}

export default IncomingCallDialog