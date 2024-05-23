import React from 'react'
import { Outlet } from 'react-router-dom';

function AdminLayout() {
    return (
        <>
            inside admin
            <Outlet />
        </>
    )
}

export default AdminLayout