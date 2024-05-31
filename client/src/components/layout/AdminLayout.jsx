import { Chat as ChatIcon, Dashboard as DashboardIcon, Home as HomeIcon, KeyboardBackspace as KeyboardBackspaceIcon, ManageAccounts as ManageAccountsIcon } from "@mui/icons-material";
import { Drawer, IconButton, Stack, Tooltip, Typography, styled } from '@mui/material';
import { React, useEffect } from 'react';
import { Link as LinkCopmenent, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MyToggleUiValues } from '../../context/ToggleUi';
import AdminHeader from '../header/AdminHeader';

function AdminLayout() {
    const { isMobileOpen, setIsmobileOpen, mobileBtnExist, setMobileBtnExist } = MyToggleUiValues();
    const navigate = useNavigate();
    const location = useLocation();

    const backBtn = <Tooltip title="back">
        <IconButton sx={{
            position: "absolute",
            top: "0.7rem",
            left: "0.7rem",
            color: "rgba(0,0,0, 0.9)",
            "&:hover": {
                color: "rgba(50, 209, 22, 0.9)",
                bgcolor: "rgba(0, 0, 0, 0.6)"
            }
        }}
            onClick={() => {
                navigate(-1);
            }}>
            <KeyboardBackspaceIcon />

        </IconButton>
    </Tooltip>

    const Link = styled(LinkCopmenent)`
        text-decoration:none;
        border-radius:2rem;
        padding:1rem 2rem;
        color:black;
        &:hover{
            color:rgba(0,0,0,0.54);
        }`

    const SideBar = ({ w = "50vw" }) => {

        return (
            <Stack width={w} direction={"column"} p={"3rem"} spacing={"3rem"}>
                <Typography variant="h5" textTransform={"uppercase"}>
                    Admin
                </Typography>
                <Stack spacing={"1rem"} >

                    <Link to={"/admin"}>
                        <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
                            <DashboardIcon />
                            <Typography>Dashboard</Typography>
                        </Stack>
                    </Link>

                    <Link to={'/admin/message'}><Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
                        <ChatIcon />
                        <Typography>Messages</Typography>
                    </Stack></Link>

                    <Link to={'/admin/users'}><Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
                        <ManageAccountsIcon />
                        <Typography>Users</Typography>
                    </Stack></Link>

                    <Link to={'/'}><Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
                        <HomeIcon />
                        <Typography>Home</Typography>
                    </Stack></Link>

                </Stack>

            </Stack>
        )
    }

    useEffect(() => {
        setMobileBtnExist(true);
        return () => { setMobileBtnExist(false); }
    })

    return (
        <>
            <AdminHeader />
            <Stack

                sx={{
                    backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
                    display: 'flex',
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    padding: "1rem 3rem",
                    height: "100%",
                    overflow: "auto",
                    height: "calc(100vh - 4rem)"
                }}>
                {backBtn}
                <Outlet />
                {
                    <Drawer PaperProps={{
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
                        open={isMobileOpen} onClose={() => { setIsmobileOpen(false) }}>
                        <SideBar />
                    </Drawer>
                }
            </Stack>
        </>
    )
}

export default AdminLayout