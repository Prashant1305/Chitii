import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import ProtectRoutes from "./components/ProtectRoutes";
import AfterAuthenticationLayout from "./components/layout/AfterAuthenticationLayout";
import { LayoutLoader } from "./components/layout/Loders";
import ChatWindow from "./pages/ChatWindow";

// import ErrorRoute from "./pages/ErrorRoute";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Home from "./pages/Home";
// import SignOut from "./pages/SignOut";
// import Error from "./pages/Error";
// import RootLayout from "./components/RootLayout";
// import Groups from "./pages/Groups";
// import Chat from "./pages/Chat";



const Home = lazy(() => import("./pages/Home")); // using lazy, now this page will load when needed at first
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ErrorRoute = lazy(() => import("./pages/ErrorRoute"));
const SignOut = lazy(() => import("./pages/SignOut"));
const Error = lazy(() => import("./pages/Error"));
const RootLayout = lazy(() => import("./components/layout/RootLayout"));
const Groups = lazy(() => import("./pages/Groups"));
const Chat = lazy(() => import("./components/Chat"));



function Routing() {
  const user = true; // dummy user
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />} errorElement={<Error />}>
        <Route element={<AfterAuthenticationLayout />}>
          <Route element={<ProtectRoutes conditionValue={user} navigateTo={"/signin"} />}>
            <Route index element={<Suspense fallback={<LayoutLoader />}><Home /></Suspense>} />
            <Route path="groups" element={<Suspense fallback={<LayoutLoader />}><Groups /></Suspense>}></Route>
            <Route path="chat" element={<Suspense fallback={<LayoutLoader />}><ChatWindow /></Suspense>}></Route>
            <Route path="chat/:chatId" element={<Suspense fallback={<LayoutLoader />}><ChatWindow /></Suspense>}></Route>
          </Route>
        </Route>

        <Route path="signin" element={<ProtectRoutes conditionValue={!user} navigateTo={"/"}><Suspense fallback={<LayoutLoader />}><SignIn /></Suspense></ProtectRoutes>} />
        <Route path="signup" element={<Suspense fallback={<LayoutLoader />}><SignUp /> </Suspense>} />
        <Route path="signout" element={<Suspense fallback={<LayoutLoader />}><SignOut /></Suspense>} />

        <Route path="*" element={<Suspense fallback={<LayoutLoader />}><ErrorRoute /></Suspense>} />
      </Route>
    )
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default Routing;
