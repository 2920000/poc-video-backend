const express = require("express");
const router = express.Router();

const { startTranscription, startCaption, stopCaption } = require("../opentok");

router.post("/start-transcribe", async (req, res) => {
  const { streamId, sessionId, username } = req.body;
  const data = await startTranscription(streamId, sessionId, username);
  res.send(data);
});

router.post("/start-captions", async (req, res) => {
  const { token, sessionId } = req.body;
  const data = await startCaption(sessionId, token);
  res.send(data);
});

router.post("/stop-captions", async (req, res) => {
  const { captionId } = req.body;
  const data = await stopCaption(captionId);
  res.send(data);
});

module.exports = router;
