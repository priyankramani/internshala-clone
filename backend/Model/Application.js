const mongoose = require("mongoose")
const Applicationschema = new mongoose.Schema({
    company : String,
    category : String,
    coverLetter : String,
    user : Object,
    createdAt:{
        type:Date,
        default:Date.now,
    },
    status : {
        type : String,
        enum:["approved", "accepted", "rejected"],
        default: "pending"
    }, 
    Application:Object,
})

module.exports = mongoose.model("Application", Applicationschema)