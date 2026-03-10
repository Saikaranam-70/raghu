const Admin = require("../model/Admin")
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const middleware = require("../middleware/middleware");

const router = express.Router();

router.get("/create", async(req, res)=>{
    try {

        const admin = await Admin.findOne();

        if(admin){
            return res.status(400).json({message: "Admin Already Exists"});
        }

        const newAdmin = new Admin({
            username: "raghu",
            password: await bcrypt.hash("admin@123", 10)
        })

        await newAdmin.save();

        return res.status(200).json({message: "Created Successfully"});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/login", async(req, res) => {
    try {

        const {username, password} = req.body;

        const admin = await Admin.findOne({username});

        if(!admin){
            console.log("Not Found");
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if(!isMatch){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const token = jwt.sign(
            {id: admin._id},
            process.env.SECRET,
            {expiresIn: "1h"}
        );

        return res.status(200).json({
            message: "Login Success",
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
})

router.post("/update", middleware, async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = req.admin;
    console.log("called");

    if (username) admin.username = username;
    

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.json({ message: "Admin updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router