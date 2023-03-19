const mongoose = require("mongoose");

// Suppress the warning by setting strictQuery to true
mongoose.set('strictQuery', true);

const Auth_User = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: true
    }
});

module.exports = mongoose.model("Users", Auth_User);