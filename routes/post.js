const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    title: String,
    postinfo: String,
    photo:String,
});

module.exports =  mongoose.model('post', postSchema);
