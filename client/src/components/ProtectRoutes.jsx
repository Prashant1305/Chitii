import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectRoutes({ conditionValue, children, navigateTo }) {
    return (
        conditionValue ? (children ? children : <Outlet />) : <Navigate to={navigateTo}></Navigate>
    )
}

export default ProtectRoutes