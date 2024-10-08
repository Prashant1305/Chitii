import { AdminPanelSettings as AdminPanelSettingsIcon, Message as MessageIcon, Group as GroupIcon, Person as PersonIcon, } from '@mui/icons-material'
import { Box, Container, Paper, Skeleton, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { CurveButton, SearchField } from '../../components/styles/StyledComponent'
import { DoughnutChart, LineChart } from '../../components/specific/Charts'
import { dashboard_stats_api } from '../../utils/ApiUtils'

function Dashboard() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await dashboard_stats_api();
                if (response.status === 200) {
                    setData(response.data.message);
                    setLoading(false);
                } else {
                    console.log(response.data.message);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [])

    const Appbar = (
        <Paper
            elevation={3}
            sx={{ padding: "2rem", margin: "2rem 0", borderRadius: "1rem" }}>
            <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
                <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />
                <SearchField placeholder='search...' />
                <CurveButton >Search</CurveButton>

                <Box flexGrow={1} />
                <Typography
                    display={{
                        xs: "none",
                        lg: "block",
                    }}
                    color={"rgba(0,0,0,0.7)"}
                    textAlign={"center"}>{moment().format("MMMM Do YYYY")}</Typography>
            </Stack>
        </Paper>
    )

    const Widgets = (
        <Stack
            direction={{
                xs: "column",
                sm: "row",
            }}
            spacing="2rem"
            justifyContent="space-between"
            alignItems={"center"}
            margin={"2rem 0"}
        >
            <Widget title={"Users"} Icon={<PersonIcon />} value={data?.usersCount} />
            <Widget title={"Chats"} Icon={<GroupIcon />} value={data?.groupChatCount} />
            <Widget title={"Messages"} Icon={<MessageIcon />} value={data?.messageCount} />
        </Stack>
    );
    return (
        <Container component={"main"}>
            {loading ? <Skeleton height={"90vh"} /> :
                <>
                    {Appbar}
                    <Stack direction={{ xs: "column", lg: "row" }} flexWrap={"wrap"} justifyContent={'center'} alignItems={{
                        xs: "center",
                        lg: "flex-start",
                    }}
                        sx={{ gap: "2rem" }}>
                        <Paper elevation={3} sx={{
                            padding: "2rem 3.5rem",
                            borderRadius: "1rem",
                            width: "100%",
                            maxWidth: "45rem"
                        }}>
                            <Typography>Last Messages</Typography>
                            <LineChart value={data.messageCountofLastSevenDays} />
                        </Paper >

                        <Paper elevation={3}
                            sx={{
                                padding: "1rem ",
                                borderRadius: "1rem",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: { xs: "100%", sm: "50%" },
                                position: "relative",
                                maxWidth: "25rem",
                            }}>
                            <DoughnutChart labels={['single chat', 'Group chats']} value={[data?.privateChatCount, data?.groupChatCount]} />
                            <Stack
                                position={"absolute"}
                                direction={"row"}
                                justifyContent={"center"}
                                alignItems={"center"}
                                spacing={"0.5rem"}
                                width={"100%"}
                                height={"100%"}
                            >
                                <GroupIcon /> <Typography>Vs </Typography>
                                <PersonIcon />
                            </Stack>
                        </Paper>
                    </Stack>
                    {Widgets}
                </>
            }
        </Container>
    )
}

const Widget = ({ title, value, Icon }) => (
    <Paper
        elevation={3}
        sx={{
            padding: "2rem",
            margin: "2rem 0",
            borderRadius: "1.5rem",
            width: "20rem",
        }}
    >
        <Stack alignItems={"center"} spacing={"1rem"}>
            <Typography
                sx={{
                    color: "rgba(0,0,0,0.7)",
                    borderRadius: "50%",
                    border: `5px solid rgb(0,0,0)`,
                    width: "5rem",
                    height: "5rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {value}
            </Typography>
            <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
                {Icon}
                <Typography>{title}</Typography>
            </Stack>
        </Stack>
    </Paper>
);
export default Dashboard