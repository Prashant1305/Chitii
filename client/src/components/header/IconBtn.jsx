import { Box, IconButton, Tooltip } from '@mui/material';
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

function IconBtn({ title, icon, handleClick = () => { }, pathname }) {
    const navigate = useNavigate();
    const currUrl = useLocation();

    return (
        <Box sx={{
            borderBottom: currUrl.pathname === pathname ? "2px solid cyan" : "none",
        }}  >
            <Tooltip title={title} onClick={() => {
                navigate(pathname);
                handleClick();
            }}>
                <IconButton color='inherit' >
                    {icon}
                </IconButton>
            </Tooltip>
        </Box>
    )
}

export default IconBtn