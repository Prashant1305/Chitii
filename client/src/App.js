import { check } from "./utils/ApiUtils";
import React, { useEffect, useState } from "react";

function App() {
  useEffect(() => {
    const apiCall = async () => {
      try {
        const res = await check();
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    }
    apiCall();
  });
  return (
    <div >
      app.js
    </div>
  );
}

export default App;
