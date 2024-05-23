import { Dialog, DialogTitle, InputAdornment, List, ListItem, ListItemText, Stack, TextField } from '@mui/material'
import React, { useState } from 'react'
import { Search as SearchIcon } from '@mui/icons-material';
import UserItem from '../shared/UserItem';
import { sampleUsers } from '../constants/sampleData';
import { MyToggleUiValues } from '../../context/ToggleUi';

function Search() {
    const [search, setSearch] = useState("");
    const { isSearch, setIsSearch } = MyToggleUiValues()

    const changeHandler = (e) => {
        // console.dir(e.currentTarget.value);
        setSearch(`${e.currentTarget.value}`)
    }
    let isLoadingSendFriendRequest = false;
    const addFriendHandler = (id) => {
        console.log(id);
    }
    const [users, setUsers] = useState(sampleUsers) // temporary array
    return (
        <Dialog open={isSearch} onClose={() => { setIsSearch(prev => !prev) }}>
            <Stack p={"2rem"} direction={"column"} width={"25rem"}>
                <DialogTitle textAlign={"center"}>Find People</DialogTitle>
                <TextField label="" value={search} onChange={changeHandler}
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
                            <UserItem user={user} key={user._id} handler={addFriendHandler} handlerIsLoading={isLoadingSendFriendRequest} />
                        ))
                    }
                </List>
            </Stack>
        </Dialog>
    )
}

export default Search