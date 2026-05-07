const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const VoiceResponse = require("twilio").twiml.VoiceResponse;

class TwilioService {
  static handleIncomingCall(req, res) {
    const response = new VoiceResponse();
    
    // Connect to Media Stream
    const connect = response.connect();
    connect.stream({
      url: `wss://${req.headers.host}/media-stream`,
    });

    res.type("text/xml");
    res.send(response.toString());
  }

  static processMediaStream(ws, socketService) {
    let callSid = "";
    
    ws.on("message", async (message) => {
      const msg = JSON.parse(message);
      
      switch (msg.event) {
        case "connected":
          console.log("Twilio Media Stream connected");
          break;
        case "start":
          callSid = msg.start.callSid;
          console.log(`Media Stream started for call: ${callSid}`);
          
          // Create a new call record in the database
          try {
            await prisma.call.create({
              data: {
                callId: callSid,
                status: "active",
                language: "Kannada", // Default
                issue: "Incoming emergency call...",
                startTime: new Date(),
              },
            });
            // Notify frontend that a new call is active
            socketService.broadcastAll("new_call", { callId: callSid });
          } catch (e) {
            console.error("Error creating call record:", e.message);
          }
          break;
        case "media":
          // Forward audio payload to AI Service for STT
          // const payload = msg.media.payload; // base64 encoded audio
          // AIBridgeService.processAudio(payload, callSid);
          break;
        case "stop":
          console.log("Media Stream stopped");
          break;
      }
    });
  }
}

module.exports = TwilioService;
