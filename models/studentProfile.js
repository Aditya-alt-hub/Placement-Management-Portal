import mongoose from "mongoose";
 
const studentProfileSchema=new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        enrollmentNumber:{
            type:String,
            unique:true
        },
        course:String,
        branch:String,
        graduationYear:Number,
        tenthPercentage:Number,
        twelfthPercentage:Number,
        cgpa:Number,
        backlogs: {
          type: Number,
          default: 0
        },

        skills:[String],

        projects: [
        {
            title: String,
            description: String,
            technologies: [String],
            github: String,
            deployedLink:String
        }
       ],

        resume: {
        url: String,
        publicId: String
        },

        placementStatus: {
        type: String,
        enum: [
            "Not Placed",
            "Placed"
        ],
        default: "Not Placed"
       },

       profilePhoto:
       {
            url: String,
            publicId: String
        }


    },{ timestamps: true }
);

export const StudentProfile=mongoose.model("StudentProfile",studentProfileSchema);