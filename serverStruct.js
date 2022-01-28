import mongoose from 'mongoose';

const postSchema=mongoose.Schema({
    serverName:String,
    preferredChannel:String,
    preferredChannelName:String,
    serverNameNum:String
});
const ServerStruct = mongoose.model('ServerStruct', postSchema);
export default ServerStruct;