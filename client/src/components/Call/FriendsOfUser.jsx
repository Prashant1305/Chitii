import { Avatar, AvatarGroup, Box, Link, Stack, Typography } from '@mui/material';
import React from 'react'
import { motion } from 'framer-motion';
import FriendsItem from './FriendsItem';
import { useSelector } from 'react-redux';



function FriendsOfUser({ friendsList, callId, index }) {
    // console.log(friendsList)
    const { onlineUsersArray } = useSelector(state => state.onlineUsersArray);
    return (
        <Stack width={"100%"} direction={"column"} overflow={"auto"} height={"100%"}>
            {
                friendsList.map((friend) => {
                    const { avatar_url, _id, user_name, } = friend;
                    let isOnline = onlineUsersArray?.includes(_id + "")
                    return (<FriendsItem
                        index={index}
                        isOnline={isOnline}
                        avatar_url={avatar_url}
                        user_name={user_name}
                        _id={_id}
                        key={_id}
                        sameCaller={callId + "" === _id + ""}
                    />)
                })
            }
        </Stack>

    )
}

export default FriendsOfUser