
import { Avatar, Container, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import Table from "../../components/shared/Table";

import { toast } from "react-toastify";
import { admin_alluser_api } from "../../utils/ApiUtils";

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "avatar_url",
        headerName: "Avatar",
        headerClassName: "table-header",
        width: 150,
        renderCell: (params) => (
            <Avatar alt={params.row.name} src={params.row.avatar_url} />
        ),
    },

    {
        field: "full_name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "user_name",
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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await admin_alluser_api();
                if (res.status === 200) {
                    setRows(
                        res.data.message.map((i) => ({
                            ...i,
                            id: i._id,

                        })))
                    setIsLoading(false);
                }
            } catch (error) {
                console.log(error)
                toast.error(error?.response?.data?.message || "failed to retrive All users, plz try later");
            }
        }
        fetchUsers();

    }, []);

    return (
        <Container>
            {isLoading ? (
                <Skeleton height={"100vh"} />
            ) : (
                <Table heading={"All Users"} columns={columns} rows={rows} />
            )}
        </Container>
    );
};

export default UserManagement;