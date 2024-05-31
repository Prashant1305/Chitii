
import { Avatar, Container, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";

import { transformImage } from "../../components/lib/features";

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "avatar",
        headerName: "Avatar",
        headerClassName: "table-header",
        width: 150,
        renderCell: (params) => (
            <Avatar alt={params.row.name} src={params.row.avatar} />
        ),
    },

    {
        field: "name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "username",
        headerName: "Username",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "friends",
        headerName: "Friends",
        headerClassName: "table-header",
        width: 150,
    },
    {
        field: "groups",
        headerName: "Groups",
        headerClassName: "table-header",
        width: 200,
    },
];
const UserManagement = () => {


    const [rows, setRows] = useState([]);

    // useEffect(() => {
    //     if (data) {
    //         setRows(
    //             data.users.map((i) => ({
    //                 ...i,
    //                 id: i._id,
    //                 avatar: transformImage(i.avatar, 50),
    //             }))
    //         );
    //     }
    // }, [data]);

    return (
        <Container>
            {/* {loading ? (
                <Skeleton height={"100vh"} />
            ) : ( */}
            <Table heading={"All Users"} columns={columns} rows={rows} />
            {/* )} */}
        </Container>
    );
};

export default UserManagement;