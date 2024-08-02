import { Avatar, AvatarGroup, Box, Button, Drawer, Grid, IconButton, Skeleton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import React, { Suspense, lazy, memo, useCallback, useEffect, useState } from 'react'
import { KeyboardBackspace as KeyboardBackspaceIcon, Menu as MenuIcon, Edit as EditIcon, Done as DoneIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MyToggleUiValues } from '../context/ToggleUi';
import { Link } from '../components/styles/StyledComponent';
import AvatarCard from '../components/shared/AvatarCard';
import { sampleChats, sampleUsers } from '../components/constants/sampleData';
import ConfirmDeleteDialog from '../components/Dialogs/groups/ConfirmDeleteDialog';
import AddMemberDialog from '../components/Dialogs/groups/AddMemberDialog';
import UserItem from '../components/shared/UserItem';
import { v4 as uuid } from "uuid";
import { chat_details, get_group_chat_list_api, rename_chat_api } from '../utils/ApiUtils';
import { toast } from 'react-toastify';
import { REFETCH_CHATS } from '../components/constants/events';
import { GetSocket } from '../utils/Socket';
import { useSocketEvent } from '../hooks/socket_hooks';
import RemoveMemberConfirmationDialog from '../components/Dialogs/groups/RemoveMemberConfirmationDialog';

function Groups() {
    const navigate = useNavigate();
    const chatId = useSearchParams()[0].get("group");

    const { uiState, setUiState } = MyToggleUiValues()
    const [groupList, setGroupList] = useState([]);
    const [groupListIsLoading, setGroupListIsLoading] = useState(false);
    const [groupNameIsLoading, setGroupNameIsLoading] = useState(false);
    const [removeMemberDialog, setRemoveMemberDialog] = useState({
        user: {},
        isDialogOpen: false,
        chatId
    });


    const [isEdit, setIsEdit] = useState(false);
    // const [groupName, setGroupName] = useState("");
    const [groupDetails, setGroupDetails] = useState({
        name: "",
        members: [],
        isLoading: false
    });
    const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
    const socket = GetSocket();

    const refetchChatsListner = useCallback(() => {
        getGroupList();
    }, [])

    const eventHandler = { [REFETCH_CHATS]: refetchChatsListner }

    useSocketEvent(socket, eventHandler);


    const updateGroupNameHandle = () => {
        setIsEdit(false);
        const changeNameOfChat = async () => {
            setGroupNameIsLoading(true)
            const toastId = toast.loading("updating name...")
            try {
                const res = await rename_chat_api({ conversationId: chatId, conversationName: groupNameUpdatedValue })

                if (res.status === 200) {
                    setGroupDetails({ ...groupDetails, name: groupNameUpdatedValue })
                    toast.update(toastId, {
                        render: "Group name updated Successfully",
                        type: "success",
                        isLoading: false,
                        autoClose: 1000,
                    })
                }
                else {
                    toast.update(toastId, {
                        render: res.data.message,
                        type: "info",
                        isLoading: false,
                        autoClose: 1000,
                    })
                }
            } catch (error) {
                console.log(error)
                toast.update(toastId, {
                    render: error?.response?.data?.message || "failed to update name",
                    type: "error",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
            finally {
                setGroupNameIsLoading(false);
            }
        }
        changeNameOfChat();
    }

    const confirmRemoveMember = () => {
        console.log("confirmRemoveMember")
    }

    const closeConfirmDeleteHandler = () => {
        setConfirmDeleteDialogOpen(false);
    }
    const getGroupList = async () => {
        setGroupListIsLoading(true)
        try {
            const res = await get_group_chat_list_api();
            if (res.status === 200) {
                setGroupList(res.data.message);
                toast.success("group list fetched succesfully")
            }
            else {
                toast.info(res.data.message);
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message || "failed to fetch groupList")
        } finally {
            setGroupListIsLoading(false)
        }
    }
    useEffect(() => {
        setUiState({ ...uiState, mobileBtnExist: true })

        getGroupList();
        return () => {
            setUiState({ ...uiState, mobileBtnExist: false })
        }
    }, [])

    const getGroupDetails = async () => {
        setGroupDetails((prev) => ({ ...prev, isLoading: true }))

        try {
            const res = await chat_details(chatId, true);
            if (res.status === 200) {
                setGroupDetails(prev => ({ ...prev, ...res.data.message }));
                setGroupNameUpdatedValue(res.data.message.name)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message || "failed to fetch group details")
        }
        finally {
            setGroupDetails((prev) => ({ ...prev, isLoading: false }))
        }

    }

    useEffect(() => {

        if (chatId) {
            getGroupDetails();
        }

        return () => {
            setGroupDetails({
                name: "",
                members: [],
                isLoading: false
            })
            setGroupNameUpdatedValue("");
            setIsEdit(false);
        }
    }, [chatId])

    const handleMobile = () => {
        setUiState({ ...uiState, isMobileOpen: !uiState.isMobileOpen })
    }
    const IconBtns = <>
        {/* <Box sx={{
            display: {
                xs: "block",
                sm: "none",
                position: "fixed",
                right: "1rem",
                top: "1rem"
            },
        }}>
            <IconButton onClick={() => { setIsmobileOpen((prev) => !prev) }}>
                <MenuIcon />
            </IconButton>

        </Box> */}
        <Tooltip title="back">

            <IconButton sx={{
                position: "absolute",
                top: "2rem",
                left: "2rem",
                color: "rgba(0,0,0, 0.9)",
                "&:hover": {
                    color: "rgba(50, 209, 22, 0.9)",
                    bgcolor: "rgba(0, 0, 0, 0.6)"
                }
            }}
                onClick={() => { navigate(-1) }}>
                <KeyboardBackspaceIcon />

            </IconButton>
        </Tooltip>
    </>

    const GroupName = <Stack direction={"row"} alignItems={"center"} justifyContent={"center"} spacing={"1rem"} padding={"3rem"}>
        {groupNameIsLoading ? <Skeleton
            variant="rectangular"
            animation="wave"
            height={"3rem"}
            width={"10rem"}
            sx={{
                borderRadius: "0.5rem",
                backgroundColor: "rgba(0,0,0, 0.1)",
            }}
        /> :
            isEdit ?
                (<>
                    <TextField value={groupNameUpdatedValue} onChange={(e) => { setGroupNameUpdatedValue(e.target.value) }} />
                    <IconButton onClick={updateGroupNameHandle}>
                        <DoneIcon />
                    </IconButton>
                </>) : (<>
                    <Typography variant='h3'>{groupDetails.name}</Typography>
                    <IconButton onClick={() => { setIsEdit(true) }}><EditIcon /></IconButton>
                </>)
        }
    </Stack>

    const ButtonGroup = <Stack
        direction={{ sm: "row", xs: "column-reverse" }}
        spacing={"1rem"}
        p={{
            xs: "0",
            sm: "1rem",
            md: "1rem 4rem",
        }}>
        <Button size='large' color='error' variant='outlined' startIcon={<DeleteIcon />} onClick={() => {
            setConfirmDeleteDialogOpen(true);
        }}>Delete Group</Button>
        <Button size='large' variant='contained' startIcon={<AddIcon />} onClick={() => { setUiState({ ...uiState, isAddMember: true }) }}>Add Member</Button>
    </Stack>
    return (
        <Grid container height={"calc(100vh - 4rem)"}>
            <Grid item
                sm={4}
                bgcolor={'#A9FF99'}
                height={"100%"}
                sx={{
                    display: {
                        xs: "none",
                        sm: "block"
                    },
                    borderRight: "1px solid white",
                }}>
                {groupListIsLoading ? <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width={"90%"} height={"90%"}
                    sx={{
                        margin: "auto",
                        mt: "2rem",
                    }}
                /> : <GroupList w={"100%"} myGroups={groupList} />}

            </Grid>
            <Grid item xs={12} sm={8} sx={{
                display: 'flex',
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                padding: "1rem 3rem",
                height: "100%",
                overflow: "auto"
            }}>
                {chatId ?
                    (<>
                        {IconBtns}
                        {
                            groupDetails &&
                                groupDetails.isLoading ? <Skeleton
                                animation="wave"
                                variant="rectangular"
                                width={"90%"} height={"90%"}
                                sx={{
                                    margin: "auto",

                                    mt: "2rem",
                                }} /> :
                                <>
                                    {GroupName}
                                    <Typography variant='h4'>Members</Typography>
                                    <Stack
                                        maxWidth={"45rem"}
                                        width={"100%"}
                                        boxSizing={"border-box"}
                                        padding={{
                                            sm: "1rem",
                                            xs: "0",
                                            md: "1rem 4rem",
                                        }}
                                        spacing={"2rem"}
                                        // bgcolor={"bisque"}
                                        border={"1px solid white"}
                                        borderRadius={"1rem"}
                                        height={"50vh"}
                                        overflow={"auto"}>
                                        {
                                            groupDetails?.members.map((i) => (
                                                <UserItem
                                                    key={uuid()}
                                                    user={i}
                                                    isAdded
                                                    styling={{
                                                        boxShadow: "0 0 0.5rem rgba(0,0,0,0.2)",
                                                        padding: "1rem",
                                                        borderRadius: "1rem",
                                                    }}
                                                    handler={() => {
                                                        setRemoveMemberDialog((prev) => ({ user: i, isDialogOpen: true, chatId }))
                                                    }}
                                                />
                                            ))
                                        }
                                    </Stack>
                                    {ButtonGroup}
                                </>
                        }
                    </>) : <Box height={"100%"}>
                        <Typography
                            p={"2rem"}
                            variant='h4'
                            textAlign={"center"}>
                            Select Group to manage
                        </Typography>
                    </Box>}
            </Grid>

            <ConfirmDeleteDialog open={confirmDeleteDialogOpen} handleClose={closeConfirmDeleteHandler} deleteHandler={confirmRemoveMember} />

            <AddMemberDialog chatId={chatId} groupDetails={groupDetails} setGroupDetails={setGroupDetails} getGroupDetails={getGroupDetails} />

            <RemoveMemberConfirmationDialog removeMemberDialog={removeMemberDialog} setRemoveMemberDialog={setRemoveMemberDialog} setGroupDetails={setGroupDetails} />

            <Drawer
                PaperProps={{
                    sx: {
                        display: {
                            xs: "block",
                            sm: "none"
                        },
                        height: "calc(100vh - 4rem)",
                        top: "4rem",
                        backgroundImage: "linear-gradient(#A9FF99, rgb(217, 234, 237))"
                    }
                }}
                open={uiState.isMobileOpen} onClose={() => { setUiState({ ...uiState, isMobileOpen: false }) }}>{groupListIsLoading ? <Skeleton
                    animation="wave"
                    variant="rectangular"
                    height={"100%"}
                    width={"100%"} />
                    : <GroupList w={"100%"} myGroups={groupList} />}
            </Drawer>
        </Grid>
    )
};

const GroupList = ({ w = "100%", myGroups = [], chatId }) => (
    <Stack width={w} overflow={"auto"} height={"100%"}>
        {
            myGroups.length > 0 ? (
                myGroups.map((group, chatId) => <GroupListItem group={group} chatId={chatId} key={group._id} />)
            ) : (
                <Typography textAlign={"center"} padding={"1rem"}>No Groups</Typography>
            )
        }
    </Stack>
)

const GroupListItem = memo(({ group, chatId }) => {
    const { name, members, _id } = group;
    const avatar_urls = members.map((member) => member.avatar_url);
    return (<Link to={`?group=${_id}`} sx={{
        borderBottom: "1px solid white",
        // width: "100%"
    }} onClick={e => {
        if (chatId === _id) {
            e.preventDefault();
        }
    }}>
        <Stack direction={"row"} alignItems={"center"} width={"100%"}>
            <AvatarGroup max={3} sx={{
                marginRight: "1rem"
            }}>
                {(
                    avatar_urls.map((i, index) => (
                        <Avatar key={index} src={i} />
                    ))
                )}
            </AvatarGroup>
            <Typography>{name}</Typography>
        </Stack>
    </Link >)
})

export default Groups