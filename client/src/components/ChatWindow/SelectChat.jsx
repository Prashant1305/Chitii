import React from 'react'
import { Box, Typography } from '@mui/material'


function SelectChat() {
    return (
        <Box height={"100%"}>
            <Typography
                p={"2rem"}
                variant='h4'
                textAlign={"center"}>
                Select conversation to start chat
            </Typography>
        </Box>
    )
}

export default SelectChat