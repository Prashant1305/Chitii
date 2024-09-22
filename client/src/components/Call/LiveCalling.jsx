import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Button, CardMedia, IconButton, Stack } from '@mui/material';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { GetSocket } from '../../context/SocketConnectContext';
import ReactPlayer from "react-player";
import { useSelector } from 'react-redux';
import { incoming_call_api } from '../../utils/ApiUtils';
import { toast } from 'react-toastify';

import { useSocketEvent } from '../../hooks/socket_hooks';
import { CLIENT_CREATE_OFFER, END_CALL, HANDLE_ANSWERE, HANDLE_CREATED_ANSWERE, HANDLE_OFFER_CREATE_ANSWERE, INITIATE_P2P, NEGOTIATION_NEEDED, PEER_NEGO_DONE, PEER_NEGO_FINAL, PEER_NEGO_NEEDED } from '../constants/events';
import peer from '../lib/peer';
import IconBtn from '../header/IconBtn';

function LiveCalling({ callId }) {
    const socket = GetSocket()
    const { user } = useSelector(state => state.auth)
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState()
    const [remoteUserId, setRemoteUserId] = useState();
    const [searchParams] = useSearchParams();
    const [uiOfLiveCalling, setUiOfLiveCalling] = useState({
        connectButtonIsActive: searchParams.get('received') ? true : false,
        dialButtonIsactive: true,
        disconnectButtonIsActive: false
    })
    const navigate = useNavigate()

    const initiateP2pHandler = useCallback(async (data) => { // data-(to:userId of receiver / otherPerson)
        console.log(INITIATE_P2P, data);
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
        setRemoteUserId(data.userId);
        setMyStream(stream);
        socket.emit(CLIENT_CREATE_OFFER, { to: data.userId, offer })
    }, [remoteUserId, socket])


    const handleOfferCreateAnswereHandler = useCallback(async ({ from, offer }) => {
        console.log(HANDLE_OFFER_CREATE_ANSWERE, { from, offer })
        setRemoteUserId(from);
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
        setUiOfLiveCalling({ ...uiOfLiveCalling, connectButtonIsActive: true, disconnectButtonIsActive: true, dialButtonIsactive: false })
    }, [])

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleAnswerehandler = useCallback(({ from, ans }) => {
        console.log(HANDLE_ANSWERE, { from, ans })
        peer.setLocalDescription(ans);

        setUiOfLiveCalling({ ...uiOfLiveCalling, disconnectButtonIsActive: true })
        sendStreams();
    }, [sendStreams]);

    const handleDialCall = async () => {
        const toastId = toast.loading("Calling...")
        try {
            const res = await incoming_call_api(callId);
            if (res.status === 200) {
                toast.update(toastId, {
                    render: res?.data?.message || "Call connected succesfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
                setUiOfLiveCalling({ ...uiOfLiveCalling, dialButtonIsactive: false })
            } else {
                toast.update(toastId, {
                    render: res?.data?.message || "OOPS",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
        } catch (error) {
            console.log(error)
            toast.update(toastId, {
                render: error?.response?.data?.message || "calling failed!",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
        }
    }

    const handleIncomingNego = useCallback(
        async ({ from, offer }) => {
            console.log(PEER_NEGO_NEEDED, { from, offer })
            const ans = await peer.getAnswer(offer);
            socket.emit(PEER_NEGO_DONE, { to: from, ans });
        }, [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        console.log(PEER_NEGO_FINAL, { ans })
        await peer.setLocalDescription(ans);
    }, []);

    const handleEndCall = () => {
        console.log(END_CALL)
        setRemoteStream();
        setUiOfLiveCalling({
            ...uiOfLiveCalling, dialButtonIsactive: true,
            disconnectButtonIsActive: false
        })
        myStream?.getTracks().forEach(track => track.stop());
        remoteStream?.getTracks().forEach(track => track.stop());
        toast.success("Call Ended!");
        navigate("/call");
    }

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
        console.log(NEGOTIATION_NEEDED)
        const offer = await peer.getOffer();
        socket.emit(PEER_NEGO_NEEDED, { offer, to: remoteUserId });
    }, [remoteUserId, socket]);

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

    const handleDisconnect = () => {
        handleEndCall()
        socket.emit(END_CALL, { to: remoteUserId, roomId: callId })
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
                    <Button onClick={handleDialCall}>Dial</Button>
                </Stack>
            }

            {remoteStream && (
                <Stack
                    sx={{
                        p: 2,
                        height: "80%",
                        // border: "2px solid pink",
                        width: "100%",
                        padding: "1",
                        alignItems: "center"
                    }}
                >
                    <ReactPlayer
                        playing
                        height="100%"
                        width="100%"
                        url={remoteStream}
                    />
                </Stack>
            )}

            {uiOfLiveCalling.connectButtonIsActive && remoteStream && <Button onClick={() => {
                setUiOfLiveCalling({ ...uiOfLiveCalling, connectButtonIsActive: false });
                sendStreams()
            }}>Connect ...</Button>}

            {myStream && (
                <Stack
                    sx={{
                        p: 1,
                        height: "30%",
                        width: "fit-content",
                        // border: "2px solid black",
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
                        muted
                    />
                </Stack>
            )}
            {uiOfLiveCalling.disconnectButtonIsActive && <IconBtn title='Disconnect call' icon={<PhoneDisabledIcon color='error' fontSize='large' />} handleClick={handleDisconnect} />}
        </Stack>
    )
}

export default LiveCalling