import { add, differenceInSeconds, sub } from "date-fns";
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

export async function getUsersToClockIn() {
  const currentDate = new Date();
  const weekDay = (currentDate.getDay() + 6) % 7;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
        where: {
          provider: "mattermost",
        }
      },
      availabilities: {
        where: {
          weekDay,
        }
      },
    },
    where: {
      availabilities: {
        some: {
          start: {
            /*
              (currentDate - 1 hour) < start <= currentDate
              cron runs every 1 hour and user should get reminder only one time
            */
            lte: currentDate,
            gt: sub(currentDate, { hours: 1 }),
          }
        }
      },
      timeCards: {
        every: {
          NOT: {
            end: null
          }
        }
      }
    }
  });

  // TODO: Check overriden dates when they will be implemented

  return users;
}

export async function getUsersToClockOut() {
  const currentDate = new Date();
  const weekDay = (currentDate.getDay() + 6) % 7;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
        where: {
          provider: "mattermost",
        }
      },
      availabilities: {
        where: {
          weekDay,
        }
      },
    },
    where: {
      availabilities: {
        some: {
          end: {
            /*
              (currentDate - 1 hour) < start <= currentDate
              cron runs every 1 hour and user should get reminder only one time
            */
            lte: currentDate,
            gt: sub(currentDate, { hours: 1 }),
          },
        },
      },
      timeCards: {
        some: {
          end: null
        }
      }
    }
  });

  // TODO: Check overriden dates when they will be implemented

  return users;
}