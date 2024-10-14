import { Button, Dialog, DialogTitle, Skeleton, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuid } from "uuid";
import { MyToggleUiValues } from '../../../context/ToggleUi';
import { add_member_in_group_api, get_my_friends_api } from '../../../utils/ApiUtils';
import UserItem from '../../shared/UserItem';

function AddMemberDialog({ groupDetails, setGroupDetails, getGroupDetails, chatId }) {
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { uiState, setUiState } = MyToggleUiValues();
    const [memberIsLoading, setMemberIsLoading] = useState(false);
    const [addMemberIsLoading, setAddMemberIsLoading] = useState(false);

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => (prev.includes(id)) ? prev.filter((ele) => ele !== id) : [...prev, id]);

    }

    const addMemberSubmitHandler = () => {
        if (selectedMembers.length > 0) {

            const addMemberInGroup = async () => {
                setAddMemberIsLoading(true);
                const toastId = toast.loading("fetching first page message");
                try {
                    const res = await add_member_in_group_api({ conversationId: chatId, members: selectedMembers });

                    if (res.status === 200) {
                        toast.update(toastId, {
                            render: "Member added successfully",
                            type: "success",
                            isLoading: false,
                            autoClose: 1000,
                        })
                        getGroupDetails()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.response.data)
                    toast.update(toastId, {
                        render: error?.response?.data?.message || "adding member failed, plz try later",
                        type: "error",
                        isLoading: false,
                        autoClose: 1000,
                    })
                }
                finally {
                    setAddMemberIsLoading(false)
                    closeHandler();
                }
            }
            addMemberInGroup();
        }
    }
    const closeHandler = () => {
        setSelectedMembers([]);
        setUiState(prev => ({ ...prev, isAddMember: false }))
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
    }, [chatId, groupDetails])

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
                    <Button color={"error"} variant='outlined' disabled={addMemberIsLoading || selectedMembers.length === 0} onClick={closeHandler}>Cancel</Button>
                    <Button variant='contained' disabled={addMemberIsLoading || selectedMembers.length === 0} onClick={addMemberSubmitHandler}>Submit Changes</Button>
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default AddMemberDialog