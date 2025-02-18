"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
class CodeGenerator {
    static generateCode({ length = 8, chars = CodeGenerator.defaultChars, prefix = "", suffix = "", }) {
        let code = "";
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}${code}${suffix}`;
    }
}
exports.CodeGenerator = CodeGenerator;
CodeGenerator.defaultChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
