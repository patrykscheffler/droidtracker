import { differenceInSeconds } from "date-fns";
import { prisma } from "../db";

export async function startTask(id: string, userId: string) {
  const timeLogs = await prisma.timeLog.findMany({
    where: {
      userId,
      end: null,
    },
  });

  // Stop all running timeLogs
  for (const timeLog of timeLogs) {
    const end = new Date();
    const duration = differenceInSeconds(end, timeLog.start);
  
    await prisma.timeLog.update({
      where: { id: timeLog.id },
      data: {
        end,
        duration,
      },
    });
  }

  // Start new timeLog
  const timeLog = await prisma.timeLog.create({
    data: {
      start: new Date(),
      taskId: id,
      userId,
    }
  });

  return timeLog;
}

export async function stopTask(id: string, userId: string) {
  const timeLog = await prisma.timeLog.findFirst({
    where: {
      userId,
      end: null,
      taskId: id,
    }
  });

  if (!timeLog) return;

  const end = new Date();
  const duration = differenceInSeconds(end, timeLog.start);

  const updatedTimeLog = await prisma.timeLog.update({
    where: { id: timeLog.id },
    data: {
      end,
      duration,
    },
  });

  return updatedTimeLog;
}