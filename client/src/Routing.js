import React, { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import { LayoutLoader } from "./components/layout/Loders";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectRoutes from "./components/ProtectRoutes";
import ChatManagement from "./pages/admin/ChatManagement";
import Dashboard from "./pages/admin/Dashboard";
import MessageManagement from "./pages/admin/MessageManagement";
import UserManagement from "./pages/admin/UserManagement";
import ChatWindow from "./pages/ChatWindow";
import { userExist, userNotExist } from "./redux/reducers/Auth";
import { fetch_user_data } from "./utils/ApiUtils";


// import ErrorRoute from "./pages/ErrorRoute";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Home from "./pages/Home";
// import SignOut from "./pages/SignOut";
// import Error from "./pages/Error";
import axios from "axios";
import { toast } from "react-toastify";
import RootLayout from "./components/layout/RootLayout";
import SocketProvider from "./context/SocketConnectContext";
import { MyToggleUiValues } from "./context/ToggleUi";
import LoginWithGoogle from "./pages/authentication/LoginWithGoogle";
import LoginWithTwitter from "./pages/authentication/LoginWithTwitter";
import LoginWithFaceBook from "./pages/authentication/LoginWithFaceBook";

const Home = lazy(() => import("./pages/Home")); // using lazy, now this page will load when needed at first
const SignUp = lazy(() => import("./pages/authentication/SignUp"));
const SignIn = lazy(() => import("./pages/authentication/SignIn"));
const ErrorRoute = lazy(() => import("./pages/ErrorRoute"));
const SignOut = lazy(() => import("./pages/authentication/SignOut"));
const Error = lazy(() => import("./pages/Error"));
const Groups = lazy(() => import("./pages/Groups"));
const Call = lazy(() => import('./pages/Call'));

function Routing() {
  const { user, isLoading } = useSelector(state => state.auth);
  const { setUiState } = MyToggleUiValues()
  const dispatch = useDispatch();

  axios.interceptors.response.use(// adding interceptor, so that user will logout when midlleware sends request 497
    (res) => {
      // Successful response
      if (res.status === 497) {
        dispatch(userNotExist()); // Update Redux store or state
      }
      return res; // Pass the response to the next handler
    },
    (error) => {
      // Error response
      if (error.response && error.response.status === 497) { //Detected status 497 in error response. Logging out user...
        dispatch(userNotExist());
      }
      return Promise.reject(error); // Pass the error to the next handler
    }
  )

  useEffect(() => {
    const fetchingUserData = async () => {
      const toastId = toast.loading("fetching user data...")
      try {
        const res = await fetch_user_data();

        if (res.status === 200) {
          dispatch(userExist(res?.data?.message));
          toast.update(toastId, {
            render: "user data fetched Successfully",
            type: "success",
            isLoading: false,
            autoClose: 1000,
          })
        } else {
          toast.update(toastId, {
            render: res?.data?.message,
            type: "info",
            isLoading: false,
            autoClose: 1000,
          })
        }
      } catch (error) {
        console.log(error);
        toast.update(toastId, {
          render: error?.response?.data?.message || error?.message || "something went wrong in getting user details",
          type: "error",
          isLoading: false,
          autoClose: 1000,
        })
        dispatch(userNotExist());
      }
    }
    fetchingUserData();
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>


        <Route element={<ProtectRoutes conditionValue={user && !user.isLoading} navigateTo={"/signin"} />}> {/*protecting inside routes*/}
          <Route path="/" element={<SocketProvider><RootLayout /></SocketProvider>} errorElement={<Error />}>
            <Route element={<PublicLayout />}>
              <Route index element={<Suspense fallback={<LayoutLoader />}><Home /></Suspense>} />
              <Route path="groups" element={<Suspense fallback={<LayoutLoader />}><Groups /></Suspense>} />

              <Route path="chat" element={<Suspense fallback={<LayoutLoader />}><ChatWindow /></Suspense>} />
              <Route path="chat/:chatId" element={<Suspense fallback={<LayoutLoader />}><ChatWindow /></Suspense>} />

              <Route path="call" element={<Suspense fallback={<LayoutLoader />}><Call /></Suspense>} />
              <Route path="call/:callId" element={<Suspense fallback={<LayoutLoader />}><Call /></Suspense>} />

              <Route path="signout" element={<Suspense fallback={<LayoutLoader />}><SignOut /></Suspense>} />
            </Route>

            {/* admin section */}
            <Route element={<ProtectRoutes conditionValue={user?.isAdmin} navigateTo={"/"} />}> {/*singin verified above, now checking for admin role*/}
              <Route path="admin" element={<AdminLayout />} >
                <Route index element={<Dashboard />} />
                <Route path="chats" element={<ChatManagement />} />
                <Route path="message" element={<MessageManagement />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
            </Route>

          </Route>
        </Route>

        <Route path="signin" element={<ProtectRoutes conditionValue={!user} navigateTo={"/"}><Suspense fallback={<LayoutLoader />}><SignIn /></Suspense></ProtectRoutes>} />
        <Route path="auth/google/callback" element={<ProtectRoutes conditionValue={!user} navigateTo={"/"}><Suspense fallback={<LayoutLoader />}><LoginWithGoogle /></Suspense></ProtectRoutes>} />
        <Route path="auth/twitter/callback" element={<ProtectRoutes conditionValue={!user} navigateTo={"/"}><Suspense fallback={<LayoutLoader />}><LoginWithTwitter /></Suspense></ProtectRoutes>} />
        <Route path="auth/facebook/callback" element={<ProtectRoutes conditionValue={!user} navigateTo={"/"}><Suspense fallback={<LayoutLoader />}><LoginWithFaceBook /></Suspense></ProtectRoutes>} />

        <Route path="signup" element={<Suspense fallback={<LayoutLoader />}><SignUp /></Suspense>} />


        <Route path="*" element={<Suspense fallback={<LayoutLoader />}><ErrorRoute /></Suspense>} />
      </Route>
    )
  );
  return isLoading ? <LayoutLoader /> : (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default Routing;
