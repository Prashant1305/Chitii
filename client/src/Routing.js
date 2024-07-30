import React, { lazy, Suspense, useEffect } from "react";
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
import { fetch_user_data } from "./utils/ApiUtils";
import { useDispatch, useSelector } from "react-redux";
import { userExist, userNotExist } from "./redux/reducers/Auth";


// import ErrorRoute from "./pages/ErrorRoute";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Home from "./pages/Home";
// import SignOut from "./pages/SignOut";
// import Error from "./pages/Error";
import RootLayout from "./components/layout/RootLayout";
import { toast } from "react-toastify";
import SocketProvider from "./utils/Socket";
// import Groups from "./pages/Groups";
// import Chat from "./pages/Chat";

const Home = lazy(() => import("./pages/Home")); // using lazy, now this page will load when needed at first
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ErrorRoute = lazy(() => import("./pages/ErrorRoute"));
const SignOut = lazy(() => import("./pages/SignOut"));
const Error = lazy(() => import("./pages/Error"));
const Groups = lazy(() => import("./pages/Groups"));
const Chat = lazy(() => import("./components/ChatWindow/Chat"));

function Routing() {
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();

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
            render: res.data.message,
            type: "info",
            isLoading: false,
            autoClose: 1000,
          })
        }
      } catch (error) {
        console.log(error);
        toast.update(toastId, {
          render: error.response.data.message || "something went wrong in getting user details",
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
