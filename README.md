# YouTube-videos-fetch-store-show

### Project Goal

To make an API to fetch latest videos sorted in reverse chronological order of their publishing date-time from YouTube for a given tag/search query in a paginated response.


### Basic Requirements:

- Server should call the YouTube API continuously in background (async) with some interval (say 10 seconds) for fetching the latest videos for a predefined search query and should store the data of videos (specifically these fields - Video title, description, publishing datetime, thumbnails URLs and any other fields you require) in a database with proper indexes.
- A GET API which returns the stored video data in a paginated response sorted in descending order of published datetime.
- A basic search API to search the stored videos using their title and description.

### Bonus Points:

- Add support for supplying multiple API keys so that if quota is exhausted on one, it automatically uses the next available key.
- Make a dashboard to view the stored videos with filters and sorting options (optional)

#### How to use this project
1. Clone the project `git clone github.com/ashusharma-git/YouTube-videos-fetch-store-show.git`

2. In `util/fetch-videos.js`, update API_KEY array to support API_KEY.

3. Install dependencies `npm install`

4. Run `node index.js`

5. Browse the app lication at `http://localhost:3000/`