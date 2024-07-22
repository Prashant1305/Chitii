import io from "socket.io-client";
import { baseUrl } from "../Constant";
import { createContext, useContext, useMemo } from "react";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(baseUrl, { withCredentials: true }), []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const GetSocket = () => useContext(SocketContext);

export default SocketProvider