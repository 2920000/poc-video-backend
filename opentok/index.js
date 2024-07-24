const { Vonage } = require("@vonage/server-sdk");

const apiKey = process.env.VIDEO_API_API_KEY;
const apiSecret = process.env.VIDEO_API_API_SECRET;
const applicationId = process.env.APPLICATION_ID;
const privateKey = process.env.PRIVATE_KEY;

const vonage = new Vonage({
  apiKey,
  apiSecret,
  applicationId,
  privateKey,
});

if (!apiKey || !apiSecret) {
  throw new Error(
    "Missing config values for env params OT_API_KEY and OT_API_SECRET"
  );
}

const createSessionandToken = async (roomName, role) => {
  const session = await vonage.video.createSession({ mediaMode: "disabled" });
  const sessionId = session.sessionId;
  const expireTime = new Date().getTime() / 1000 + 7 * 24 * 60 * 60;
  const token = role
    ? await vonage.video.generateClientToken(sessionId, {
        data: role,
        expireTime,
      })
    : await vonage.video.generateClientToken(sessionId, {
        expireTime,
      });
  return {
    sessionId: sessionId,
    token: token,
    apiKey: applicationId,
  };
};

const generateToken = async (sessionId, role) => {
  const token = role
    ? await vonage.video.generateClientToken(sessionId, { role })
    : await vonage.video.generateClientToken(sessionId);
  return { token: token, apiKey: applicationId };
};

const getCredentials = async (session = null, role) => {
  const data = await createSessionandToken(session, role);
  sessionId = data.sessionId;
  const token = data.token;
  return { sessionId: sessionId, token: token, apiKey: applicationId };
};

const startCaption = async (sessionId, tk) => {
  const { token } = await generateToken(sessionId, "Moderator");
  try {
    const res = await vonage.video.enableCaptions(sessionId, token);
    console.log(res);
    return res;
  } catch (error) {}
};

const stopCaption = async (captionId) => {
  try {
    const res = await vonage.video.disableCaptions(captionId);
    console.log("stop", res);
    return res;
  } catch (error) {}
};

const startTranscription = async (streamId, sessionId, username) => {
  try {
    const { token } = await generateToken(sessionId, "publisher");
    let socketUriForStream =
      "wss://a75b-104-28-254-74.ngrok-free.app" + "/socket/" + streamId;
    const res = await vonage.video.connectToWebsocket(sessionId, token, {
      uri: socketUriForStream,
      headers: { username },
      streams: [streamId],
    });

    return res;
  } catch (e) {
    console.log("loi roi", e);
    return e;
  }
};

module.exports = {
  getCredentials,
  generateToken,
  startTranscription,
  createSessionandToken,
  startCaption,
  stopCaption,
};
