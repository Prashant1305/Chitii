import React from 'react';
import { Helmet } from "react-helmet-async";
function Title({ title = "Chitii app", description = "This is chat app made by Prash" }) {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name='description' content={description} />
        </Helmet>
    )
}

export default Title