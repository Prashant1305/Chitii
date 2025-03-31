import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { requestPushNotificationPermission } from '../../utils/FirebaseConfig';
import Title from '../shared/Title';

function RootLayout() {
    useEffect(() => {
        requestPushNotificationPermission();
    }, [])
    return (
        <>
            <Title />
            <Outlet />
        </>
    )
}

export default RootLayout