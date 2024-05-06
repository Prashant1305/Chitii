import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./Sign.css"
// import { MyLoginValues } from '../Context/AuthContext';
import { toast } from 'react-toastify';

function SignOut() {
    const navigate = useNavigate();
    // const { setIsLogin } = MyLoginValues();
    const handleSubmit = (e) => {
        e.preventDefault();
        // setIsLogin(false);
        toast.success("Logout Successful");
        navigate('/');
    }
    return (
        <>
            <section>
                <div className='sign_container'>
                    <div className='sign_header'>
                        <img src='./blacklogodigitalstore.png' alt='digitalstoreLogo' />
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