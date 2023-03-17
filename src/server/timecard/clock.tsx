import { differenceInSeconds } from "date-fns";
import { prisma } from "../db";

export async function clockIn(userId: string) {
  // Check if there is still running timeCard
  const currentTimeCard = await prisma.timeCard.findFirst({
    where: {
      userId: userId,
      end: null,
    },
  });

  if (currentTimeCard) return currentTimeCard;

  const newTimeCard = await prisma.timeCard.create({
    data: {
      userId: userId,
      start: new Date(),
      end: null,
    },
  });

  return newTimeCard;
}

export async function clockOut(userId: string) {
  const timeCard = await prisma.timeCard.findFirst({
    where: {
      userId: userId,
      end: null,
    },
  });

  // TODO: throw error
  if (!timeCard) return;

  const end = new Date();
  const duration = differenceInSeconds(end, timeCard.start);

  const updatedTimeCard = await prisma.timeCard.update({
    where: { id: timeCard.id },
    data: {
      end,
      duration,
    },
  });

  return updatedTimeCard;
}

export async function clockStatus(userId: string) {
  const timeCard = await prisma.timeCard.findFirst({
    where: {
      userId: userId,
      end: null,
    },
    orderBy: {
      start: "desc"
    },
  });

  return timeCard;
}