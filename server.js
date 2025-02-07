const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const { fetchYouTubeComments } = require("./fetch_comments");

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const { videoId, order = "time" } = req.query;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    if (order && !["time", "relevance"].includes(order)) {
      return res.status(400).json({
        success: false,
        message: "Order must be either 'time' or 'relevance'",
      });
    }

    const comments = await fetchYouTubeComments(videoId, order);

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching comments",
      error: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
