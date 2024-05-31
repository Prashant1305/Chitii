import { Add as AddIcon, AdminPanelSettings as AdminPanelSettingsIcon, Chat as ChatIcon, Group as GroupIcon, Home as HomeIcon, Logout as LogoutIcon, Menu as MenuIcon, Notifications as NotificationIcon, Search as SearchIcon } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Backdrop, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyToggleUiValues } from '../../context/ToggleUi';
import IconBtn from './IconBtn';
const Search = lazy(() => import("../Dialogs/Search"));
const Notifications = lazy(() => import("../Dialogs/Notifications"));
const NewGroup = lazy(() => import("../Dialogs/NewGroup"));



function Header() {
    const navigate = useNavigate()

    const { isMobileOpen, setIsmobileOpen, isSearch, setIsSearch, isNewGroup, setIsNewGroup, isNotification, setIsNotification, mobileBtnExist } = MyToggleUiValues();

    const openSearchDialog = () => {
        console.log("searched");
        setIsSearch(!isSearch);
    }
    const handleMobile = () => {
        console.log("mobile");
        setIsmobileOpen(!isMobileOpen);
    }
    const openNewGroup = () => {
        console.log("openNewGroup");
        setIsNewGroup(!isNewGroup)
    }

    const openNotification = () => {
        console.log("mobile");
        setIsNotification(!isNotification);
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
                            mobileBtnExist && <Box sx={{
                                display: { xs: "block", sm: "none" },
                            }}>
                                {
                                    !isMobileOpen ?
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
                                                    onClick={() => { setIsmobileOpen((prev) => !prev) }}>
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
                            <IconBtn title={"Admin Services"} icon={<AdminPanelSettingsIcon />} pathname={"/admin"} /> {/*add conditions for user, if admin*/}
                            <IconBtn title={"Search"} icon={<ChatIcon />} pathname={"/chat"} />
                            <IconBtn title={"Search"} icon={<SearchIcon />} handleClick={openSearchDialog} />
                            <IconBtn title={"New Group"} icon={<AddIcon />} handleClick={openNewGroup} />
                            <IconBtn title={"Manage Groups"} icon={<GroupIcon />} pathname={"/groups"} />
                            <IconBtn title={"Notification"} icon={< NotificationIcon />} handleClick={openNotification} />

                            <IconBtn title={"Logout"} icon={<LogoutIcon />} pathname={"/signout"} />

                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>

            {
                isSearch && <Suspense fallback={<Backdrop open />}><Search /></Suspense>
            }
            {
                isNotification && <Suspense fallback={<Backdrop open />}><Notifications /></Suspense>
            }{
                isNewGroup && <Suspense fallback={<Backdrop open />}><NewGroup /></Suspense>
            }

        </>
    )
}
export default Header