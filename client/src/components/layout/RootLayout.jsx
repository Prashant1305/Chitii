import React from 'react'
import { Outlet } from 'react-router-dom';
import Title from '../shared/Title';
import { GetSocket } from '../../utils/Socket';


function RootLayout() {
    const socket = GetSocket();
    console.log(socket.id)

    return (
        <>
            <Title />
            <Outlet />
        </>
    )
}

export default RootLayout