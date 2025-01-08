import React, { useEffect, useRef, useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

function Login() {
  let emailInputRef = useRef();
  let passwordInputRef = useRef();
  let navigate = useNavigate();
  let dispatch = useDispatch();

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:4568";

    if (localStorage.getItem("token")) {
      //onValidateToken();
      axios.defaults.headers.common["Authorization"] =
        localStorage.getItem("token");
    }
  }, []);

  let onValidateToken = async () => {
    let dataToSend = new FormData();
    dataToSend.append("token", localStorage.getItem("token"));

    let reqOptions = {
      method: "POST",
      body: dataToSend,
    };

    let JSONData = await fetch(
      "http://localhost:4568/validateToken",
      reqOptions
    );

    let JSOData = await JSONData.json();
    console.log(JSOData);

    if (JSOData.status == "success") {
      dispatch({ type: "login", data: JSOData.data });
      navigate("/dashboard");
    }
  };

  // let onLogin = async () => {
  //   let dataToSend = new FormData();

  //   dataToSend.append("email", emailInputRef.current.value);
  //   dataToSend.append("password", passwordInputRef.current.value);

  //   let reqOptions = {
  //     method: "POST",
  //     body: dataToSend,
  //   };

  //   let JSONData = await fetch("http://localhost:4568/login", reqOptions);

  //   let JSOData = await JSONData.json();
  //   console.log(JSOData);

  //   if (JSOData.status == "success") {
  //     localStorage.setItem("token", JSOData.data.token);

  //     dispatch({ type: "login", data: JSOData.data });
  //     navigate("/dashboard");
  //   }

  //   alert(JSOData.msg);
  // };

  let onLogin = async () => {
    let dataToSend = new FormData();

    dataToSend.append("email", emailInputRef.current.value);
    dataToSend.append("password", passwordInputRef.current.value);

    let response = await axios.post("/login", dataToSend);

    console.log(response);

    if (response.data.status == "success") {
      localStorage.setItem("token", response.data.data.token);

      dispatch({ type: "login", data: response.data.data });
      navigate("/dashboard");
    }

    alert(response.data.msg);
  };

  return (
    <div className="App">
      <form>
        <h2>Login</h2>

        <div>
          <label>Email</label>
          <input ref={emailInputRef}></input>
        </div>
        <div>
          <label>Password</label>
          <input ref={passwordInputRef}></input>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              onLogin();
            }}
          >
            Login
          </button>
        </div>
      </form>
      <br></br>
      <br></br>
      <Link to="/signup">Signup</Link>
    </div>
  );
}

export default Login;
