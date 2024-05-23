import React, { createContext, useContext, useState } from 'react'

const ToggleContext = createContext();

function ToggleUi({ children }) {
    const [isMobileOpen, setIsmobileOpen] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [isNewGroup, setIsNewGroup] = useState(false);
    const [isNotification, setIsNotification] = useState(false);
    const [mobileBtnExist, setMobileBtnExist] = useState(false);
    return (
        <ToggleContext.Provider value={{ isMobileOpen, setIsmobileOpen, isSearch, setIsSearch, isNewGroup, setIsNewGroup, isNotification, setIsNotification, mobileBtnExist, setMobileBtnExist }}>{children}</ToggleContext.Provider>
    )
}
export function MyToggleUiValues() {
    return useContext(ToggleContext);
}
export default ToggleUi