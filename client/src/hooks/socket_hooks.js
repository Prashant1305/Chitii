import { useEffect } from "react";

const useSocketEvent = (socket, SocketAndHandlers) => {
    useEffect(() => {
        Object.entries(SocketAndHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        })

        return () => {
            Object.entries(SocketAndHandlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            })
        }

    }, [socket, SocketAndHandlers])
}
export { useSocketEvent }