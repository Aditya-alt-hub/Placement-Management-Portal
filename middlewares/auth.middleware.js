import jwt from "jsonwebtoken";
import {User} from "../models/user.js";

export const protect=async (req,res,next)=>
{
    try
    {
        //get token from Authorization header
        const authHeader=req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer"))
        {
            return res.status(401).json(
                {
                    success:false,
                    message:"Authentication is required"
                }
            );
        }

        //extract token from auth header
        const  token=authHeader.split(" ")[1];

        //Verify Token
        const decoded=jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        //Find User
        const user=await User.findById(decoded.userId).select("-password");

        if(!user)
        {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        //check account status
         if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        //create a object req where we add user information

        req.user=user;

        next();
    }
    catch(error)
    {
         console.error("Auth Middleware Error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}