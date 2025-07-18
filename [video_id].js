
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { video_id } = req.query;
  if (!video_id) {
    res.status(400).send("Missing video_id");
    return;
  }

  let url;
  if (video_id.startsWith('@')) {
    url = `https://www.youtube.com/${video_id}/live`;
  } else {
    url = `https://www.youtube.com/watch?v=${video_id}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com"
      },
      timeout: 10000,
    });
    const text = await response.text();

    const match = text.match(/"hlsManifestUrl":"([^"]+)"?/);
    if (match && match[1]) {
      const hlsUrl = match[1].replace(/\\u0026/g, "&");
      res.redirect(hlsUrl);
    } else {
      res.status(503).send("HLS manifest URL not found");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
};
