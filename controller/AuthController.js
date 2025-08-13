let userModel = require("../model/Auth.model.js");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");

let registerUser = async (req, res) => {
    let userData = req.body;
    console.log("Registering user:", userData.username);
    try {
        if (
            !userData.password ||
            !userData.confirm_password ||
            typeof userData.password !== "string" ||
            typeof userData.confirm_password !== "string"
        ) {
            return res.status(400).json({
                user_data: null,
                message: "Password and confirm password are required and must be strings.",
                status: "Error"
            });
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const hashedConfirmPassword = await bcrypt.hash(userData.confirm_password, 10);

        let newUser = new userModel({
            username: userData.username,
            password: hashedPassword,
            confirm_password: hashedConfirmPassword,
            email: userData.email,
            profile_image: req.file
                ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
                : null,
            gender: userData.gender,
            contact_number: userData.contact_number,
            address: userData.address,
        });
        await newUser.save();
        console.log("User registered successfully:", newUser.username);
        res.status(201).json({
            user_data: userData,
            message: "User registered successfully",
            status: "Success"
        });

    } catch (error) {
        console.log("User registration failed:", error.message);
        res.status(500).json({
            user_data: null,
            message: error.message,
            status: "Error"
        });
    }
}

let loginUser = async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await userModel.findOne({ username });
        console.log(user)
        if (!user) {
            return res.status(401).json({
                user_data: null,
                message: "Invalid username or password.",
                status: "Error"
            });
            console.log("user not found")
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                user_data: null,
                message: "Invalid username or password.",
                status: "Error"
            });
             console.log("Invalid username or password.")
        }

        // Generating JWT access token
        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.LOGIN_JWT_KEY || "Qw8!vZ2@rT7#pL6$eF9^bN4&xS1*oM3%jH5",
            { expiresIn: "1h" }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_REFRESH_SECRET || "R7!kLp2@xV9#zQ4$wT8^nB3&sF6*mJ1%yH0",
            { expiresIn: "7d" }
        );


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            user_data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile_image: user.profile_image,
                gender: user.gender,
                contact_number: user.contact_number,
                address: user.address
            },
            accessToken,
            message: "Login successful",
            status: "Success"
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        res.status(500).json({
            user_data: null,
            message: error.message,
            status: "Error"
        });
    }
}

    let getAllUsers = async (req, res) => {
        try {
            let users = await userModel.find({});
            res.status(200).json({
                user_data: users,
                status: 'Success',
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
            res.status(500).json({
                user_data: null,
                status: 'Error',
                message: error.message
            });
        }
    };


    let getUserByUsername = async (req, res) => {
        let username = req.query.username;
        console.log('Fetching user by username:', username);
        try {
            let user = await userModel.findOne({ username: username });
            if (user) {
                res.status(200).json({
                    user_data: user,
                    status: 'Success',
                });
            } else {
                res.status(404).json({
                    user_data: null,
                    status: 'Not Found',
                });
            }
        } catch (error) {
            console.error("Error fetching user by username:", error);
            res.status(200).json({
                user_data: user,
                status: 'Error',
            });
        }
    }

    let getUserById = async (req, res) => {
        let userId = req.params.id;
        console.log('Fetching user by ID:', userId);
        try {
            let user = await userModel.findOne({ _id: userId });
            if (user) {
                res.status(200).json({
                    user_data: user,
                    status: 'Success',
                });
            } else {
                res.status(404).json({
                    user_data: null,
                    status: 'Not Found',
                });
            }
        } catch (error) {
            console.error("Error fetching user by username:", error);
            res.status(200).json({
                user_data: user,
                status: 'Error',
            });
        }
    }




    module.exports = {
        registerUser,
        getUserByUsername,
        getAllUsers,
        getUserById,
        loginUser
    }