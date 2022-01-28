// import TwitterApi from 'twitter-api-v2';

// // Instanciate with desired auth type (here's Bearer v2 auth)
// const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAPxHVwEAAAAAvD2dkd68Z%2BZOQGfrsWWerGj8iV4%3Dry8MA3H4WxLJfMRsGea58yE7eTVjQ6q3YOOciYhPO7k0IVDvPb');

// // Tell typescript it's a readonly app
// const roClient = twitterClient.readOnly;

// // Play with the built in methods
// const user = await roClient.v2.userByUsername('notnamangoswami');
// console.log(user.data);
import dotenv from  'dotenv';
dotenv.config();
import {Client, Message} from 'discord.js';
import mongoose from 'mongoose';
import ServerStruct from  './serverStruct.js';
import tweetStruct from './tweetStruct.js';
import { Intents } from 'discord.js'
import twit from 'twit';
const T=new twit(
{
    consumer_key:process.env.T_APIKEY,
    consumer_secret:process.env.T_APISECRET,
    access_token:process.env.T_ACCESSTOKEN,
    access_token_secret:process.env.T_ACCESSSECRET
}
)
const client=new Client(({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
] }));
const serverChannelMap={};
var activeChannels=[];
client.on('ready', ()=>{
    console.log("LOGGED IN");
    
    ServerStruct.find().then(
      async  (data)=>{
            console.log(data)
            await data.forEach(i=>{
                serverChannelMap[i.serverNameNum]=i.preferredChannel;
                activeChannels.push(i.preferredChannel);
            });
            console.log(activeChannels)
            console.log("active channels",activeChannels)
            T.get('search/tweets',{q: 'UberFacts',count:100}, (err, data, res)=>{
               // console.log(data)
                if(data.statuses)
             {
                 data.statuses.forEach(async(i)=>{
                  //   console.log(i)
                     if(i.user.name=="UberFacts"&&!i.retweeted_status)
                     {
                            
                         await   tweetStruct.findOne({tweet:i.text}).then(data=>{
                                if(data==null)
                                {
                                    activeChannels.forEach(j=>{
                                        const channel=client.channels.cache.get(j);
                                        channel.send(i.text)
                                    })
                                    data=new tweetStruct({tweet:i.text});
                                    data.save();
                                }
                                
                            })
                     }
                 else if(i.retweeted_status)
                 {
                     if(i.retweeted_status.user.name=="UberFacts")
                 await    tweetStruct.findOne({tweet:i.retweeted_status.text}).then(data=>{
                        if(data==null)
                        {
                            activeChannels.forEach(j=>{
                                const channel=client.channels.cache.get(j);
                                channel.send(i.retweeted_status.text)
                            })
                            data=new tweetStruct({tweet:i.retweeted_status.text});
                            data.save();
                        }
                        
                    })
                 }
             })}
             })
            setInterval(()=>T.get('search/tweets',{q: 'UberFacts',count:100}, (err, data, res)=>{
                console.log(data)
                if(data.statuses)
             {
                data.statuses.forEach(async(i)=>{
                    //   console.log(i)
                       if(i.user.name=="UberFacts"&&!i.retweeted_status)
                       {
                              
                           await   tweetStruct.findOne({tweet:i.text}).then(data=>{
                                  if(data==null)
                                  {
                                      activeChannels.forEach(j=>{
                                          const channel=client.channels.cache.get(j);
                                          channel.send(i.text)
                                      })
                                      data=new tweetStruct({tweet:i.text});
                                      data.save();
                                  }
                                  
                              })
                       }
                   else if(i.retweeted_status)
                   {
                       if(i.retweeted_status.user.name=="UberFacts")
                   await    tweetStruct.findOne({tweet:i.retweeted_status.text}).then(data=>{
                          if(data==null)
                          {
                              activeChannels.forEach(j=>{
                                  const channel=client.channels.cache.get(j);
                                  channel.send(i.retweeted_status.text)
                              })
                              data=new tweetStruct({tweet:i.retweeted_status.text});
                              data.save();
                          }
                          
                      })
                   }
               })}
             }),36000)    
        }
    )
    // ServerStruct.deleteMany().then(
    //     data=>console.log(data)
    // );
        console.log("serverChannelMap",serverChannelMap)
    // const channelsAr=[];
    // client.channels.cache.forEach(i=>{
    //     console.log('channel', i.type);
    //     if(i.type=='GUILD_TEXT')
    //     channelsAr.push(i);
    // })
    // const channel=channelsAr[0]
    // console.log('channel',client.channels.cache.get(channel))
    // var i=0;
    // channel.send('Bot Online');
   

  
})
const prefix="-";
client.on('message', (message)=>{
    if(message.author.bot) return;
    console.log(message);
    const guild=message.guild;
    const channel=message.channel;
    //message.channel.send(`You are: ${message.author} and you sent: ${message.content}`);
    if(message.content.startsWith(prefix))
    {
        const [command, ...args]=message.content.trim().substring(prefix.length).split(/\s+/)
        console.log(command, args);
        switch(command)
        {
            case 'setChannel': if(args.length!=1)
            {
                message.channel.send('Invalid arguments')
                return;
            }
            var flag=false;
            guild.channels.cache.forEach(i=>{
               
                if(i.name==args[0]&&i.type=="GUILD_TEXT")
                {
                    console.log("Channel match", i.name)
                    serverChannelMap[guild.id]=message.channel.id;
                    
                    ServerStruct.findOneAndUpdate({serverNameNum:message.guild.id}, {preferredChannel:i.id, preferredChannelName:i.name}).then(data=>{
                        if(data==null)
                        { 
                            message.reply('Update returned null, adding ')
                            data=new ServerStruct({serverName:guild.name, preferredChannel:i.id,serverNameNum:i.guild.id, preferredChannelName:i.name});
                            data.save().then(data=>message.reply("channel added"+ data))
                        }
                        else
                        {
                            activeChannels=updateArray(activeChannels, data.preferredChannel, i.id);
                            
                            ServerStruct.findOne({serverNameNum:message.guild.id}).then(data=>
                            {
                                console.log('sce',data);
                                if(data==null)
                            {
                                message.reply('No entry found');
                            }
                            else
                            message.reply(data.toString())
                        
                        }                
                            )}
                    
                    })
                    flag=true;
                    return;
                }

            });
            if(flag==false)
            {
                message.channel.send('No Such Channel');
            }break;
            case 'showall':ServerStruct.find().then(data=>{
                message.reply(data.toString()+data.length.toString());
            })
            break;
            case 'deleteall':ServerStruct.deleteMany().then((data)=>message.reply(data.toString()));break;
            case 'sce':ServerStruct.findOne({serverNameNum:message.guild.id}).then(data=>
                {
                    console.log('sce',data);
                    if(data==null)
                {
                    message.reply('No entry found');
                }
                else
                message.reply(data.toString())
            
            }                
                );break;
            case 'showchannelsarray':message.reply('Channels Array '+activeChannels.toString());break;
            case 'pingall':
                activeChannels.forEach(i=>{
                  const channel=client.channels.cache.get(i);
                  channel.send('This is a ping');
                });break;
            case 'showalltweets':tweetStruct.find().then(data=>
                {
                    message.reply(data.length.toString());
                    data.forEach(i=>{
                        message.reply(i.toString())
                    })
                }
                );break;
            case 'deletealltweets':tweetStruct.deleteMany().then(data=>message.reply(data.toString()));break;
            
        }
    }
})

client.on("guildCreate", guild => {
    //console.log(guild)
 //   guild.owner.message('Thanks! You can use +help to discover commands.')
    console.log('guildcreate', guild.channels)
    const channelsAr=[];
    guild.channels.cache.forEach(i=>{
        console.log('channel', i.type);
        if(i.type=='GUILD_TEXT')
        channelsAr.push(i);
    })
 //   console.log(guild.channels.cache.get(channel))
    const channel=channelsAr[0]
    //console.log(client.channels.cache)
    var i=0;
    channel.send('Bot Online! To set the bot up, use command setChannel. For help use help. Command Prefix: -');
    const serverTemp=new ServerStruct({serverName:guild.name, preferredChannel:channel.id,serverNameNum:guild.id, preferredChannelName:channel.name});
    serverChannelMap[guild.id]=channel.id;
    serverTemp.save();
 });

client.login(process.env.DISCORD_TOKEN)
const CONNECTION_URL='mongodb+srv://javascriptmastery:javascriptmastery123@cluster0.7uqxc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const PORT =process.env.PORT || 5000;
mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>console.log("mongoose online"))
    .catch((error)=>console.log("naan",error));

function updateArray(array, oldQ, newQ)
{
    const newArray=[];
    array.forEach(i=>{
        if(i==oldQ)
        {
            newArray.push(newQ);
        }
        else
        {
            newArray.push(i);
        }
    })
    return newArray;
}