import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GetSocket } from '../../../context/SocketConnectContext';
import { MyToggleUiValues } from '../../../context/ToggleUi';
import { CALL_RECEIVED_RESPONSE } from '../../constants/events';

function IncomingCallDialog({ incomingCallUserData }) {
    const { uiState, setUiState } = MyToggleUiValues()
    const navigate = useNavigate()
    const socket = GetSocket()
    const handleAccept = (e) => {
        e.preventDefault();
        setUiState(prev => ({ ...prev, isIncomingCallDialogOpen: false }));
        socket.emit(CALL_RECEIVED_RESPONSE, { _id: incomingCallUserData.user._id, status: "ACCEPTED" });
        // socket.emit("myEvent", { _id: incomingCallUserData.user._id, status: "ACCEPTED" });

        navigate(`/call/${incomingCallUserData.roomId}?received=true`);
    }
    const handleDecline = () => {
        setUiState(prev => ({ ...prev, isIncomingCallDialogOpen: false }));
        socket.emit(CALL_RECEIVED_RESPONSE, { _id: incomingCallUserData.user._id, status: "DECLINED" });
        // socket.emit("myEvent", { _id: incomingCallUserData.user._id, status: "DECLINED" });
    }
    return (
        <Dialog open={uiState?.isIncomingCallDialogOpen} onClose={() => {
            setUiState(prev => ({ ...prev, isIncomingCallDialogOpen: false }))
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