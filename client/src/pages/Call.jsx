import FriendsOfUser from '../components/Call/FriendsOfUser'
import { Box, Drawer, Grid, Skeleton, Typography } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MyToggleUiValues } from '../context/ToggleUi'
import LiveCalling from '../components/Call/LiveCalling'
import { get_my_friends_api } from '../utils/ApiUtils'


function Call() {
    const params = useParams();
    const callId = params.callId;
    const { uiState, setUiState } = MyToggleUiValues()
    const [friendsList, setFriendsList] = useState([])
    const [friendsListIsLoading, setFriendsListIsLoading] = useState(false)

    const fetchFriendsOfUser = async () => {
        setFriendsListIsLoading(true)
        try {
            const res = await get_my_friends_api();
            setFriendsList(res.data.message);
        }
        catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || "failed to retrive messages")
        }
        finally {
            setFriendsListIsLoading(false)
        }
    }

    useEffect(() => {
        setUiState((prev) => ({ ...prev, mobileBtnExist: true }))
        fetchFriendsOfUser();
        return () => {
            setUiState((prev) => ({ ...prev, mobileBtnExist: false }))
        };
    }, [])

    return (
        <Grid container height={"calc(100vh - 4rem)"}>
            <Grid item
                sm={4}
                md={4}
                lg={4}
                sx={{
                    display: { xs: "none", sm: "block" },
                    backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    border: "1px solid white"
                }} height={"100%"} >
                {
                    friendsListIsLoading ? <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width={"90%"} height={"90%"}
                        sx={{
                            margin: "auto",
                            mt: "2rem",
                        }}
                    /> :
                        <FriendsOfUser friendsList={friendsList} callId={callId} />
                }
            </Grid>

            <Grid item
                xs={12}
                sm={8}
                md={8}
                lg={8}
                height={"100%"}
                sx={{
                    backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                }} >
                {callId ? <LiveCalling callId={callId} /> : <Box height={"100%"}>
                    <Typography
                        p={"2rem"}
                        variant='h4'
                        textAlign={"center"}>
                        Call your friends over internet
                    </Typography>
                </Box>}
            </Grid>
            {false ? <Skeleton /> : (<Drawer
                PaperProps={{
                    sx: {
                        width: "50vw",
                        display: {
                            xs: "block",
                            sm: "none"
                        },
                        height: "calc(100vh - 4rem)",
                        top: "4rem",
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))"
                    }
                }}
                open={uiState.isMobileOpen} onClose={() => {
                    setUiState({ ...uiState, isMobileOpen: false })
                }}>
                {
                    friendsListIsLoading ? <Skeleton
                        animation="wave"
                        variant="rectangular"
                        height={"100%"}
                        width={"100%"} />
                        :
                        <FriendsOfUser friendsList={friendsList} callId={callId} />
                }
            </Drawer>
            )}
        </Grid>
    )
}

export default Call