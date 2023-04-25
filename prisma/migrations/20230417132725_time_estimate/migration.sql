-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "homeOffice" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TimeCard" ADD COLUMN     "homeOffice" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TimeEstimate" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "duration" INTEGER,
    "description" TEXT,
    "taskId" TEXT,

    CONSTRAINT "TimeEstimate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeEstimate" ADD CONSTRAINT "TimeEstimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEstimate" ADD CONSTRAINT "TimeEstimate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
