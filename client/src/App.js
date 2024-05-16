import Routing from "./Routing";
import Messenger from "./components/Messenger";
import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CssBaseline } from "@mui/material"
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <div onContextMenu={e => e.preventDefault()}>
      <HelmetProvider>
        <CssBaseline />

        <ToastContainer
          position="bottom-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="colored"
        />

        <Routing />
      </HelmetProvider>
    </div>
  );
}

export default App;
