import io from "socket.io-client";
import { baseUrl } from "../Constant";
import { createContext, useContext, useEffect, useMemo } from "react";
import { MyToggleUiValues } from "./ToggleUi";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const { uiState, setUiState } = MyToggleUiValues()
    const socket = useMemo(() => io(baseUrl, {
        withCredentials: true,
        reconnection: true, // Enable reconnection
        reconnectionAttempts: Infinity, // Number of reconnection attempts before giving up
        reconnectionDelay: 200, // Time to wait before attempting to reconnect (in ms)
        reconnectionDelayMax: 5000, // Maximum time to wait between reconnections (in ms)
        randomizationFactor: 0.5,// Randomization factor for reconnection delay
        transports: ['websocket', 'polling'],
    }), []);

    useEffect(() => {
        socket.on('connect', () => {
            setUiState({ ...uiState, isOnline: true });
        });
        socket.on('disconnect', (reason) => {
            if (uiState) {
                setUiState({ ...uiState, isOnline: false })
            }
        });
        socket.on('error', (error) => {
            if (uiState) {
                setUiState({ ...uiState, isOnline: false })
            }
        });
        return () => {
            if (uiState) {
                setUiState({ ...uiState, isOnline: false })
            }
            socket.off();
        }
    }, [socket, setUiState])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const GetSocket = () => useContext(SocketContext);

export default SocketProvider