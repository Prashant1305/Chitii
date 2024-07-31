import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'
import { toast } from 'react-toastify';
import { delete_conversation_api } from '../../../utils/ApiUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ConfirmDeleteDialog({ open, handleClose, deleteHandler }) {
    const chatId = useSearchParams()[0].get("group");
    const navigate = useNavigate()
    const handleDeleteGroup = async () => {
        const toastId = toast.loading("deleting Group")
        try {
            const res = await delete_conversation_api({ conversationId: chatId });
            if (res.status === 200) {
                toast.update(toastId, {
                    render: "Group deleted succesFully",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
                handleClose();
                navigate(-1);
            }
            else {
                toast.update(toastId, {
                    render: res.data.message || "oops something went unexpected",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
        } catch (error) {
            toast.update(toastId, {
                render: error?.response?.data?.message || "failed to delete group, plz try later",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
            console.log(error);
        }
    }
    return (
        <Dialog open={open} onClose={handleClose} >
            <DialogTitle >Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this Group
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>No</Button>
                <Button color='error' onClick={handleDeleteGroup}>Yes</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDeleteDialog