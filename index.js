require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRouter = require("./routes");
const path = require("path");
const app = express();
const PORT = 4000;
const { createSessionandToken, generateToken } = require("./opentok");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());

const expressWs = require("express-ws")(app);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
  );
  next();
});

app.use("/api", apiRouter);

app.get("/room/:roomName", async (req, res) => {
  const { roomName } = req.params;
  if (app.get(roomName)) {
    const sessionId = app.get(roomName);
    const cred = generateToken(sessionId, "publisher");
    res.render("index", {
      apiKey: cred.apiKey,
      sessionId: sessionId,
      token: cred.token,
      roomName: roomName,
    });
  } else {
    const data = await createSessionandToken(roomName, "publisher");
    app.set(roomName, data.sessionId);
    res.render("index", {
      apiKey: data.apiKey,
      sessionId: data.sessionId,
      token: data.token,
      roomName: roomName,
    });
  }
});

app.ws(`/socket/:streamId`, async (ws, req) => {
  console.log("Socket connection received", req.params.streamId);

  ws.on("message", (msg) => {
    console.log("msg", msg);
    try {
      if (typeof msg === "string") {
        const b = Buffer.from(msg, "utf-8");
        console.log(b.toString());
      } else {
      }
    } catch (err) {
      console.log(err);
      ws.removeAllListeners("message");
      ws.close();
    }
  });

  ws.on("close", () => {
    console.log("Websocket closed");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
