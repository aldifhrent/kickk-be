import { prisma } from "lib/prisma";

export const findUpcomingEvent = async () => {
  return await prisma.events.findMany({
    where: {
      eventStartDate: {
        gte: new Date(), // Menyaring event yang akan datang
      },
    },
    orderBy: {
      eventStartDate: "asc",
    },
    include: {
      organizer: {
        select: {
          organizerName: true,
        },
      },
      Category: true,
    },
  });
};

export const findNewEvents = async () => {
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
  return await prisma.events.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      organizer: {
        select: {
          organizerName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Urutkan berdasarkan tanggal pembuatan yang terbaru
    },
    take: 2, // Ambil dua event terbaru
  });
};

export const findEventBySlug = async (slug: string) => {
  return await prisma.events.findUnique({
    where: {
      slug: slug,
    },
    include: {
      organizer: {
        select: {
          logoUrl: true,
          organizerName: true,
        },
      },
    },
  });
};
