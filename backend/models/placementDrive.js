import mongoose from "mongoose";

const placementDriveSchema=new mongoose.Schema(
    {
        company:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Company",
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:String,
        jobType: {
        type: String,
        enum: ["Full Time", "Internship", "Internship + Full Time"]
        },
        salary:Number,
        location:String,

        eligibility: {

        minCgpa: Number,

        minTenthPercentage: Number,

        minTwelfthPercentage: Number,

        allowedBranches: [String],

        graduationYear: Number,

        backlogsAllowed: {
            type: Boolean,
            default: false
        }
       },

       applicationDeadline: Date,

       driveDate: Date,

        status: {
        type: String,
        enum: [
            "Upcoming",
            "Open",
            "Closed",
            "Completed"
        ],
        default: "Upcoming"
        }

    },{ timestamps: true }
);

export const PlacementDrive=mongoose.model("PlacementDrive",placementDriveSchema);