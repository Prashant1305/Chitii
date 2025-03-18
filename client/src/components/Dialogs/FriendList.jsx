import { Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material'
import React from 'react'
import UserItem from '../shared/UserItem'

function FriendList() {
    const closeHandler = () => {
        setUiState(prev => ({ ...prev, isFriendList: false }))
    }
    return (
        <Dialog open={uiState.isFriendList} onClose={closeHandler}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} width={"25rem"} spacing={"2rem"}>
                <DialogTitle textAlign={"center"} variant="h4">Friends</DialogTitle>
                <Typography variant='body1'>Members</Typography>
                <Stack>
                    {
                        isLoading ? (<Skeleton height={"10rem"} />) : allFriends.map((user) => (
                            <UserItem user={user} key={user._id} handler={selectMemberHandler} isAdded={selectedMembers.some((ele) => ele === user._id)} />
                        ))
                    }
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default FriendList