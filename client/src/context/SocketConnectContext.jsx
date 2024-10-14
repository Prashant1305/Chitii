import io from "socket.io-client";
import { baseUrl } from "../Constant";
import { createContext, useContext, useEffect, useMemo } from "react";
import { MyToggleUiValues } from "./ToggleUi";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const { setUiState } = MyToggleUiValues();

    const socket = useMemo(() => io(baseUrl, {
        withCredentials: true,
        reconnection: true, // Enable reconnection
        reconnectionAttempts: Infinity, // Number of reconnection attempts before giving up
        reconnectionDelay: 200, // Time to wait before attempting to reconnect (in ms)
        reconnectionDelayMax: 5000, // Maximum time to wait between reconnections (in ms)
        randomizationFactor: 0.5, // Randomization factor for reconnection delay
        transports: ['websocket', 'polling'],
    }), []);

    useEffect(() => {
        const onlineStatusChange = (val) => {
            setUiState((prev) => ({ ...prev, isOnline: val }));
        }

        const handleConnect = () => onlineStatusChange(true);
        const handleDisconnect = () => onlineStatusChange(false);
        const handleError = () => onlineStatusChange(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('error', handleError);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('error', handleError);
        }
    }, [socket, setUiState]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export const GetSocket = () => useContext(SocketContext);
export default SocketProvider;
