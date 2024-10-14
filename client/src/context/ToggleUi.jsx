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
        selectedDeleteChat: {
            chatId: "",
            groupChat: false
        },
        isProfileSectionOn: true,
        isIncomingCallDialogOpen: false,
        isOnline: false,
        logoutTime: 10
    })
    useEffect(() => {
        console.log(uiState)
        const timer = setTimeout(() => {
            //referesh token function to be made
        }, uiState.logoutTime * 0.8);

        // Cleanup the timeout if the variable changes or the component unmounts
        return () => clearTimeout(timer);
    }, [uiState]);
    return (
        <ToggleContext.Provider value={{ uiState, setUiState }}>{children}</ToggleContext.Provider>
    )
}
export function MyToggleUiValues() {
    return useContext(ToggleContext);
}
export default ToggleUi