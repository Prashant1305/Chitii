import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function LoginWithGoogle() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Access specific query parameter
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    useEffect(() => {
        if (error === "access_denied") {
            console.log(error)
            navigate("/signin");
        }
    }, [error])
    console.log(code)
    return (
        <div>LoginWithGoogle</div>
    )
}

export default LoginWithGoogle