import { prisma } from "lib/prisma";
import { CodeGenerator } from "lib/ref";

export const refGenerate = CodeGenerator.generateCode({
  length: 7,
});

export const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};

export const findExistingUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  });
};
