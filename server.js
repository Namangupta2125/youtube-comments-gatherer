const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 5000;

app.get("/get-comments", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Post URL is required" });

    const postIdMatch = url.match(/\/questions\/(\d+)/);
    if (!postIdMatch)
      return res.status(400).json({ error: "Invalid Stack Overflow URL" });

    const postId = postIdMatch[1];

    const apiUrl = `https://api.stackexchange.com/2.3/questions/${postId}/comments?order=desc&sort=creation&site=stackoverflow&filter=withbody`;

    const response = await axios.get(apiUrl);
    if (response.data.items && response.data.items.length > 0) {
      const comments = response.data.items.map((comment) => comment.body);
      return res.json({ comments });
    }

    console.log("API returned no comments, trying web scraping...");
    const comments = await scrapeComments(url);
    return res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const scrapeComments = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);
    let comments = [];

    $(".comment-copy").each((index, element) => {
      comments.push($(element).text().trim());
    });

    return comments;
  } catch (error) {
    console.error("Scraping error:", error.message);
    return [];
  }
};

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
