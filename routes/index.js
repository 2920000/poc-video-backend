const { createSessionandToken, generateToken } = require("../opentok");
const opentok = require("./opentok");

const express = require("express");
const app = express();
const router = express.Router();

const room = {};

// Use the routes
router.use("/opentok", opentok);

router.use("/room/:roomName", async (req, res) => {
  const { roomName } = req.params;
  if (room[roomName]) {
    const sessionId = app.get(roomName);
    const cred = await generateToken(sessionId, "publisher");
    res.send({
      apiKey: cred.apiKey,
      sessionId: sessionId,
      token: cred.token,
      roomName: roomName,
    });
  } else {
    room[roomName] = true;
    const data = await createSessionandToken(roomName, "publisher");
    app.set(roomName, data.sessionId);
    res.send({
      apiKey: data.apiKey,
      sessionId: data.sessionId,
      token: data.token,
      roomName: roomName,
    });
  }
});

module.exports = router;
