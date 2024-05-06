import React, { useState } from 'react'
import "./Sign.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { login_api } from '../utils/ApiUtils';

function SignIn() {
    const [userData, setUserData] = useState({
        email: "",
        password: "",
    })
    const [btnActive, setbtnActive] = useState(false);
    // const { setIsLogin } = MyLoginValues();
    const navigate = useNavigate();
    const handlesubmit = async (e) => {
        e.preventDefault();
        try {

            const res = await login_api({ emailOrUsername: userData.email, password: userData.password });
            console.dir(res);

        } catch (error) {

        }
    }
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.id]: e.target.value });
        if (userData.email !== "" && userData.password.length > 0) {
            setbtnActive(true);
        }
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
                                <label htmlFor='Email'>Email</label>
                                <input type='text' name="email" id="email" placeholder='abc@domain.com' onChange={(e) => { handleChange(e) }} value={userData.email} />
                            </div>
                            <div className='form_data'>
                                <label htmlFor='password'>Password</label>
                                <input type='password' name="password" id="password" placeholder='At least 6 character' onChange={(e) => { handleChange(e) }} value={userData.password} />
                            </div>

                            {btnActive && <button className='signin_btn' onClick={(e) => {
                                handlesubmit(e);
                            }}>Submit</button >}

                            {!btnActive && <button className='signin_btn' disabled>Submit</button >}
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
                        <div><img src='./google_logo.png' /></div>
                        <div><img src='./facebook_logo.png' /></div>
                        <div><img src='./twitter_logo.png' /></div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default SignIn