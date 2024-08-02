import React, { useEffect, useState } from 'react'
import "./Sign.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { login_api } from '../utils/ApiUtils';
import { useDispatch } from 'react-redux';
import { userExist, userNotExist } from '../redux/reducers/Auth';

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
                                <label htmlFor='Email'>Email</label>
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
                        <div><img src='./google_logo.png' alt='google_logo' /></div>
                        <div><img src='./facebook_logo.png' alt='facebook_logo' /></div>
                        <div><img src='./twitter_logo.png' alt='twitter_logo' /></div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default SignIn