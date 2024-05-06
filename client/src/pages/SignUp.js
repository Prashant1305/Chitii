import React, { useState } from "react";
import "./Sign.css";
import { NavLink, useNavigate } from "react-router-dom";

import { toast } from 'react-toastify';
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
  const handlesubmit = async (e) => {
    e.preventDefault();
    // console.log(userData);
    if (userData.password.length > 0 && userData.password === userData.passwordAgain) {
      let temp = { ...userData };
      delete temp.passwordAgain;
      try {
        const res = await signup_api(temp);
        console.log(res)
        if (res.status === 200) {
          toast.success("Login Successfull");
        } else {
          toast.error(res.data.message);
          toast.error(res.data.extraDetails);
        }
      } catch (error) {
        toast.error("connection failed");
      }
    } else {
      toast.warning("password did not match");
      setUserData({ ...userData, password: "", passwordAgain: "" });
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
        </div>
      </section>
    </>
  );
}

export default SignUp;
