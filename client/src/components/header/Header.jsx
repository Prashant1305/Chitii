import { AppBar, Backdrop, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { Suspense, lazy, useState } from 'react'
import { Menu as MenuIcon, Search as SearchIcon, Add as AddIcon, Group as GroupIcon, Logout as LogoutIcon, Notifications as NotificationIcon, Chat as ChatIcon, KeyboardBackspace as KeyboardBackspaceIcon, AdminPanelSettings as AdminPanelSettingsIcon } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom'
import { MyToggleUiValues } from '../../context/ToggleUi';
const Search = lazy(() => import("../Dialogs/Search"));
const Notifications = lazy(() => import("../Dialogs/Notifications"));
const NewGroup = lazy(() => import("../Dialogs/NewGroup"));
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


function Header() {
    const navigate = useNavigate()
    // const [isMobileOpen, setIsmobileOpen] = useState(false);
    // const [isSearch, setIsSearch] = useState(false);
    // const [isNewGroup, setIsNewGroup] = useState(false);
    // const [isNotification, setIsNotification] = useState(false);
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
    const navigateToGroup = () => {
        console.log("groups");
        navigate("/groups")
    }
    const logoutHandler = () => {
        console.log("logged out");
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
                            onClick={() => { navigate("/") }}
                        >
                            Chitti
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
                        <Box >
                            <IconBtn title={"Admin Services"} icon={<AdminPanelSettingsIcon />} onClick={() => { navigate("/") }} />
                            <IconBtn title={"Search"} icon={<ChatIcon />} onClick={() => { navigate("/chat") }} />
                            <IconBtn title={"Search"} icon={<SearchIcon />} onClick={openSearchDialog} />
                            <IconBtn title={"New Group"} icon={<AddIcon />} onClick={openNewGroup} />
                            <IconBtn title={"Manage Groups"} icon={<GroupIcon />} onClick={navigateToGroup} />
                            <IconBtn title={"Notification"} icon={< NotificationIcon />} onClick={openNotification} />

                            <IconBtn title={"Logout"} icon={<LogoutIcon />} onClick={logoutHandler} />

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
const IconBtn = ({ title, icon, onClick }) => {
    return (<Tooltip title={title}>
        <IconButton color='inherit' onClick={onClick}>
            {icon}
        </IconButton>
    </Tooltip>)
}
export default Header