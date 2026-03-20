const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
  const script = req.body.script;

  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID",
      { text: script },
      {
        headers: {
          "xi-api-key": "YOUR_API_KEY",
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    fs.writeFileSync("voice.mp3", response.data);

    exec(
      `ffmpeg -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -t 20 -pix_fmt yuv420p output.mp4`,
      (err) => {
        if (err) return res.send("Error generating video");
        res.download("output.mp4");
      }
    );

  } catch (error) {
    console.error(error);
    res.send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
