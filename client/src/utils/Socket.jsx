import io from "socket.io-client";
import { baseUrl } from "../Constant";
import { createContext, useContext } from "react";


const socket = io(baseUrl, { withCredentials: true })

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    return (<SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>)
}

export const GetSocket = () => useContext(SocketContext);

export default SocketProvider