const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class DashboardController {
  static async getStats(req, res) {
    try {
      const totalCalls = await prisma.call.count();
      const activeCalls = await prisma.call.count({ where: { status: "active" } });
      const resolvedCalls = await prisma.call.count({ where: { status: "resolved" } });
      const escalatedCalls = await prisma.call.count({ where: { status: "escalated" } });

      // Calculate some metrics
      const averageConfidence = await prisma.call.aggregate({
        _avg: { confidence: true }
      });

      res.json({
        totalCalls,
        activeCalls,
        resolvedCalls,
        escalatedCalls,
        averageConfidence: averageConfidence._avg.confidence || 0,
        uptime: "99.9%", // Mock for now
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = DashboardController;
