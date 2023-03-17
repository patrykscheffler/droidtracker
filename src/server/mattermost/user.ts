import { prisma } from "../db";

export const getUserId = async (mattermostUserId: string) => {
  const user = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      accounts: {
        every: {
          provider: "mattermost",
          providerAccountId: mattermostUserId,
        },
      },
    },
  });

  return user?.id;
};
