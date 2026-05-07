const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const callRoutes = require("./routes/callRoutes");
const SocketService = require("./services/socketService");
const TwilioService = require("./services/twilioService");

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Twilio Webhook for incoming calls
app.post("/api/twilio/voice", TwilioService.handleIncomingCall);

// Routes
app.use("/api/calls", callRoutes);

app.get("/", (req, res) => {
  res.send("1092 Helpline Backend API (JS)");
});

// Initialize WebSocket
const socketService = new SocketService(server);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { socketService };
