import { Avatar, Container, Skeleton, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AvatarCard from "../../components/shared/AvatarCard";
import Table from "../../components/shared/Table";
import { all_chats_api } from "../../utils/ApiUtils";

const columns = [
    {
        field: "_id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 300,
    },

    {
        field: "group_chat",
        headerName: "Group",
        headerClassName: "table-header",
        width: 100,
    },
    {
        field: "totalMembers",
        headerName: "Total Members",
        headerClassName: "table-header",
        width: 120,
    },
    {
        field: "members_dp",
        headerName: "Members",
        headerClassName: "table-header",
        width: 400,
        renderCell: (params) => (
            <AvatarCard max={100} avatar={params.row.members_dp} />
        ),
    },
    {
        field: "totalMessages",
        headerName: "Total Messages",
        headerClassName: "table-header",
        width: 120,
    },
    {
        field: "creator",
        headerName: "Created By",
        headerClassName: "table-header",
        width: 250,
        renderCell: (params) => (
            params.row.group_chat ?
                <Stack direction="row" alignItems="center" spacing={"1rem"}>
                    <Avatar alt={params.row.creator.user_name} src={params.row.creator.avatar_url} />
                    <span>{params.row.creator.user_name}</span>
                </Stack> :
                <Stack direction="row" alignItems="center" spacing={"1rem"}>

                </Stack>

        ),
    },
];

const ChatManagement = () => {
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await all_chats_api();
                if (res.status === 200) {
                    setRows(res.data.message.map((i) => ({
                        ...i,
                        id: i._id,
                        totalMembers: i.members.length,
                        members_dp: i.members.map((member) => member.avatar_url),
                    })));
                }
            } catch (error) {
                console.log(error)
                toast.error("failed to fetch data");
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <Container>
            {isLoading ? (
                <Skeleton height={"100vh"} />
            ) : (
                <Table heading={"All Chats"} columns={columns} rows={rows} />
            )}
        </Container>
    );
};

export default ChatManagement;