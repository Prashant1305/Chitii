import React, { createContext, useContext, useEffect, useState } from 'react'

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
        isProfileSectionOn: true,
        selectedDeleteChat: {
            chatId: "",
            groupChat: false
        },
        isProfileSectionOn: true,
        isIncomingCallDialogOpen: false,
        isOnline: false,
        isFriendList: false
    })
    return (
        <ToggleContext.Provider value={{ uiState, setUiState }}>{children}</ToggleContext.Provider>
    )
}
export function MyToggleUiValues() {
    return useContext(ToggleContext);
}
export default ToggleUi