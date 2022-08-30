const mongoose = require("mongoose");
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');
 
const videoSchema = new mongoose.Schema({
    videoId: String,
    title: String,
    description: String, 
    publishedAt: String, 
    thumbnail: String,
});

videoSchema.plugin(mongoose_fuzzy_searching, {
    fields: ["title", "description"],
});

const YTVideo = mongoose.model('YTVideo', videoSchema);
module.exports = { YTVideo };
