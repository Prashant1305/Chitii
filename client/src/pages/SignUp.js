import React, { useState } from "react";
import "./Sign.css";
import { NavLink, useNavigate } from "react-router-dom";
import Stack from '@mui/material/Stack';

import { toast } from 'react-toastify';
import { Avatar, IconButton, Typography } from "@mui/material";
import { CameraAlt } from "@mui/icons-material"
import { VisuallyHiddenInput } from "../components/styles/StyledComponent";
import { useFileHandler } from "6pp";
import { signup_api } from "../utils/ApiUtils";

function SignUp() {
  const [userData, setUserData] = useState({
    full_name: "",
    user_name: "",
    mobile_number: "",
    email: "",
    gender: "",
    avatar_url: "",
    password: "",
    passwordAgain: "",
  });
  const navigate = useNavigate();
  const avatar = useFileHandler("single")
  const handlesubmit = async (e) => {
    e.preventDefault();
    // console.log(userData);
    try {
      if (userData.password.length > 0 && userData.password === userData.passwordAgain) {
        const form_data = new FormData();
        if (avatar.file) { form_data.append("avatar_url", avatar.file); }
        form_data.append("full_name", userData.full_name);
        form_data.append("user_name", userData.user_name);
        form_data.append("mobile_number", userData.mobile_number);
        form_data.append("email", userData.email);
        form_data.append("gender", userData.gender);
        form_data.append("password", userData.password);
        const res = await signup_api(form_data);
        if (res.status === 200) {
          navigate("../signin")
        }


      } else {
        toast.warning("password did not match");
        setUserData({ ...userData, password: "", passwordAgain: "" });
      }
    } catch (error) {
      toast.error(error.response.data.message || "something went unexpected")
      console.log(error)
    }
  };
  const handleChange = (e) => {
    if (e.target.id === 'mobile_number') {
      let str = e.target.value;
      if (str[str.length - 1] >= '0' && str[str.length - 1] <= 9) {
        setUserData({ ...userData, [e.target.id]: str });
      }
    }
    else {
      setUserData({ ...userData, [e.target.id]: e.target.value });
    }

  };
  return (
    <>
      <section>
        <div className="sign_container">
          <div className="sign_header">
            <img src="./chitii_logo.png" alt="chitii_logo" />
          </div>
          <div className="sign_form">
            <form onSubmit={handlesubmit}>
              <h1>Sign-Up</h1>
              <div className="avatar_form_data">
                <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                  <Avatar
                    sx={{ width: "10rem", height: "10rem", color: "rgb(3, 113, 202)", backgroundColor: "rgb(89, 173, 243)", objectFit: "contain" }}
                    src={avatar.preview} />
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      color: "rgb(3, 113, 202)",
                      bgcolor: "rgba(98, 170, 229,0.5)",
                      ":hover": {
                        bgcolor: "rgba(98, 170, 229,0.7)"
                      }
                    }}
                    component="label">
                    <>
                      <CameraAlt></CameraAlt>
                      <VisuallyHiddenInput type="file" onChange={(e) => {
                        avatar.changeHandler(e);
                        // console.log(avatar)
                      }} />
                    </>
                  </IconButton>

                </Stack>
                {avatar.error && (
                  <Typography m={"1rem auto"} color="error" variant="caption" width={"fit-content"} display={"block"}>{avatar.error}</Typography>
                )}
              </div>

              <div className="form_data">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  placeholder="Atleast 3 chracters "
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.full_name}
                />
              </div>
              <div className="form_data">
                <label htmlFor="user_name">Username</label>
                <input
                  type="text"
                  name="user_name"
                  id="user_name"
                  placeholder="Atleast 3 chracters "
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.user_name}
                />
              </div>
              <div className="form_data">
                <label htmlFor="Email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="abc@domain.com"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.email}
                />
              </div>
              <div className="form_data">
                <label htmlFor="mobile_number">Mobile No.</label>
                <input
                  type="text"
                  name="mobile_number"
                  id="mobile_number"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.mobile_number}
                />
              </div>
              <div className="form_data">
                <label htmlFor="gender">Gender</label>
                <input
                  type="text"
                  name="gender"
                  id="gender"
                  placeholder="Atleast 3 chracters "
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.gender}
                />
              </div>
              <div className="form_data">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="At least 6 character"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.password}
                />
              </div>
              <div className="form_data">
                <label htmlFor="passwordAgain">Password Again</label>
                <input
                  type="password"
                  name="asswordAgain"
                  id="passwordAgain"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  value={userData.passwordAgain}
                />
              </div>
              <button className="signin_btn">Continue</button>
              <div className="signin_info">
                <p>Already have an account?</p>
                <NavLink to="../signin">Signin</NavLink>
              </div>
            </form>
          </div>
        </div >
      </section >
    </>
  );
}

export default SignUp;
