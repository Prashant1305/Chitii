import { useFetchData } from "6pp";
import { Avatar, Box, Container, Skeleton, Stack } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import RenderAttachment from "../../components/shared/RenderAttachment";
import Table from "../../components/shared/Table";
// import { server } from "../../constants/config";
// import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "../../components/lib/features";
import { toast } from "react-toastify";
import { all_messages_api } from "../../utils/ApiUtils";

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "attachments",
        headerName: "Attachments",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => {
            const { attachments } = params.row;

            return attachments?.length > 0
                ? attachments.map((i) => {
                    const url = i.url;
                    const file = fileFormat(url);

                    return (
                        <Box>
                            <a
                                href={url}
                                download
                                target="_blank"
                                style={{
                                    color: "black",
                                }}
                            >
                                {RenderAttachment(file, url)}
                            </a>
                        </Box>
                    );
                })
                : "No Attachments";
        },
    },

    {
        field: "text_content",
        headerName: "Content",
        headerClassName: "table-header",
        width: 400,
    },
    {
        field: "sender",
        headerName: "Sent By",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => (
            <Stack direction={"row"} spacing={"1rem"} alignItems={"center"} >
                <Avatar alt={params.row.sender.user_name} src={params.row.sender.avatar_url} />
                <span>{params.row.sender.user_name}</span>
            </Stack>
        ),
    },
    {
        field: "chat",
        headerName: "Chat",
        headerClassName: "table-header",
        width: 220,
    },
    {
        field: "group_chat",
        headerName: "Group Chat",
        headerClassName: "table-header",
        width: 100,
    },
    {
        field: "createdAt",
        headerName: "Time",
        headerClassName: "table-header",
        width: 250,
    },
];

const MessageManagement = () => {

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await all_messages_api();
                if (res.status === 200) {
                    setRows(res.data.messages.map((i) => ({
                        ...i,
                        id: i._id,
                        group_chat: i.chat.group_chat,
                        chat: i.chat.name
                    })));
                    setLoading(false);
                }
            } catch (error) {
                console.log(error);
                toast.error("failed to fetch data");
            }
        }
        fetchData();
    }, []);

    return (
        <Container>
            {loading ? (
                <Skeleton height={"100vh"} />
            ) : (
                <Table
                    heading={"All Messages"}
                    columns={columns}
                    rows={rows}
                    rowHeight={100}
                />
            )}
        </Container>
    );
};

export default MessageManagement;