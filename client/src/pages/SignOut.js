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
        const toastId = toast.loading("Singing out...")
        try {
            const res = await logout();
            if (res.status === 200) {
                dispatch(userNotExist());
                toast.update(toastId, {
                    render: "SingOut Successfull",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
            } else {
                toast.update(toastId, {
                    render: res.data.message || "oops! failed to signOut",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }

        } catch (error) {
            console.log(error);
            toast.update(toastId, {
                render: error?.response?.data?.message || "logout Failed",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
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