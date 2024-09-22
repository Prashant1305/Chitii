import io from "socket.io-client";
import { baseUrl } from "../Constant";
import { createContext, useContext, useEffect, useMemo } from "react";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(baseUrl, {
        withCredentials: true,
        reconnection: true, // Enable reconnection
        reconnectionAttempts: Infinity, // Number of reconnection attempts before giving up
        reconnectionDelay: 1000, // Time to wait before attempting to reconnect (in ms)
        reconnectionDelayMax: 5000, // Maximum time to wait between reconnections (in ms)
        randomizationFactor: 0.5 // Randomization factor for reconnection delay
    }), []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const GetSocket = () => useContext(SocketContext);

export default SocketProvider