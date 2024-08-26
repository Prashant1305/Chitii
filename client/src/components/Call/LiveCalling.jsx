import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Button, CardMedia, IconButton, Stack } from '@mui/material';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { GetSocket } from '../../utils/Socket';
import ReactPlayer from "react-player";
import { useSelector } from 'react-redux';
import { incoming_call_api } from '../../utils/ApiUtils';
import { toast } from 'react-toastify';

import { useSocketEvent } from '../../hooks/socket_hooks';
import { CLIENT_CREATE_OFFER, END_CALL, HANDLE_ANSWERE, HANDLE_CREATED_ANSWERE, HANDLE_OFFER_CREATE_ANSWERE, INITIATE_P2P, NEGOTIATION_NEEDED, PEER_NEGO_DONE, PEER_NEGO_FINAL, PEER_NEGO_NEEDED } from '../constants/events';
import peer from '../lib/peer';
import { MyCallingValues } from '../../context/CallContext';
import IconBtn from '../header/IconBtn';

function LiveCalling({ callId }) {
    const socket = GetSocket()
    const { user } = useSelector(state => state.auth)
    const [isConnecting, setIsConnecting] = useState(false);
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState()
    const [remoteSocketId, setRemoteSocketId] = useState();
    const [searchParams] = useSearchParams();
    const [uiOfLiveCalling, setUiOfLiveCalling] = useState({
        connectButtonIsActive: searchParams.get('received') ? true : false,
        dialButtonIsactive: true,
        disconnectButtonIsActive: false
    })
    const navigate = useNavigate()
    const { callingVariables, setCallingVariables } = MyCallingValues();

    const initiateP2pHandler = useCallback(async (data) => { // data-{to:socketId of receiver / otherPerson}
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                height: {
                    min: 480,
                    ideal: 720,
                    max: 1080
                },
                width: {
                    min: 480,
                    ideal: 720,
                    max: 1080
                }
            },
        });
        const offer = await peer.getOffer();
        setRemoteSocketId(data.socketId);
        setMyStream(stream);
        socket.emit(CLIENT_CREATE_OFFER, { to: data.socketId, offer })
    }, [remoteSocketId, socket])


    const handleOfferCreateAnswereHandler = useCallback(async ({ from, offer }) => {
        console.log("handleOfferCreateAnswereHandler", { from, offer })
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                height: {
                    min: 480,
                    ideal: 720,
                    max: 1080
                },
                width: {
                    min: 480,
                    ideal: 720,
                    max: 1080
                }
            },
        });
        setMyStream(stream);
        const ans = await peer.getAnswer(offer);
        socket.emit(HANDLE_CREATED_ANSWERE, { to: from, ans });
        setUiOfLiveCalling({ ...uiOfLiveCalling, connectButtonIsActive: true })

    }, [])

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }

        setUiOfLiveCalling({ ...uiOfLiveCalling, connectButtonIsActive: false })
    }, [myStream]);

    const handleAnswerehandler = useCallback(({ from, ans }) => {
        console.log("handleAnswerehandler called")
        peer.setLocalDescription(ans);
        console.log("protocol completed!");
        sendStreams();
    }, [sendStreams]);

    const handleDialCall = async () => {
        setIsConnecting(true);
        try {
            const res = await incoming_call_api(callId);
            if (res.status === 200) {
                console.log(res.data)
                setUiOfLiveCalling({ ...uiOfLiveCalling, dialButtonIsactive: false, disconnectButtonIsActive: true })
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "calling failed!")
        } finally {
            setIsConnecting(false);
        }
    }

    const handleIncomingNego = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit(PEER_NEGO_DONE, { to: from, ans });
        }, [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    const handleEndCall = useCallback(() => {
        myStream?.getTracks().forEach(track => track.stop());
        remoteStream?.getTracks().forEach(track => track.stop());
        setUiOfLiveCalling({ ...uiOfLiveCalling, disconnectButtonIsActive: false })

        toast.success("Call Ended!");
        navigate("/call");
    }, [])

    const eventHandlers = {
        [INITIATE_P2P]: initiateP2pHandler,
        [HANDLE_OFFER_CREATE_ANSWERE]: handleOfferCreateAnswereHandler,
        [HANDLE_ANSWERE]: handleAnswerehandler,
        [PEER_NEGO_NEEDED]: handleIncomingNego,
        [PEER_NEGO_FINAL]: handleNegoNeedFinal,
        [END_CALL]: handleEndCall
    }

    useSocketEvent(socket, eventHandlers);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        console.log("handle")
        socket.emit(PEER_NEGO_NEEDED, { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener(NEGOTIATION_NEEDED, handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener(NEGOTIATION_NEEDED, handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    const handleDisconnect = async () => {
        setRemoteStream();
        setUiOfLiveCalling({ ...uiOfLiveCalling, disconnectButtonIsActive: false })
        myStream?.getTracks().forEach(track => track.stop());
        remoteStream?.getTracks().forEach(track => track.stop());

        socket.emit(END_CALL, { to: remoteSocketId, roomId: callId })
        navigate("/call");
    }

    return (
        <Stack
            spacing={3}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            sx={{
                p: 2,
                height: "100%",
                position: "relative"
            }}
        >
            {uiOfLiveCalling.dialButtonIsactive &&
                <Stack>
                    {callingVariables.callingButtonIsActive && <Button onClick={handleDialCall}>Dial</Button>}
                </Stack>
            }

            {remoteStream && !uiOfLiveCalling.connectButtonIsActive && (
                <Stack
                    sx={{
                        p: 2,
                        height: "80%",
                        border: "2px solid pink",
                        width: "100%",
                        padding: "1",
                        alignItems: "center"
                    }}
                >
                    {/* <h1>My Stream</h1> */}
                    <ReactPlayer
                        playing
                        height="100%"
                        width="100%"
                        url={remoteStream}
                    />
                </Stack>
            )}

            {uiOfLiveCalling.connectButtonIsActive && <Button onClick={sendStreams}>Connect...</Button>}

            {myStream && (
                <Stack
                    sx={{
                        p: 1,
                        height: "30%",
                        width: "fit-content",
                        border: "2px solid black",
                        position: "absolute",
                        bottom: "0",
                        right: "0"
                    }}
                >
                    <ReactPlayer
                        playing
                        height="100%"
                        width="fit-content"
                        url={myStream}
                    />
                </Stack>
            )}
            {uiOfLiveCalling.disconnectButtonIsActive && <IconBtn title='Disconnect call' icon={<PhoneDisabledIcon color='error' fontSize='large' />} handleClick={handleDisconnect} />}


        </Stack>
    )
}

export default LiveCalling