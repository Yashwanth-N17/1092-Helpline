const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class CallController {
  static async getActiveCalls(req, res) {
    try {
      const calls = await prisma.call.findMany({
        where: { status: "active" },
        orderBy: { startTime: "desc" },
      });
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCallDetail(req, res) {
    const { id } = req.params;
    try {
      const call = await prisma.call.findUnique({
        where: { callId: id },
      });
      if (!call) return res.status(404).json({ error: "Call not found" });
      res.json(call);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateInterpretation(req, res) {
    const { id } = req.params;
    const data = req.body;
    try {
      const updatedCall = await prisma.call.update({
        where: { callId: id },
        data: data,
      });
      res.json(updatedCall);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async endCall(req, res) {
    const { id } = req.params;
    try {
      const call = await prisma.call.update({
        where: { callId: id },
        data: { status: "resolved", endTime: new Date() },
      });
      res.json(call);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async escalateCall(req, res) {
    const { id } = req.params;
    try {
      const call = await prisma.call.update({
        where: { callId: id },
        data: { status: "escalated" },
      });
      res.json(call);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CallController;
