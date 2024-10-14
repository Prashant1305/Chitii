import { AudioFile as AudioFileIcon, Image as ImageIcon, UploadFile as UploadFileIcon, VideoFile as VideoFileIcon } from "@mui/icons-material";
import { IconButton, Menu, MenuItem, MenuList, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { MyToggleUiValues } from '../../context/ToggleUi';

function FileMenu({ anchor, files, setFiles }) {
    const { uiState, setUiState } = MyToggleUiValues();

    const fileChangeHandler = (e) => {
        // console.log("fileChangeHandler got fired")
        // console.dir(e.currentTarget.files)
        setFiles([...files, ...Array.from(e.currentTarget.files)]);
        setUiState((prev) => ({ ...prev, isFileMenu: false }));
    }

    const selectFileHandler = (e) => {
        e.currentTarget.children[2].click();
    }

    return (
        <Menu anchorEl={anchor} open={uiState.isFileMenu} onClose={() => {
            setUiState((prev) => ({ ...prev, isFileMenu: false }));
        }}>
            <div
                style={{
                    width: "10rem",
                }}>

                <MenuList>
                    <MenuItem onClick={selectFileHandler}>
                        <Tooltip title="image">
                            <IconButton>
                                <ImageIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography style={{ marginLeft: "0.5rem" }}>Image</Typography>
                        <input
                            type='file'
                            multiple
                            accept='image/png, image/jpeg, image/gif'
                            style={{ display: "none" }}
                            onChange={(e) => {
                                fileChangeHandler(e, "Images");
                            }} />
                    </MenuItem>

                    <MenuItem onClick={selectFileHandler}>
                        <Tooltip title="audio">
                            <IconButton>
                                <AudioFileIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography style={{ marginLeft: "0.5rem" }}>Audio</Typography>
                        <input
                            type='file'
                            multiple
                            accept='audio/mpeg, audio/wav,audio/.M4A'
                            style={{ display: "none" }}
                            onChange={(e) => {
                                fileChangeHandler(e, "Audios");
                            }} />
                    </MenuItem>

                    <MenuItem onClick={selectFileHandler}>
                        <Tooltip title="video">
                            <IconButton>
                                <VideoFileIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography style={{ marginLeft: "0.5rem" }}>Video</Typography>
                        <input
                            type='file'
                            multiple
                            accept='video/mp4, video/mpeg, video/ogg, video/webm'
                            style={{ display: "none" }}
                            onChange={(e) => {
                                fileChangeHandler(e, "Video");
                            }} />
                    </MenuItem>

                    <MenuItem onClick={selectFileHandler}>
                        <Tooltip title="file">
                            <IconButton>
                                <UploadFileIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography style={{ marginLeft: "0.5rem" }}>File</Typography>
                        <input
                            type='file'
                            multiple
                            accept='*'
                            style={{ display: "none" }}
                            onChange={(e) => {
                                fileChangeHandler(e, "File");
                            }} />
                    </MenuItem>
                </MenuList>
            </div>
        </Menu >
    )
}

export default FileMenu