require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { fetchVideos } = require("./util/fetch-videos");
const { YTVideo } = require("./model/videosModel")


app.set('view engine', 'ejs');
app.use(express.static("public"));


const DBoptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// connect to mongoDB for storing videos data in it
mongoose.connect(process.env.DB_URI, DBoptions)
    .then(()=>{
        console.info("Database connected");
    })
    .catch((dbError)=>{
        console.error("Database connectivity error...\n", dbError);
    })

// This is cronjob function which keeps on fetching YT videos data every minutes.
fetchVideos();


// home route which redirects to videos route to show all the videos available in database. 
app.get("/", (req, res)=>{
    res.redirect("/videos");
});


// This route can fetch all videos as well as query a particular Keyword with or without page_number.
app.get("/videos", async(req, res)=>{
    const pageNum = parseInt(req.query.page) || 1;
    if(parseInt(req.query.page)<1) res.send({message: "Invalid Page Number."});
    else{
        const vidQuery = req.query.q

        let videosData;
        let videosCount;
        
        try{
            if(vidQuery){
                videosData = await YTVideo.fuzzySearch(vidQuery).sort({ publishedAt: 1 });
                videosCount = videosData.length;
                videosData = videosData.splice((pageNum-1)*10, 10);
            } else{
                videosCount = await YTVideo.estimatedDocumentCount();
                videosData = await YTVideo.find(
                    {},
                    {},
                    {
                        skip: (pageNum-1)*10,
                        limit: 10,
                    }
                ).sort({ publishedAt: 1 });
            }
            const totalPage = Math.ceil(videosCount/10);
            const hasPrev = pageNum>1;
            const hasNext = pageNum<totalPage;
            
            if(pageNum>totalPage) res.send({message: "Invalid Page Number."});
            else{
                let payload = {
                    videosCount,
                    videosData,
                    hasPrev,
                    hasNext,
                    totalPage,
                };
                if(hasPrev) payload.prevPage=pageNum-1;
                if(hasNext) payload.nextPage=pageNum+1;
                res.render( "result", {payload});
            }
        } catch(err){
            res.status(500).send({message: "Internal Error!! Please try again later."});
        }
    }
});

app.listen(3000, ()=>{console.log("Server running on PORT: 3000")});