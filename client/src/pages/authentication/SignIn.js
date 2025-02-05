import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { userExist, userNotExist } from '../../redux/reducers/Auth';
import { login_api } from '../../utils/ApiUtils';
import "./Sign.css";
import { generateCodeChallenge, generateCodeVerifier } from './AuthHelper';

function SignIn() {
    const [userData, setUserData] = useState({
        email: "",
        password: "",
    })
    const [btnActive, setbtnActive] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loginLoading, setLoginLoading] = useState(false)
    const handlesubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("verifying...")
        setLoginLoading(true)
        try {
            const res = await login_api({ emailOrUsername: userData.email, password: userData.password });
            if (res.status === 200) {
                // user details will be stored from Routing section
                dispatch(userExist(res.data.user));
                toast.update(toastId, {
                    render: "Login Succesfull",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
                navigate("/");
            } else {
                dispatch(userNotExist());
                toast.update(toastId, {
                    render: res?.data?.message || "Invalid Credentials",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }

        } catch (error) {
            toast.update(toastId, {
                render: error?.response?.data?.message || "Invalid Credentials",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
            dispatch(userNotExist())
            console.log(error);
        }
        finally {
            setLoginLoading(false)
        }
    }
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.id]: e.target.value });
    }

    useEffect(() => {
        if (userData.email !== "" && userData.password.length > 0) {
            setbtnActive(true);
        } else {
            setbtnActive(false);
        }
    }, [userData]);

    const redirectToGoogle = () => {
        const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = {
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
            response_type: 'code',
            // scope: 'openid email profile',
            scope: 'openid email profile https://www.googleapis.com/auth/user.phonenumbers.read', // generate code for getting fullname, userInfo, phoneNumber
            // access_type: 'offline', // Add this for refresh token support
            prompt: 'consent', // Ensures the consent screen is always shown
        };
        const queryString = new URLSearchParams(params).toString();
        window.location.href = `${googleAuthUrl}?${queryString}`;
    }

    const redirectToTwitter = async () => {

        const codeVerifier = generateCodeVerifier();
        const state = generateCodeVerifier();

        // storoing in local storage
        localStorage.setItem('twitterCodeVerifier', codeVerifier);
        localStorage.setItem('twitterState', state);

        const codeChallenge = await generateCodeChallenge(codeVerifier);

        const twitterAuthUrl = 'https://twitter.com/i/oauth2/authorize';
        const params = {
            client_id: process.env.REACT_APP_TWITTER_CLIENT_ID, // Your Twitter Client ID
            redirect_uri: process.env.REACT_APP_TWITTER_REDIRECT_URI, // Your Redirect URI
            response_type: 'code', // Request an authorization code
            // scope: 'tweet.read users.read email offline.access', //Permissions to request (adjust based on your app's needs)
            state, // Optional: CSRF token to validate the response
            code_challenge: codeChallenge, // Code challenge for PKCE
            code_challenge_method: 'S256', // Use SHA-256 for code challenge method
        };

        const queryString = new URLSearchParams(params).toString();
        window.location.href = `${twitterAuthUrl}?${queryString}`;
    };
    const redirectToFacebook = async () => {
        const facebookCodeVerifier = generateCodeVerifier();
        const state = generateCodeVerifier();
        localStorage.setItem('facebookState', state);
        localStorage.setItem('facebookCodeVerifier', facebookCodeVerifier);
        const codeChallenge = await generateCodeChallenge(facebookCodeVerifier);
        const facebookAuthUrl = "https://www.facebook.com/v15.0/dialog/oauth"; const params = {
            client_id: process.env.REACT_APP_FACEBOOK_CLIENT_ID,
            redirect_uri: process.env.REACT_APP_FACEBOOK_REDIRECT_URI,
            state, // Optional CSRF protection 
            scope: "email", // Request email permission 
            response_type: 'code',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',  // Use SHA-256 for code challenge
        };
        const queryString = new URLSearchParams(params).toString();
        window.location.href = `${facebookAuthUrl}?${queryString}`;
    }
    return (
        <>
            <section>
                <div className='sign_container'>
                    <div className='sign_header'>
                        <img src='./chitii_logo.png' alt='chitii_logo' />
                    </div>
                    <div className='sign_form'>
                        <form >
                            <h1>Sign-In</h1>
                            <div className='form_data'>
                                <label htmlFor='Email'>Email / User Name</label>
                                <input type='text' name="email" id="email" placeholder='abc@domain.com' onChange={(e) => { handleChange(e) }} value={userData.email} />
                            </div>
                            <div className='form_data'>
                                <label htmlFor='password'>Password</label>
                                <input type='password' name="password" id="password" placeholder='At least 6 character' onChange={(e) => { handleChange(e) }} value={userData.password} />
                            </div>

                            {btnActive && <button className='signin_btn' disabled={loginLoading} onClick={(e) => {
                                handlesubmit(e);
                            }}>Submit</button >}


                        </form>
                    </div>
                    <div className='create_accountinfo'>
                        <p>New to Chitii</p>
                        <button onClick={() => {
                            navigate("/signup");
                        }}>Create your Chitii Account</button>
                    </div>

                </div>
                <hr />
                <div className='login_with_other'>
                    <div className='heading_of_logo_container'> Login with</div>
                    <div className='logo_container'>
                        <div onClick={() => {
                            redirectToGoogle()
                        }}>
                            <img src='./google_logo.png' alt='google_logo' />
                        </div>

                        <div onClick={() => {
                            redirectToFacebook()
                        }}>
                            <img src='./facebook_logo.png' alt='facebook_logo' />
                        </div>

                        <div onClick={async () => {
                            // await redirectToTwitter()

                            toast.info("Twitter has disabled email temporarily for oAuth2.O")
                        }}>
                            <img src='./twitter_logo.png' alt='twitter_logo' />
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default SignIn