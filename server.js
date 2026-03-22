// server.js
const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(express.json());

// Make sure bg.jpg exists in the same folder
const BG_IMAGE = path.join(__dirname, "bg.jpg");

app.post("/generate", async (req, res) => {
  const script = req.body.script;

  if (!script) {
    return res.status(400).send("No script provided");
  }

  try {
    console.log("Generating voice for script:", script);

    // Step 1: Generate voice using Python 3
    exec(`python3 edge_tts_generate.py "${script}"`, (err, stdout, stderr) => {
      if (err) {
        console.error("Python error:", err);
        console.error("stdout:", stdout);
        console.error("stderr:", stderr);
        return res.status(500).send("Error generating voice");
      }

      console.log("Python output:", stdout);

      // Step 2: Combine with background image to make video
      // Using ffmpeg: loop image, add audio, output mp4
      const videoOutput = path.join(__dirname, "output.mp4");
      const audioInput = path.join(__dirname, "voice.mp3");

      const ffmpegCmd = `ffmpeg -y -loop 1 -i "${BG_IMAGE}" -i "${audioInput}" -c:v libx264 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${videoOutput}"`;

      exec(ffmpegCmd, (ffmpegErr, ffmpegStdout, ffmpegStderr) => {
        if (ffmpegErr) {
          console.error("FFmpeg error:", ffmpegErr);
          console.error("stdout:", ffmpegStdout);
          console.error("stderr:", ffmpegStderr);
          return res.status(500).send("Error generating video");
        }

        console.log("Video generated successfully:", videoOutput);

        // Step 3: Send the video file to client
        res.download(videoOutput, "output.mp4", (downloadErr) => {
          if (downloadErr) {
            console.error("Download error:", downloadErr);
          }
        });
      });
    });
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).send("Unexpected error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
