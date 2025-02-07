const fetchYouTubeComments = async (videoId, order = "time") => {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not set in environment variables");
  }
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  const validOrderValues = ["time", "relevance"];
  if (!validOrderValues.includes(order)) {
    throw new Error("Order must be either 'time' or 'relevance'");
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;
  let comments = [];
  let pageToken = "";
  const numComments = 100; 

  try {
    while (comments.length < numComments) {
      const maxResults = Math.min(100, numComments - comments.length);
      const url = new URL(
        "https://www.googleapis.com/youtube/v3/commentThreads"
      );

      url.searchParams.append("part", "snippet");
      url.searchParams.append("videoId", videoId);
      url.searchParams.append("order", order);
      url.searchParams.append("maxResults", maxResults.toString());
      url.searchParams.append("key", API_KEY);

      if (pageToken) {
        url.searchParams.append("pageToken", pageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${response.status} ${
            response.statusText
          }\n${JSON.stringify(errorData, null, 2)}`
        );
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        break;
      }

      comments.push(
        ...data.items.map(
          (item) => item.snippet.topLevelComment.snippet.textDisplay
        )
      );

      pageToken = data.nextPageToken;
      if (!pageToken || comments.length >= numComments) {
        break;
      }
    }

    return comments.slice(0, numComments);
  } catch (error) {
    console.error("Error fetching YouTube comments:", error);
    throw error;
  }
};

module.exports = { fetchYouTubeComments };
