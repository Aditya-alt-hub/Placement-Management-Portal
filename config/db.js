import mongoose from "mongoose";

export const connectDB=async()=>
{
    try
    {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGO DB is Connected Successfully");
    }
    catch(error)
    {
        console.log(error);
    }
}