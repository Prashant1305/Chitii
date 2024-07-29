import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'
import { toast } from 'react-toastify'
import { remove_member_from_group_api } from '../../../utils/ApiUtils'

function RemoveMemberConfirmationDialog({ setRemoveMemberDialog, removeMemberDialog, setGroupDetails }) {
    const removeMemberHandler = async () => {
        try {
            const res = await remove_member_from_group_api({ userId: [removeMemberDialog.user._id], conversationId: removeMemberDialog.chatId })
            if (res.status === 200) {
                toast.success(`${removeMemberDialog.user.user_name} removed successfully`);
                setGroupDetails(prev => ({ ...prev, members: prev.members.filter((member) => (member._id + "" !== removeMemberDialog.user._id + "")) }))
                setRemoveMemberDialog(prev => ({ ...prev, isDialogOpen: false }))
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }
    return (
        <Dialog open={removeMemberDialog.isDialogOpen} onClose={() => {
            setRemoveMemberDialog((prev) => ({ ...prev, isDialogOpen: false }))
        }} >
            <DialogTitle>Remove Member</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {`Are you sure you want to remove ${removeMemberDialog?.user?.user_name}`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setRemoveMemberDialog(prev => ({ ...prev, isDialogOpen: false }))
                }} >No</Button>
                <Button color='error' onClick={removeMemberHandler}>Yes</Button>
            </DialogActions>
        </Dialog>
    )
}

export default RemoveMemberConfirmationDialog