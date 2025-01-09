import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login_via_twitter } from '../../utils/ApiUtils';
import { toast } from 'react-toastify';
import { userExist } from '../../redux/reducers/Auth';
import PageLoader from '../../components/shared/pageLoader/PageLoader';

function LoginWithTwitter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [csrfDetected, setCsrfDetected] = useState(false);
    // Access specific query parameter
    const code = searchParams.get('code');
    const state = searchParams.get('state')
    const error = searchParams.get('error');
    console.log({ code }, localStorage.getItem('twitterState'))
    useEffect(() => {
        const initiateLoginWithTwitterViaCode = async (code) => {
            const toastId = toast.loading("Contacting twitter...")
            debugger
            try {
                const res = await login_via_twitter(code, localStorage.getItem('twitterCodeVerifier'));
                if (res.status === 200) {
                    dispatch(userExist(res.data.user));
                    toast.update(toastId, {
                        render: "Logged in successfully",
                        type: "success",
                        isLoading: false,
                        autoClose: 1000,

                    })
                    navigate('/');
                }
            } catch (error) {
                console.log(error);
                toast.update(toastId, {
                    render: "Failed to login with twitter",
                    type: "error",
                    isLoading: false,
                    autoClose: 1000,

                });
                navigate("/signin");
            } finally {
                localStorage.removeItem('twitterCodeVerifier');
                localStorage.removeItem('twitterState');
            }
        }
        if (state !== localStorage.getItem("twitterState")) {
            setCsrfDetected(true)
        }
        else if (code) {
            initiateLoginWithTwitterViaCode(code);
        }
    }, [])
    return (
        <>{csrfDetected ? (<h1>CSRF (Cross-Site Request Forgery)</h1>) :
            (<div><PageLoader /></div>)}</>
    )
}

export default LoginWithTwitter