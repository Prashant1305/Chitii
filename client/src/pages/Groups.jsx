import { Box, Button, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import React, { Suspense, lazy, memo, useEffect, useState } from 'react'
import { KeyboardBackspace as KeyboardBackspaceIcon, Menu as MenuIcon, Edit as EditIcon, Done as DoneIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MyToggleUiValues } from '../context/ToggleUi';
import { Link } from '../components/styles/StyledComponent';
import AvatarCard from '../components/shared/AvatarCard';
import { sampleChats, sampleUsers } from '../components/constants/sampleData';
import ConfirmDeleteDialog from '../components/Dialogs/ConfirmDeleteDialog';
import AddMemberDialog from '../components/Dialogs/AddMemberDialog';
import UserItem from '../components/shared/UserItem';
import { v4 as uuid } from "uuid";

function Groups() {
    const navigate = useNavigate();
    const chatId = useSearchParams()[0].get("group");
    console.dir(chatId)

    const { uiState, setUiState } = MyToggleUiValues()

    const [isEdit, setIsEdit] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)

    const removerMemberHandler = (id) => {
        console.log("remove member handler got clicked")
    }

    const updateGroupNameHandle = () => {
        setIsEdit(false);
        console.log("group name updated");
    }
    // console.log(groupNameUpdatedValue)

    const confirmDeleteHandler = () => {
        console.log("confirm delete got clicked");
        setConfirmDeleteDialogOpen(true);
    }

    const openAddMemeberHandler = () => {
        console.log("confirm add member got clicked");
    }

    const confirmDeleteMember = () => {
        console.log("confirmDeleteMember")
    }

    const closeConfirmDeleteHandler = () => {
        console.log("closeConfirmDeleteHandle")
        setConfirmDeleteDialogOpen(false);
    }

    useEffect(() => {
        setUiState({ ...uiState, mobileBtnExist: true })
        return () => {
            setUiState({ ...uiState, mobileBtnExist: false })
        }
    }, [])

    useEffect(() => {
        setGroupName(`Group Name ${chatId}`)// later we will fetch data
        setGroupNameUpdatedValue(`Group Name ${chatId}`)
        return () => {
            setGroupName("");
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
        {
            isEdit ?
                (<>
                    <TextField value={groupNameUpdatedValue} onChange={(e) => { setGroupNameUpdatedValue(e.target.value) }} />
                    <IconButton onClick={updateGroupNameHandle}>
                        <DoneIcon />
                    </IconButton>
                </>) : (<>
                    <Typography variant='h3'>{groupName}</Typography>
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
        <Button size='large' color='error' variant='outlined' startIcon={<DeleteIcon />} onClick={confirmDeleteHandler}>Delete Group</Button>
        <Button size='large' variant='contained' startIcon={<AddIcon />} onClick={openAddMemeberHandler}>Add Member</Button>
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
                <GroupList w={"100%"} myGroups={sampleChats} />
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
                {IconBtns}

                {groupName && <>
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
                            sampleUsers.map((i) => (
                                <UserItem
                                    key={uuid()}
                                    user={i}
                                    isAdded
                                    styling={{
                                        boxShadow: "0 0 0.5rem rgba(0,0,0,0.2)",
                                        padding: "1rem",
                                        borderRadius: "1rem",
                                    }}
                                    handler={removerMemberHandler}
                                />
                            ))
                        }
                    </Stack>
                    {ButtonGroup}
                </>}
            </Grid>

            <ConfirmDeleteDialog open={confirmDeleteDialogOpen} handleClose={closeConfirmDeleteHandler} deleteHandler={confirmDeleteMember} />

            <AddMemberDialog />

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
                open={uiState.isMobileOpen} onClose={() => { setUiState({ ...uiState, ismobileOpen: false }) }}><GroupList w={"100%"} myGroups={sampleChats} />
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
    const { name, avatar, _id } = group;
    return (<Link to={`?group=${_id}`} sx={{
        borderBottom: "1px solid white",
        // width: "100%"
    }} onClick={e => {
        if (chatId === _id) {
            e.preventDefault();
        }
    }}>
        <Stack direction={"row"} alignItems={"center"} width={"100%"}>
            <AvatarCard avatar={avatar} />
            <Typography>{name}</Typography>
        </Stack>
    </Link >)
})

export default Groups