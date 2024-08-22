import { Stack } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { incoming_call_api } from '../../utils/ApiUtils';
import { GetSocket } from '../../utils/Socket';

function LiveCalling({ callId }) {
    const socket = GetSocket()
    const { user } = useSelector(state => state.auth)
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const callingOtherClient = async () => {
            setIsConnecting(true);
            try {
                const res = await incoming_call_api(callId);
                console.log(res.data)
            } catch (error) {
                console.log(error)
                toast.error(error?.response?.data?.message || "calling failed!")
            } finally {
                setIsConnecting(false);
            }
        }
        callingOtherClient();
    }, [])
    return (
        <Fragment>
            <Stack>
                calling screen
            </Stack>
            <Stack></Stack>
        </Fragment>
    )
}

export default LiveCalling