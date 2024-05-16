import { AppBar, Backdrop, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { Suspense, lazy, useState } from 'react'
import { Menu as MenuIcon, Search as SearchIcon, Add as AddIcon, Group as GroupIcon, Logout as LogoutIcon, Notifications as NotificationIcon } from "@mui/icons-material"
import { useNavigate } from 'react-router-dom'
const Search = lazy(() => import("../Dialogs/Search"));
const Notifications = lazy(() => import("../Dialogs/Notifications"));
const NewGroup = lazy(() => import("../Dialogs/NewGroup"));


function Header() {
    const navigate = useNavigate()
    const [isMobile, setIsmobile] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [isNewGroup, setIsNewGroup] = useState(false);
    const [isNotification, setIsNotification] = useState(false);

    const openSearchDialog = () => {
        console.log("searched");
        setIsSearch(!isSearch);
    }
    const handleMobile = () => {
        console.log("mobile");
        setIsmobile(!isMobile);
    }
    const openNewGroup = () => {
        console.log("openNewGroup");
        setIsNewGroup(!isNewGroup)
    }
    const navigateToGroup = () => {
        console.log("mobile");
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
            <Box sx={{ flexGrow: 1 }} height={"4rem"}>
                <AppBar position='static' sx={{ bgcolor: "#ea7070" }} >
                    <Toolbar>
                        <Typography variant="h6"
                            sx={{
                                display: { xs: "none", sm: "block" },
                            }}>

                            Chitti</Typography>
                        <Box sx={{
                            display: { xs: "block", sm: "none" },
                        }}>
                            <IconButton color='inherit' onClick={handleMobile}><MenuIcon /></IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box >
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