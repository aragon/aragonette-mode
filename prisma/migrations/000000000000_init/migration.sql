-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('DRAFT', 'COUNCIL_APPROVAL', 'COMMUNITY_VOTING', 'COUNCIL_CONFIRMATION');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('ACTIVE', 'PENDING', 'EXECUTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('ACTIVE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "type" "StageType" NOT NULL,
    "status" "StageStatus" NOT NULL,
    "statusMessage" TEXT,
    "createdAt" TEXT,
    "startTimestamp" TEXT,
    "endTimestamp" TEXT,
    "creator" TEXT[],
    "resources" TEXT[],
    "proposalId" TEXT NOT NULL,
    "voting" TEXT,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT,
    "transparencyReport" TEXT,
    "status" "ProposalStatus" NOT NULL,
    "statusMessage" TEXT,
    "createdAt" TEXT,
    "isEmergency" BOOLEAN NOT NULL,
    "currentStage" TEXT NOT NULL,
    "creators" TEXT[],
    "resources" TEXT[],
    "type" TEXT NOT NULL,
    "actions" TEXT[],
    "includedPips" TEXT[],
    "parentPip" TEXT,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

