import { Grid, Skeleton, Stack } from '@mui/material'
import React from 'react'

export const LayoutLoader = () => {
    return (
        <Grid container height={"calc(100vh - 4rem)"} spacing={"1rem"} sx={{
            backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))",
        }}>
            <Grid item
                sm={4}
                md={3}
                sx={{
                    display: { xs: "none", sm: "block" },
                }} height={"100%"} ><Skeleton variant='rectangular' height={"100vh"} />
            </Grid>
            <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"} >
                <Stack spacing={"1rem"}>
                    {
                        Array.from({ length: 10 }).map((_, index) => (
                            <Skeleton variant='rectangular' key={index} height={"5rem"} />
                        ))
                    }
                </Stack>
            </Grid>
            <Grid item md={4} lg={3} sx={{
                display: { xs: "none", md: "block" },
                padding: "2rem",
            }} height={"100%"} ><Skeleton variant='rectangular' height={"100vh"} />
            </Grid>
        </Grid>)
}