import { differenceInSeconds } from "date-fns";

import { prisma } from "../db";

export async function startTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });
  if (!task) return;

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
      userId,
      taskId: id,
      start: new Date(),
      projectId: task.projectId,
    },
  });

  return timeLog;
}

export async function stopTask(id: string, userId: string) {
  const timeLog = await prisma.timeLog.findFirst({
    where: {
      userId,
      end: null,
      taskId: id,
    },
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
