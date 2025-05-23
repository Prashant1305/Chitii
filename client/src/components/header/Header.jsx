import { Add as AddIcon, AdminPanelSettings as AdminPanelSettingsIcon, Call as CallIcon, Chat as ChatIcon, Group as GroupIcon, Home as HomeIcon, Logout as LogoutIcon, Menu as MenuIcon, Notifications as NotificationIcon, Search as SearchIcon, AccountBox as AccountIcon } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Backdrop, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { Suspense, lazy } from 'react';
import { SiSocketdotio } from "react-icons/si";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { MyToggleUiValues } from '../../context/ToggleUi';
import IconBtn from './IconBtn';
const Search = lazy(() => import("../Dialogs/Search"));
const Notifications = lazy(() => import("../Dialogs/Notifications"));
const NewGroup = lazy(() => import("../Dialogs/NewGroup"));




function Header() {
    const navigate = useNavigate()
    const { uiState, setUiState } = MyToggleUiValues();
    const user = useSelector((state) => state.auth)
    const { notificationCount, newMessageAlert } = useSelector((state) => state.chat);

    const openSearchDialog = () => {
        // console.log("searched");
        // setIsSearch(!isSearch);
        setUiState((prev) => ({ ...prev, isSearch: !prev.isSearch }));

    }
    const handleMobile = () => {
        // console.log("mobile");
        setUiState((prev) => ({ ...prev, isMobileOpen: !prev.isMobileOpen }));

    }
    const openNewGroup = () => {
        // console.log("openNewGroup");
        // setIsNewGroup(!isNewGroup)
        setUiState((prev) => ({ ...prev, isNewGroup: !prev.isNewGroup }));

    }

    const openNotification = () => {
        // console.log("mobile");
        // setIsNotification(!isNotification);
        setUiState((prev) => ({ ...prev, isNotification: !prev.isNotification }));
    }

    return (
        <>
            <Box sx={{
                flexGrow: 1,
            }} >
                <AppBar position='static' sx={{
                    bgcolor: "#057ff8",
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
                            onClick={(e) => {
                                console.dir(e.currentTarget)
                                navigate("/")
                            }}
                        >
                            Chitti
                        </Typography>

                        {
                            uiState?.mobileBtnExist && <Box sx={{
                                display: { xs: "block", sm: "none" },
                            }}>
                                {
                                    !uiState?.isMobileOpen ?
                                        (
                                            <Tooltip title="menu">
                                                <IconButton color='inherit' onClick={handleMobile}>
                                                    <MenuIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) :
                                        (
                                            <Tooltip title="back">
                                                <IconButton sx={{
                                                    color: "rgba(255, 255, 255, 0.9)",
                                                }}
                                                    onClick={handleMobile}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                }
                            </Box>
                        }

                        <Box sx={{ flexGrow: 1 }} />
                        <Box display={"flex"}
                            flexDirection={"row"}>
                            <IconBtn title={"Home"} icon={<HomeIcon />} pathname={"/"} />
                            {user.isAdmin && <IconBtn title={"Admin Services"} icon={<AdminPanelSettingsIcon />} pathname={"/admin"} />}
                            <IconBtn title={"Chats"} icon={<ChatIcon />} pathname={"/chat"} />
                            <IconBtn title={"Search"} icon={<SearchIcon />} handleClick={openSearchDialog} />
                            <IconBtn title={"New Group"} icon={<AddIcon />} handleClick={openNewGroup} />
                            <IconBtn title={"Manage Groups"} icon={<GroupIcon />} pathname={"/groups"} />
                            <IconBtn title={"Notification"} icon={< NotificationIcon />} value={notificationCount + newMessageAlert.length} handleClick={openNotification} />
                            <IconBtn title={'Call'} icon={<CallIcon />} pathname={"/call"} />
                            <IconBtn title={"Profile"} icon={<AccountIcon />} handleClick={() => {
                                setUiState((prev) => {
                                    return { ...prev, isProfileSectionOn: !prev.isProfileSectionOn }
                                })
                            }} />
                            <IconBtn title={"Logout"} icon={<LogoutIcon />} pathname={"/signout"} />

                            <IconBtn title={'Status'} icon={<SiSocketdotio color={uiState?.isOnline ? "rgb(2, 245, 124)" : "rgb(245, 2, 51"} style={{ fontWeight: 'bold' }} />} />

                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>

            {
                uiState?.isSearch && <Suspense fallback={<Backdrop open />}><Search /></Suspense>
            }
            {
                uiState?.isNotification && <Suspense fallback={<Backdrop open />}><Notifications /></Suspense>
            }{
                uiState?.isNewGroup && <Suspense fallback={<Backdrop open />}><NewGroup /></Suspense>
            }

        </>
    )
}
export default Header