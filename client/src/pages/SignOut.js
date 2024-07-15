import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./Sign.css"
// import { MyLoginValues } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { userExist, userNotExist } from '../redux/reducers/Auth';
import { logout } from '../utils/ApiUtils';

function SignOut() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await logout();
            if (res.status === 200) {
                dispatch(userNotExist());
                toast.success("Logout Successful");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || "logout Failed")
        }
    }
    return (
        <>
            <section>
                <div className='sign_container'>
                    <div className='sign_header'>
                        <img src='chitii_logo.png' alt='chittiLogo' />
                    </div>
                    <div className='sign_form'>
                        <form onSubmit={handleSubmit}>
                            <h1>Sign-Out</h1>
                            <h2>Are Sure you want to logout?</h2>
                            <button className='signin_btn'>Yes</button>
                        </form>
                    </div>
                    <div className='create_accountinfo'>
                        <p>if not, here is your path</p>
                        <button onClick={() => {
                            navigate("../");
                        }}>Back to home</button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SignOut