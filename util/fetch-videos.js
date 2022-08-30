require('dotenv').config()
const cron = require("node-cron");

const SEARCH_QUERY = process.env.SEARCH_QUERY;

// array of API_Key for supporting multiple apis.
const API_KEY = ["AIzaSyB9O5E1_ImGoqBrcDQ_u7JP3Csq1QqxoWA", "AIzaSyCj0iGY6co3Dyuu8bqqnNDMKCrZl7FU1Iw", "AIzaSyA7WbkhhpnSluf7wqdgR5VKkD0mV9hI8MQ", "AIzaSyBHHrBXbAZpLMOo0VVUGTvk6XF2QXVEN9Y"]

const { google } = require("googleapis");
const { YTVideo } = require("../model/videosModel")


// below function fetches videos data from YouTube data API 
const getVid = async (apiKey, pageToken=null)=>{
    try {
        const youtube = google.youtube({
            version: "v3",
            auth: apiKey,
        });
        var queryList = {
            part: ["snippet"],
            // type: "video",
            q: SEARCH_QUERY,
            order: "date",
            maxResults: 50,
        }
        if(pageToken!=null){
            queryList.pageToken=pageToken;
        }

        const response = await youtube.search.list(queryList);
        const videos = response.data.items.map(video=>{
            return {
                videoId: video.id.videoId,
                title: video.snippet.title, 
                description: video.snippet.description, 
                publishedAt: video.snippet.publishedAt, 
                thumbnail: video.snippet.thumbnails.medium.url,
            }
        });
        let data = {
            videos: videos,
            nextPageToken: response.data.nextPageToken,
        }

        return data;
    } catch (error) {
        console.log("Error...\n", error);
        return;
    }
};

// This function will store the videos data in database. This will first check if the same data is already available in database or not. If it is not available in database then only it will push in database.
const addVideosToDB = async(videos)=>{
    var c=1;
    videos.forEach(video => {
        YTVideo.findOne(
            {videoId: video.videoId}, 
            (err, found)=>{
                if(!found){
                    YTVideo.create(video);
                }
            }
        )
    });
}

const fetchVideos = ()=>{
    cron.schedule("* * * * *", async () => {
        try{
            var videoFetched = false;
            for(const apiKey of API_KEY){
                if (videoFetched) {
                    break;
                }
                else{
                    var data = await getVid(apiKey);
                    if(data===undefined) continue;
                    videoFetched=true;
                    await addVideosToDB(data.videos)
                    var c=1;
                    while (data.nextPageToken){
                        var data = await getVid(apiKey, data.nextPageToken);
                        videoFetched=true;
                        await addVideosToDB(data.videos)
                    }
                }
            }
            if(!videoFetched){
                console.error("All API Keys limit exhausted");
            }
        } catch(err){
            console.error(err);
        }
    });
};

module.exports = { fetchVideos };