import { differenceInSeconds, getDay, sub } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

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
      start: "desc",
    },
  });

  return timeCard;
}

export async function getUsersToClockIn() {
  const currentDate = utcToZonedTime(
    zonedTimeToUtc(new Date(), "UTC"),
    "Europe/Warsaw"
  );
  const weekDay = (getDay(currentDate) + 6) % 7;

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
        },
      },
      availabilities: {
        where: {
          OR: [
            {
              weekDay,
            },
            {
              date: currentDate,
            },
          ],
        },
      },
    },
    where: {
      timeCards: {
        every: {
          NOT: {
            end: null,
          },
        },
      },
    },
  });

  const now = utcToZonedTime(new Date(), "Europe/Warsaw");
  const currentTime = new Date(
    new Date(0).setUTCHours(now.getHours(), now.getMinutes(), now.getSeconds())
  );

  // Check overriden dates
  const filteredUsers = users.filter((user) => {
    if (user.availabilities.length === 0) return false;
    const availability =
      user.availabilities.length === 1
        ? user.availabilities[0]
        : user.availabilities[1];
    if (!availability) return false;

    /*
      (currentDate - 1 hour) < start <= currentDate
      cron runs every 1 hour and user should get reminder only one time
    */
    if (
      availability.start <= currentTime &&
      availability.start >= sub(currentTime, { hours: 1 })
    )
      return true;

    return false;
  });

  return filteredUsers;
}

export async function getUsersToClockOut() {
  const currentDate = utcToZonedTime(
    zonedTimeToUtc(new Date(), "UTC"),
    "Europe/Warsaw"
  );
  const weekDay = (getDay(currentDate) + 6) % 7;

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
        },
      },
      availabilities: {
        where: {
          OR: [
            {
              weekDay,
            },
            {
              date: currentDate,
            },
          ],
        },
      },
    },
    where: {
      timeCards: {
        some: {
          end: null,
        },
      },
    },
  });

  const now = utcToZonedTime(new Date(), "Europe/Warsaw");
  const currentTime = new Date(
    new Date(0).setUTCHours(now.getHours(), now.getMinutes(), now.getSeconds())
  );

  // Check overriden dates
  const filteredUsers = users.filter((user) => {
    if (user.availabilities.length === 0) return false;
    const availability =
      user.availabilities.length === 1
        ? user.availabilities[0]
        : user.availabilities[1];
    if (!availability) return false;

    /*
      (currentDate - 1 hour) < start <= currentDate
      cron runs every 1 hour and user should get reminder only one time
    */
    if (
      availability.end <= currentTime &&
      availability.end >= sub(currentTime, { hours: 1 })
    )
      return true;

    return false;
  });

  return filteredUsers;
}
