-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "language" TEXT NOT NULL DEFAULT 'Kannada',
    "dialect" TEXT,
    "emotion" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "urgency" TEXT NOT NULL DEFAULT 'LOW',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "confidenceReason" TEXT,
    "intent" TEXT,
    "location" TEXT,
    "issue" TEXT,
    "transcript" JSONB NOT NULL DEFAULT '[]',
    "verifications" JSONB NOT NULL DEFAULT '[]',
    "suggestedActions" JSONB NOT NULL DEFAULT '[]',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_agentId_key" ON "Agent"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "Call_callId_key" ON "Call"("callId");
