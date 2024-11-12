const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { //유저 정보
        type : String,
        required : [true, "User must have name"],
        unique : true, 
    },
    token :{ //유저 id 정보
        type:String,
    },
    online:{
        type : Boolean,
        default: false,
    },
});
module.exports = mongoose.model("User", userSchema);