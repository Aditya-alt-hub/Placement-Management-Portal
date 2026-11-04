import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

//register api

export const register = async (req, res) => {
  try {
    //fetch data from frontend object (req)
    const { name, password, email, role } = req.body;

    //validate required field
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name ,Email and Password is missing",
      });
    }

    //check if user already exists or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    //hash password
    const hasedPassword = await bycrypt.hash(password, 8);

    //create user
    const user = await User.create({
      name,
      email,
      password: hasedPassword,
      role: role || "student",
    });

    //send response to the client without password
    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(`Register error ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//login api

export const login = async (req, res) => {
  try {
    //fetch fields from client
    const { email, password } = req.body;

    //validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Something is Missing",
      });
    }

    //find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //check if account is active or not
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    //check if login password is matching to register hashedpassword
    const isPasswordCorrect = await bycrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //generate jwt token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "2d" },
    );

    //send response
    return res.status(201).json({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(`Login Error ${error}`);

    return res.status(500).json({
      success: false,
      message: "Login error",
    });
  }
};

//logout api

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: " logout Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
