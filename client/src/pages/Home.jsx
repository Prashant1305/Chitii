import { Box, Typography } from '@mui/material'
import React from 'react'

function Home() {
    return (
        <Box height={"100%"}>
            <Typography
                p={"2rem"}
                variant='h4'
                textAlign={"center"}>
                Welcome to Chitti
            </Typography>
        </Box>
    )
}

export default Home