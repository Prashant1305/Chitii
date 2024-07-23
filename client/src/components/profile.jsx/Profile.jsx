import { Avatar, Stack, Typography } from '@mui/material'
import React from 'react'
import { Face as FaceIcon, AlternateEmail as UserNameIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import moment from "moment"
import { useSelector } from 'react-redux';
import { transformImage } from '../lib/features';

function Profile() {
    const user = useSelector(state => state.auth);

    return (
        <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
            <Avatar sx={{
                width: 200,
                height: 200,
                objectFit: "contain",
                marginBottom: "1rem",
                border: "5px solid white"
            }}
                src={transformImage(user?.user?.avatar_url)} alt="no avatar found" />
            <ProfileCard heading={"Bio"} text={user?.user?.bio || "bio not available"} />
            <ProfileCard heading={"Username"} text={user?.user?.user_name || "No username found"} Icon={<UserNameIcon />} />
            <ProfileCard heading={"Name"} text={user?.user?.full_name || "full name not availabale"} Icon={<FaceIcon />} />
            <ProfileCard heading={"Joined On"} text={moment(user?.user?.createdAt).fromNow() || "joining Date not availabale"} Icon={<CalendarIcon />} />

        </Stack>
    )
}
const ProfileCard = ({ text, Icon, heading }) => (
    <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        color={"white"}
        textAlign={"center"}
    >
        {Icon && Icon}
        <Stack>
            <Typography variant='body1'>{text}</Typography>
            <Typography color={"gray"} variant='caption'>{heading}</Typography>
        </Stack>
    </Stack>
)
export default Profile