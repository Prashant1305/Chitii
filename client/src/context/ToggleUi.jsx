import React, { createContext, useContext, useState } from 'react'

const ToggleContext = createContext();

function ToggleUi({ children }) {
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