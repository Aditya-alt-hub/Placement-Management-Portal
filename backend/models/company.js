import mongoose from "mongoose";

const companySchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:String,
        website:String,
        logo:String,
        industry:String,
        location:String,

        recruiter:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        isApproved:{
            type:Boolean,
            default:false
        }
    },{timestamps:true}
);

export const Company=mongoose.model("Company",companySchema);