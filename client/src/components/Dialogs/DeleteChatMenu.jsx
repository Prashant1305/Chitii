import { ExitToApp as ExitToAppIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Menu, Stack, Typography } from '@mui/material'
import React from 'react'
import { MyToggleUiValues } from '../../context/ToggleUi';
import { delete_conversation_api, leave_group_api } from '../../utils/ApiUtils';
import { toast } from 'react-toastify';

function DeleteChatMenu({ deleteMenuAnchor, setDeleteChat, deleteChat }) {
    const { uiState, setUiState } = MyToggleUiValues();

    const leaveGroup = async () => {
        const toastId = toast.loading("leaving Group...")
        try {
            const res = await leave_group_api(deleteChat._id);
            if (res.status === 200) {
                toast.update(toastId, {
                    render: "group left successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
            } else {
                toast.update(toastId, {
                    render: res.data.message || "oops",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
        } catch (error) {
            console.log(error)
            toast.update(toastId, {
                render: error?.response?.data?.message || "failed to leave group, plz try later",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
        } finally {
            setUiState({ ...uiState, isDeleteMenu: false })
        }
    }
    const unfriendAndDeleteChat = async (e) => {
        const toastId = toast.loading("Removing friend...")
        try {
            const res = await delete_conversation_api({ conversationId: deleteChat._id })
            if (res.status = 200) {
                toast.update(toastId, {
                    render: "friend removed successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
            } else {
                toast.update(toastId, {
                    render: res.data.message || "oops",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
        } catch (error) {
            console.log(error);
            toast.update(toastId, {
                render: error?.response?.data?.message || "failed to unfriend, plz try later",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
        } finally {
            setUiState({ ...uiState, isDeleteMenu: false })
        }
    }
    return (
        <Menu open={uiState.isDeleteMenu} onClose={() => {
            setUiState({ ...uiState, isDeleteMenu: false })
        }} anchorEl={deleteMenuAnchor.current} anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
        }}
            transformOrigin={
                {
                    vertical: "bottom",
                    horizontal: "left"
                }
            }>
            <Stack
                direction="row"
                spacing={"0.5rem"}
                alignItems={"center"}
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? theme.palette.grey[900]
                            : theme.palette.grey[50],

                    width: "10rem",
                    Padding: "0.5rem",
                    cursor: "pointer"
                }}
                onClick={deleteChat.group_chat ? leaveGroup : unfriendAndDeleteChat}
            >
                {deleteChat.group_chat ? <><ExitToAppIcon /> <Typography>Leave Group</Typography></> : <><DeleteIcon /> <Typography>unfriend</Typography></>}
            </Stack>

        </Menu >
    )
}

export default DeleteChatMenu