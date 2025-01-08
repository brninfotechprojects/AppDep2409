const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "./client/build")));

let authorise = (req, res, next) => {
  console.log("inside authorise mwf");

  console.log(req.headers["authorization"]);

  next();
};

app.use(authorise);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);

    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.get("*", (req, res) => {
  res.sendFile("./client/build/index.html");
});

app.post("/signup", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  console.log(req.files);

  let hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      email: req.body.email,
      password: hashedPassword,
      mobileNo: req.body.mobileNo,
      profilePic: req.file.path,
    });

    await User.insertMany([newUser]);
    console.log("Inserted data into db");
    res.json({ status: "success", msg: "User created successfully." });
  } catch (err) {
    console.log("Unable to insert data into db");
    res.json({ status: "success", msg: "Unable to Create User." });
  }
});

app.post("/login", upload.none(), async (req, res) => {
  console.log(req.body);

  let userArr = await User.find().and({ email: req.body.email });

  if (userArr.length > 0) {
    let isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      userArr[0].password
    );

    if (isPasswordCorrect == true) {
      let token = jwt.sign(
        {
          email: req.body.email,
          password: req.body.password,
        },
        "lakalakalaka"
      );

      let dataToSend = {
        firstName: userArr[0].firstName,
        lastName: userArr[0].lastName,
        age: userArr[0].age,
        email: userArr[0].email,
        mobileNo: userArr[0].mobileNo,
        profilePic: userArr[0].profilePic,
        token: token,
      };

      res.json({
        status: "success",
        msg: "Credentials are correct.",
        data: dataToSend,
      });
    } else {
      res.json({ status: "failure", msg: "Invalid password." });
    }
  } else {
    res.json({ status: "failure", msg: "User does not exist." });
  }
});

app.post("/validateToken", upload.none(), async (req, res) => {
  console.log(req.body);

  let decryptedCredentials = jwt.verify(req.body.token, "lakalakalaka");

  console.log(decryptedCredentials);

  let userArr = await User.find().and({ email: decryptedCredentials.email });

  if (userArr.length > 0) {
    if (userArr[0].password == decryptedCredentials.password) {
      let dataToSend = {
        firstName: userArr[0].firstName,
        lastName: userArr[0].lastName,
        age: userArr[0].age,
        email: userArr[0].email,
        mobileNo: userArr[0].mobileNo,
        profilePic: userArr[0].profilePic,
      };

      res.json({
        status: "success",
        msg: "Credentials are correct.",
        data: dataToSend,
      });
    } else {
      res.json({ status: "failure", msg: "Invalid password." });
    }
  } else {
    res.json({ status: "failure", msg: "User does not exist." });
  }
});

app.patch("/updateProfile", upload.single("profilePic"), async (req, res) => {
  try {
    console.log(req.body);

    if (req.body.firstName.trim().length > 0) {
      await User.updateMany(
        { email: req.body.email },
        { firstName: req.body.firstName }
      );
    }

    if (req.body.lastName.trim().length > 0) {
      await User.updateMany(
        { email: req.body.email },
        { lastName: req.body.lastName }
      );
    }

    if (req.body.age > 0) {
      await User.updateMany({ email: req.body.email }, { age: req.body.age });
    }

    if (req.body.password.length > 0) {
      await User.updateMany(
        { email: req.body.email },
        { password: req.body.password }
      );
    }

    if (req.body.mobileNo.trim().length > 0) {
      await User.updateMany(
        { email: req.body.email },
        { mobileNo: req.body.mobileNo }
      );
    }

    if (req.file) {
      await User.updateMany(
        { email: req.body.email },
        { profilePic: req.file.path }
      );
    }

    res.json({ status: "success", msg: "Profile updated successfully." });
  } catch (err) {
    res.json({ status: "failure", msg: "Unable to update profile." });
  }
});

app.delete("/deleteProfile", upload.none(), async (req, res) => {
  try {
    console.log(req.body.email);

    let deleteObj = await User.deleteMany({ email: req.body.email });

    if (deleteObj.deletedCount > 0) {
      res.json({ status: "success", msg: "User deleted successfully." });
    } else {
      res.json({ status: "success", msg: "Nothing is deleted." });
    }
  } catch (err) {
    res.json({ status: "failure", msg: "Something is wrong", err: err });
  }
});

app.listen(process.env.port, () => {
  console.log(`listening to port ${process.env.port}`);
});

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  email: String,
  password: String,
  mobileNo: String,
  profilePic: String,
});

let User = new mongoose.model("users", userSchema, "users");

let connectToMDB = async () => {
  try {
    mongoose.connect(process.env.mdburl);

    console.log("Successfully connected to MDB");
    //insertDataIntoDB();
  } catch (err) {
    console.log("Unable to connec to MDB");
  }
};

connectToMDB();
