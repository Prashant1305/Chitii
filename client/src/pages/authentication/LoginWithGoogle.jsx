import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login_via_google } from '../../utils/ApiUtils';
import { userExist } from '../../redux/reducers/Auth';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

function LoginWithGoogle() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    // Access specific query parameter
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    useEffect(() => {
        const initiateLoginWithGoogleViaCode = async (code) => {
            if (error === "access_denied") {
                console.log(error)
                navigate("/signin");
            } else {
                const toastId = toast.loading("Contacting google...")
                try {
                    const res = await login_via_google(code);
                    if (res.status === 200) {
                        dispatch(userExist(res.data.user));
                        toast.update(toastId, {
                            render: "Login Succesfull",
                            type: "success",
                            isLoading: false,
                            autoClose: 1000,
                        })
                        navigate("/");
                    } else {
                        toast.update(toastId, {
                            render: res?.data?.message || "Google seems busy",
                            type: "info",
                            isLoading: false,
                            autoClose: 1000,
                        })
                        navigate("/signin");

                    }
                } catch (error) {
                    toast.update(toastId, {
                        render: error?.response?.data?.message || "Failed to login with google",
                        type: "error",
                        isLoading: false,
                        autoClose: 1000,
                    })
                    navigate("/signin");
                    console.log(error);
                }
            }
        }
        initiateLoginWithGoogleViaCode(code);
    }, [error])
    console.log(code)
    return (
        <div>LoginWithGoogle</div>
    )
}

export default LoginWithGoogle