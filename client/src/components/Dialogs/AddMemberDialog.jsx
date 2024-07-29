import { Button, Dialog, DialogTitle, Skeleton, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { sampleUsers } from '../constants/sampleData'
import UserItem from '../shared/UserItem'
import { v4 as uuid } from "uuid";
import { MyToggleUiValues } from '../../context/ToggleUi';
import { toast } from 'react-toastify';
import { add_member_in_group_api, get_my_friends_api } from '../../utils/ApiUtils';

function AddMemberDialog({ setGroupDetails, isLoadingAddMember, chatId }) {
    const [members, setMembers] = useState(sampleUsers);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { uiState, setUiState } = MyToggleUiValues();
    const [memberIsLoading, setMemberIsLoading] = useState(false);

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => (prev.includes(id)) ? prev.filter((ele) => ele !== id) : [...prev, id]);
    }

    const addMemberSubmitHandler = () => {
        if (selectedMembers.length > 0) {
            const addMemberInGroup = async () => {
                try {
                    const res = await add_member_in_group_api({ conversationId: chatId, members: members });
                    if (res.status = 200) {
                        toast.success("Member added successfully");
                        setGroupDetails(prev => ({ ...prev, members: [...prev.members, ...members] }))
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.response.data)
                }
            }
            addMemberInGroup();
        }
        closeHandler();

    }
    const closeHandler = () => {
        setSelectedMembers([]);
        console.log("close add member dialog");
        setUiState({ ...uiState, isAddMember: false })
    }

    useEffect(() => {
        const getFriendsNotInChat = async () => {
            setMemberIsLoading(true);
            try {
                const res = await get_my_friends_api(chatId);
                if (res.status === 200) {
                    setMembers(res.data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error(error.response.data.message)
            } finally {
                setMemberIsLoading(false);
            }
        }
        if (chatId) {
            getFriendsNotInChat();
        }
        return () => {
            setMembers([])
        }
    }, [chatId])

    return (
        <Dialog open={uiState.isAddMember} onClose={closeHandler}>

            <Stack p={"2rem"} width={"25rem"} >
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                {memberIsLoading ? <Skeleton
                    animation="pulse"
                    variant="rect"
                    width={"20rem"}
                    height={"5rem"} /> :
                    <Stack spacing={"1rem"}>
                        {
                            members.length > 0 ? members.map(i => (
                                <UserItem key={uuid()} user={i} handler={selectMemberHandler} isAdded={selectedMembers.includes(i._id)} />
                            )
                            ) : <Typography textAlign={"center"}>No friends</Typography>
                        }
                    </Stack>}
                <Stack direction="row" alignItems={"center"} justifyContent={"space-evenly"} p={'1rem'}>
                    <Button color={"error"} variant='outlined' onClick={closeHandler}>Cancel</Button>
                    <Button variant='contained' disabled={isLoadingAddMember} onClick={addMemberSubmitHandler}>Submit Changes</Button>
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default AddMemberDialog