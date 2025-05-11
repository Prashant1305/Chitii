import CallIcon from '@mui/icons-material/Call';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import ReactPlayer from "react-player";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { GetSocket } from '../../context/SocketConnectContext';

import { useSocketEvent } from '../../hooks/socket_hooks';
import { CALL_INCOMING_RESPONSE, END_CALL, INITIAL_ANSWER, INITIAL_OFFER, INITIATE_P2P, RENEGOTIATE_ANSWER, RENEGOTIATE_OFFER, REQUEST_CALL, RINGING, SEND_ME_YOUR_STREAM } from '../constants/events';
import { PeerServices } from '../lib/peerServiceManager';


function LiveCalling({ friendsList, callId }) {
    const socket = GetSocket()
    const [myStream, setMyStream] = useState()
    const [remoteStreams, setRemoteStreams] = useState([]);//{stream:stream,peer:peer}

    const [uiOfLiveCalling, setUiOfLiveCalling] = useState({
        dialButtonIsactive: true,
        disconnectButtonIsActive: false
    })
    const navigate = useNavigate()
    // Helper Function to Add a Remote Stream to State
    const addRemoteStream = (stream) => {
        setRemoteStreams((prevStreams) => {
            const streamExists = prevStreams.some(
                (existingStream) => existingStream.id === stream.id
            );
            if (!streamExists) {
                return [...prevStreams, stream];
            }
            return prevStreams;
        });
    };
    const sendMyStreamToPeers = useCallback(() => {
        if (myStream) {
            PeerServices.peerServices.forEach((peer, key) => {
                // Add local tracks to the connection
                for (let track of myStream.getTracks()) {
                    peer.peer.addTrack(track, myStream);
                }
                console.dir(peer.peer);
            })
        }
    }, [myStream]);

    const initiateP2pHandler = useCallback(async (data) => { // data-(from:userId of receiver / otherPerson)
        setUiOfLiveCalling({ ...uiOfLiveCalling, dialButtonIsactive: false })
        console.log(INITIATE_P2P, data);
        const peer = PeerServices.getPeerService(data.from);
        const offer = await peer.getOffer();

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
        socket.emit(INITIAL_OFFER, { to: data.from, offer })
    }, [socket])


    const handleInitialOfferCreateAnswereHandler = async ({ from, offer }) => {
        console.log(INITIAL_OFFER + "triggered")
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

        const peer = PeerServices.getPeerService(from);

        // Listen for incoming tracks
        peer.peer.ontrack = (event) => {
            console.log('Track received:')
            console.dir(event);
            addRemoteStream({ stream: event.streams[0], peer });
        };

        // Handle negotiationneeded event
        peer.peer.onnegotiationneeded = async () => {
            const newOffer = await peer.getOffer();
            console.log("negotiation needed")
            socket.emit(RENEGOTIATE_OFFER, { to: from, offer: newOffer });
        };

        // when peer connection is closed
        peer.peer.onconnectionstatechange = () => {
            console.log(`Connection state: ${peer.peer.connectionState}`);
            if (peer.peer.connectionState === "closed" || peer.peer.connectionState === "failed") {
                console.log("Peer connection is closed.");

                setRemoteStreams((prevArray) =>
                    prevArray.filter((item) => item.peer !== peer) // objects will be compared via refrence
                );
                PeerServices.deletePeerService(from)
            } else { // we wiil update connection statechange in remoteStream arrray
                setRemoteStreams((prevArray) => prevArray.map((item) => item.peer === peer ? { stream: item.stream, peer } : item))

            }
        };

        const ans = await peer.getAnswer(offer);
        socket.emit(INITIAL_ANSWER, { to: from, ans });

        setUiOfLiveCalling({ ...uiOfLiveCalling, disconnectButtonIsActive: true, dialButtonIsactive: false })
    };

    const handleInitialAnswerehandler = async ({ from, ans }) => {
        console.log(INITIAL_ANSWER, { from, ans })

        const peer = PeerServices.getPeerService(from)

        // Set the received answer as the remote description
        await peer.setRemoteDescription(ans);

        // Add local tracks to the connection
        for (let track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }

        // Listen for incoming tracks when added
        peer.peer.ontrack = (event) => {
            console.log('Track received:', event.streams[0]);
            addRemoteStream({ stream: event.streams[0], peer });
        };

        // Handle negotiationneeded event
        peer.peer.onnegotiationneeded = async () => {
            const newOffer = await peer.getOffer();
            console.log("negotiation needed")
            socket.emit(RENEGOTIATE_OFFER, { to: from, offer: newOffer });
        };

        // when peer connection is closed
        peer.peer.onconnectionstatechange = () => {

            console.log(`Connection state: ${peer.peer.connectionState}`);
            if (peer.peer.connectionState === "closed" || peer.peer.connectionState === "failed") {
                console.log("Peer connection is closed.");

                setRemoteStreams((prevArray) =>
                    prevArray.filter((item) => item.peer !== peer) // objects will be compared via refrence
                );
                PeerServices.deletePeerService(from)
            } else { // we wiil update connection statechange in remoteStream arrray
                setRemoteStreams((prevArray) => prevArray.map((item) => item.peer === peer ? { stream: item.stream, peer } : item))

            }
        };

        // send socket event to other user for sending his stream after 3seconds
        setTimeout(() => {
            socket.emit(SEND_ME_YOUR_STREAM, { to: from });
        }, 100);

        setUiOfLiveCalling({ ...uiOfLiveCalling, disconnectButtonIsActive: true });
    };

    const [toastId, setToastId] = useState(null);

    const handleDialCall = async () => {
        const id = toast.loading("Calling...");
        setToastId(id);
        socket.emit(REQUEST_CALL, { to: callId });
    };

    const updateRingingStatus = useCallback(({ }) => {
        if (toastId) {
            toast.update(toastId, {
                render: "Ringing...",
                type: "info",
                isLoading: false,
            });
        }
    }, [toastId]);

    const handleIncomingRepsonseByUpdatingToast = useCallback(async ({ response }) => {
        if (toastId) {
            toast.update(toastId, {
                render: response === "ACCEPTED" ? "Call Accepted" : "Call Declined",
                type: response === "ACCEPTED" ? "success" : "error",
                isLoading: false,
                autoClose: 2000,
            });
            setToastId(null);
        }
    }, [toastId]);

    const handleRengotiateOffer = async ({ from, offer }) => {
        console.log("received negotiation offer")
        const peer = PeerServices.getPeerService(from);
        const ans = await peer.getAnswer(offer);

        socket.emit(RENEGOTIATE_ANSWER, { to: from, ans });
    }

    const handleRengotiateAnswere = async ({ from, ans }) => {
        console.log("received negotiation ans")

        const peer = PeerServices.getPeerService(from);
        await peer.setRemoteDescription(ans);
    }

    const handleEndCall = () => {
        // 1. Notify other peer(s)
        // socket.emit(END_CALL, { to: callId });

        // 2. Stop all local media tracks
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
        }

        // 3. Clear remote streams and local stream state
        setRemoteStreams([]);
        setMyStream(null);

        // 4. Disconnect all peer connections
        PeerServices.clearAllPeerServices();

        // 5. Update UI and navigate away
        setUiOfLiveCalling({
            ...uiOfLiveCalling,
            dialButtonIsactive: true,
            disconnectButtonIsActive: false
        });
        toast.success("Call Ended!");
        navigate("/call");
    }

    const eventHandlers = {
        [RINGING]: updateRingingStatus,
        [CALL_INCOMING_RESPONSE]: handleIncomingRepsonseByUpdatingToast,
        [INITIATE_P2P]: initiateP2pHandler,
        [INITIAL_OFFER]: handleInitialOfferCreateAnswereHandler,
        [INITIAL_ANSWER]: handleInitialAnswerehandler,
        [SEND_ME_YOUR_STREAM]: sendMyStreamToPeers,
        [RENEGOTIATE_OFFER]: handleRengotiateOffer,
        [RENEGOTIATE_ANSWER]: handleRengotiateAnswere,
        [END_CALL]: handleEndCall
    }

    useSocketEvent(socket, eventHandlers);

    return (
        <Stack
            spacing={2}
            sx={{
                p: 2,
                height: "100%",
                width: "100%",
                background: "linear-gradient(135deg, #232946 0%, #393e6e 100%)",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Top Bar */}
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    p: 2,
                    zIndex: 2,
                }}
            >
                <Typography variant="h6" color="white">
                    Live Call
                </Typography>
                <Typography variant="body2" color="gray">
                    {callId}
                </Typography>
            </Box>

            {/* Remote Streams */}
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    width: "100%",
                    height: "70%",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 6,
                }}
            >
                {remoteStreams.length > 0 ? (
                    remoteStreams.map(({ stream, peer }) => (
                        <Box
                            key={uuidv4()}
                            sx={{
                                width: 400,
                                height: 300,
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: 3,
                                bgcolor: "#393e6e", // soft dark blue
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ReactPlayer
                                playing
                                width="100%"
                                height="100%"
                                url={stream}
                                style={{ background: "#000" }}
                            />
                            <Typography
                                sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: 8,
                                    bgcolor: "rgba(0,0,0,0.6)",
                                    color: "white",
                                    px: 1,
                                    borderRadius: 1,
                                    fontSize: 12
                                }}
                            >
                                {peer.peer.connectionState}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography color="gray" sx={{ fontStyle: "italic" }}>
                        Waiting for remote stream...
                    </Typography>
                )}
            </Stack>

            {/* Local Stream (Picture-in-Picture style) */}
            {myStream && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 32,
                        right: 32,
                        width: 180,
                        height: 120,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 4,
                        border: "2px solid #fff",
                        zIndex: 3,
                        bgcolor: "#111"
                    }}
                >
                    <ReactPlayer
                        playing
                        width="100%"
                        height="100%"
                        url={myStream}
                        muted
                        style={{ background: "#000" }}
                    />
                </Box>
            )}

            {/* Call Controls */}
            <Stack
                direction="row"
                spacing={3}
                sx={{
                    position: "absolute",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 4,
                }}
            >
                {uiOfLiveCalling.dialButtonIsactive && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CallIcon />}
                        onClick={handleDialCall}
                        sx={{ minWidth: 120, fontWeight: "bold" }}
                    >
                        Dial
                    </Button>
                )}
                {uiOfLiveCalling.disconnectButtonIsActive && (
                    <IconButton
                        color="error"
                        onClick={handleEndCall}
                        sx={{
                            bgcolor: "#fff",
                            '&:hover': { bgcolor: "#ffeaea" },
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            boxShadow: 2,
                        }}
                    >
                        <PhoneDisabledIcon fontSize="large" />
                    </IconButton>
                )}
            </Stack>
        </Stack>
    );
}

export default LiveCalling;