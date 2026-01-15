const mongoose = require("mongoose");
const Jobschema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    Experience: String,
    category: String,
    aboutCompany: String,
    aboutJob: String,
    whoCanApply: String,
    perks: Array,
    CTC: String,
    StartDate: String,
    additionalInfo: String,
    createdAt:{
        type:Date,
        default:Date.now,
    }
})

module.exports = mongoose.model("Job", Jobschema)