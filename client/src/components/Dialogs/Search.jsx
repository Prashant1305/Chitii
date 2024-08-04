import { Search as SearchIcon } from '@mui/icons-material';
import { Dialog, DialogTitle, InputAdornment, List, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MyToggleUiValues } from '../../context/ToggleUi';
import { search_user, send_friend_request } from '../../utils/ApiUtils';
import UserItem from '../shared/UserItem';

function Search() {
    const [searchText, setSearchText] = useState("");
    const { uiState, setUiState } = MyToggleUiValues();
    const [users, setUsers] = useState([])
    const [friendRequestSent, setFriendRequestSent] = useState([]);


    const changeHandler = (e) => {
        setSearchText(`${e.currentTarget.value}`)
    }
    const [isLoadingSendFriendRequest, setIsLoadingSendFriendRequest] = useState([]);
    const addFriendHandler = async (id) => {
        setIsLoadingSendFriendRequest([...isLoadingSendFriendRequest, id]);
        const toastId = toast.loading("sending friend request...");
        try {
            const res = await send_friend_request(id);
            if (res.status === 200) {
                toast.update(toastId, {
                    render: "friend request sent successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                })
            } else {
                toast.update(toastId, {
                    render: res.data.message || "oops",
                    type: "info",
                    isLoading: false,
                    autoClose: 1000,
                })
            }
        } catch (error) {
            console.log(error)
            toast.update(toastId, {
                render: error?.response?.data?.message || "failed to send request, plz try later",
                type: "error",
                isLoading: false,
                autoClose: 1000,
            })
        }
        finally {
            setIsLoadingSendFriendRequest(isLoadingSendFriendRequest.filter((item) => item !== id));
        }
    }

    useEffect(() => {
        const fetchSearchedUsers = async (searchText) => {
            try {
                const res = await search_user(searchText);
                if (res.status === 200) {
                    setUsers(res.data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message || "failed to retrive searched users, plz try later")
            }
        }
        const timeOutId = setTimeout(() => {
            fetchSearchedUsers(searchText);
            // console.log("search_Value", searchText);
        }, 1000);

        return () => {
            clearTimeout(timeOutId);
        }

    }, [searchText]);
    return (
        <Dialog open={uiState.isSearch} onClose={() => {
            setUiState({ ...uiState, isSearch: false });
        }}>
            <Stack p={"2rem"} direction={"column"} width={"25rem"}>
                <DialogTitle textAlign={"center"}>Find People</DialogTitle>
                <TextField label="" value={searchText} onChange={changeHandler} placeholder='user_name or full_name'
                    variant='outlined'
                    size='small'
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
                <List>
                    {
                        users.map((user) => (
                            <UserItem user={user} key={user._id} handler={addFriendHandler} handlerIsLoading={isLoadingSendFriendRequest.includes(user._id)} />
                        ))
                    }
                </List>
            </Stack>
        </Dialog>
    )
}

export default Search