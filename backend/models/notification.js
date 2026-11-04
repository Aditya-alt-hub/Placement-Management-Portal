import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    title: String,

    message: String,

    type: {
        type: String,
        enum: [
            "application",
            "drive",
            "interview",
            "selection",
            "system"
        ]
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export const Notification=mongoose.model("Notification",notificationSchema);