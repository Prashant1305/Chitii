import { Chat as ChatIcon, Close as CloseIcon, Dashboard as DashboardIcon, Groups as GroupsIcon, Home as HomeIcon, ManageAccounts as ManageAccountsIcon, Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyToggleUiValues } from '../../context/ToggleUi';
import IconBtn from "./IconBtn";
const Search = lazy(() => import("../Dialogs/Search"));
const Notifications = lazy(() => import("../Dialogs/Notifications"));
const NewGroup = lazy(() => import("../Dialogs/NewGroup"));


function AdminHeader() {
    const navigate = useNavigate()

    const { isMobileOpen, setIsmobileOpen, isSearch, setIsSearch, isNewGroup, setIsNewGroup, isNotification, setIsNotification, mobileBtnExist } = MyToggleUiValues();

    const handleMobile = () => {
        console.log("mobile");
        setIsmobileOpen(!isMobileOpen);
    }

    return (
        <>
            <Box sx={{
                flexGrow: 1,

            }} >
                <AppBar position='static' sx={{
                    backgroundImage: "linear-gradient(to right, #057ff8, red);",
                    minHeight: "4rem",
                    justifyContent: "center"
                }} >
                    <Toolbar>
                        <Typography variant="h6"
                            sx={{
                                display: { xs: "none", sm: "block" },
                                "&:hover": {
                                    cursor: "pointer"
                                }
                            }}
                            onClick={() => { navigate("/") }}
                        >
                            Chitti Admin
                        </Typography>

                        {
                            mobileBtnExist && <Box sx={{
                                display: { xs: "block", sm: "none" },
                            }}>
                                {
                                    !isMobileOpen ?
                                        (<Tooltip title="menu">
                                            <IconButton color='inherit' onClick={handleMobile}>
                                                <MenuIcon />
                                            </IconButton>
                                        </Tooltip>) :
                                        (
                                            <Tooltip title="back">
                                                <IconButton sx={{
                                                    color: "rgba(255, 255, 255, 0.9)",
                                                }}
                                                    onClick={() => { setIsmobileOpen((prev) => !prev) }}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                }
                            </Box>
                        }

                        <Box sx={{ flexGrow: 1 }} />
                        <Box
                            display={"flex"}
                            flexDirection={"row"}
                            sx={{
                                display: { xs: "none", sm: "flex" },
                            }}
                        >
                            <IconBtn title={"Dashboard"} icon={<DashboardIcon />} pathname={"/admin"} />
                            <IconBtn title={"messages"} icon={<ChatIcon />} pathname={"/admin/message"} />
                            <IconBtn title={"Users"} icon={<ManageAccountsIcon />} pathname={"/admin/users"} />
                            <IconBtn title={"chats"} icon={<GroupsIcon />} pathname={"/admin/chats"} />
                            <IconBtn title={"Home"} icon={<HomeIcon />} pathname={"/"} />

                        </Box>
                    </Toolbar>
                </AppBar>
            </Box >

        </>
    )
}
export default AdminHeader