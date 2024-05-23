import { Button, Dialog, DialogTitle, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { sampleUsers } from '../constants/sampleData'
import UserItem from '../shared/UserItem'
import { v4 as uuid } from "uuid";

function AddMemberDialog({ addMember, isLoadingAddMember, chatId }) {
    const [members, setMembers] = useState(sampleUsers);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => (prev.includes(id)) ? prev.filter((ele) => ele !== id) : [...prev, id]);
    }

    const addMemberSubmitHandler = () => {
        console.log("add member submit handler got clicked");
        closeHandler();
    }

    const closeHandler = () => {
        setSelectedMembers([]);
        setMembers([])
        console.log("close add member dialog");
    }

    return (
        <Dialog open={false} onClose={closeHandler}>
            <Stack p={"2rem"} width={"25rem"} >
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                <Stack spacing={"1rem"}>
                    {
                        members.length > 0 ? members.map(i => (
                            <UserItem key={uuid()} user={i} handler={selectMemberHandler} isAdded={selectedMembers.includes(i._id)} />
                        )
                        ) : <Typography textAlign={"center"}>No friends</Typography>
                    }
                </Stack>
                <Stack direction="row" alignItems={"center"} justifyContent={"space-evenly"} p={'1rem'}>
                    <Button color={"error"} variant='outlined' onClick={closeHandler}>Cancel</Button>
                    <Button variant='contained' disabled={isLoadingAddMember} onClick={addMemberSubmitHandler}>Submit Changes</Button>
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default AddMemberDialog