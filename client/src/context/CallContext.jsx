import React, { createContext, useContext, useState } from 'react'

const CallingContext = createContext();

function CallContext({ children }) {
    const [callingVariables, setCallingVariables] = useState(
        {
            callingButtonIsActive: true
        }
    )
    return (
        <CallingContext.Provider value={{ callingVariables, setCallingVariables }}>{children}</CallingContext.Provider>
    )
}
export function MyCallingValues() {
    return useContext(CallingContext);
}

export default CallContext;