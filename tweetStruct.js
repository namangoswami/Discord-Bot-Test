import mongoose from 'mongoose';

const postSchema=mongoose.Schema({
    tweet:String
});
const tweetStruct = mongoose.model('TweetStruct', postSchema);
export default tweetStruct;