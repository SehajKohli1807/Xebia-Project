const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    phone: String,
    verified: Boolean,
    otpVerified: Boolean
})

const user = mongoose.model("user", userSchema);
module.exports = user;