import React from 'react'
import { Outlet } from 'react-router-dom';
import Title from '../shared/Title';

function RootLayout() {

    return (
        <>
            <Title />
            <Outlet />
        </>
    )
}

export default RootLayout