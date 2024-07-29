import { Button, Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { MyToggleUiValues } from '../../context/ToggleUi';
import UserItem from '../shared/UserItem';
import { get_my_friends_api, new_group_chat_api } from "../../utils/ApiUtils"
import { toast } from 'react-toastify'

function NewGroup() {

    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { uiState, setUiState } = MyToggleUiValues();
    const [allFriends, setAllFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => (prev.includes(id)) ? prev.filter((ele) => ele + "" !== id + "") : [...prev, id]);
    }
    // console.log(selectedMembers);

    const groupNameHandler = (e) => {
        // console.dir(e.currentTarget.value);
        setGroupName(`${e.currentTarget.value}`)
    }
    // console.log(groupName)
    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            const res = await new_group_chat_api({ name: groupName, members: selectedMembers });
            if (res.status === 200) {
                toast.success(res.data.message);
                setUiState(prev => ({ ...prev, isNewGroup: false }))
            } else {
                toast.info(res.data.message);
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message || "Failed to create group");
        }
    }
    const closeHandler = () => {
        setUiState(prev => ({ ...prev, isNewGroup: false }))
    }
    useEffect(() => {
        const getAllFriends = async () => {
            setIsLoading(true);
            try {
                const res = await get_my_friends_api();
                if (res.status === 200) {
                    setAllFriends(res.data.message)
                }
                else {
                    toast.info(res.data.message)
                }

            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message)
            }
            finally {
                setIsLoading(false)
            }
        }
        getAllFriends()
    }, [])
    return (
        <Dialog open={uiState.isNewGroup} onClose={closeHandler}>
            <Stack p={{ xs: "1rem", sm: "2rem" }} width={"25rem"} spacing={"2rem"}>
                <DialogTitle textAlign={"center"} variant="h4">New Group</DialogTitle>
                <TextField label="Group Name" value={groupName} onChange={groupNameHandler} />
                <Typography variant='body1'>Members</Typography>
                <Stack>
                    {
                        isLoading ? (<Skeleton height={"10rem"} />) : allFriends.map((user) => (
                            <UserItem user={user} key={user._id} handler={selectMemberHandler} isAdded={selectedMembers.some((ele) => ele === user._id)} />
                        ))
                    }
                </Stack>
                <Stack direction={"row"} justifyContent={"space-evenly"}>
                    <Button variant='text' color='error' size='large' onClick={closeHandler}>Cancel</Button>
                    <Button variant='contained' size='large' onClick={submitHandler}>Create</Button>

                </Stack>
            </Stack>
        </Dialog>
    )
}

export default NewGroup