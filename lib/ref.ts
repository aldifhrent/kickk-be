import { prisma } from "./prisma";

export class CodeGenerator {
  private static defaultChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  static generateCode({
    length = 8,
    chars = CodeGenerator.defaultChars,
    prefix = "",
    suffix = "",
  }: {
    length?: number;
    chars?: string;
    prefix?: string;
    suffix?: string;
  }): string {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}${code}${suffix}`;
  }
}
