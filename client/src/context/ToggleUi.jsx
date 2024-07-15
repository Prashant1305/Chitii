import React, { createContext, useContext, useState } from 'react'

const ToggleContext = createContext();

function ToggleUi({ children }) {
    // const [isMobileOpen, setIsmobileOpen] = useState(false);
    // const [mobileBtnExist, setMobileBtnExist] = useState(false);

    // const [isSearch, setIsSearch] = useState(false);
    // const [isNewGroup, setIsNewGroup] = useState(false);
    // const [isAddMember, setIsAddMember] = useState(false);
    // const [isNotification, setIsNotification] = useState(false);
    const [uiState, setUiState] = useState({
        isMobileOpen: false,
        mobileBtnExist: false,
        isSearch: false,
        isNewGroup: false,
        isAddMember: false,
        isNotification: false,
        isMobileMenuFriend: false,
        isFileMenu: false,
        isDeleteMenu: false,
        uploadingLoader: false,
        selectedDeleteChat: {
            chatId: "",
            groupChat: false
        }
    })
    return (
        <ToggleContext.Provider value={{ uiState, setUiState }}>{children}</ToggleContext.Provider>
    )
}
export function MyToggleUiValues() {
    return useContext(ToggleContext);
}
export default ToggleUi