import { Button, Dialog, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { sampleUsers, sampleUsers as users } from '../constants/sampleData'
import UserItem from '../shared/UserItem';

function NewGroup() {

    const [groupName, setGroupName] = useState("");
    const [members, setMembers] = useState(sampleUsers);
    const [selectedMembers, setSelectedMembers] = useState([]);


    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => (prev.includes(id)) ? prev.filter((ele) => ele !== id) : [...prev, id]);
    }
    // console.log(selectedMembers);

    const groupNameHandler = (e) => {
        // console.dir(e.currentTarget.value);
        setGroupName(`${e.currentTarget.value}`)
    }
    // console.log(groupName)
    const submitHandler = () => {

    }
    const closeHandler = () => {

    }
    return (
        <Dialog open onClose={closeHandler}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} width={"25rem"} spacing={"2rem"}>
                <DialogTitle textAlign={"center"} variant="h4">New Group</DialogTitle>
                <TextField label="Group Name" value={groupName} onChange={groupNameHandler} />
                <Typography variant='body1'>Members</Typography>
                <Stack>
                    {
                        members.map((user) => (
                            <UserItem user={user} key={user._id} handler={selectMemberHandler} isAdded={selectedMembers.some((ele) => ele === user._id)} />
                        ))
                    }
                </Stack>
                <Stack direction={"row"} justifyContent={"space-evenly"}>
                    <Button variant='text' color='error' size='large' onClick={submitHandler}>Cancel</Button>
                    <Button variant='contained' size='large'>Create</Button>

                </Stack>
            </Stack>
        </Dialog>
    )
}

export default NewGroup