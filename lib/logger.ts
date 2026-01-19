import { prisma } from "./prisma";

export enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

export async function createLog(event: string, message: string, level: LogLevel = LogLevel.INFO, userId?: string) {
    try {
        await prisma.systemLog.create({
            data: {
                event,
                message,
                level,
                userId
            }
        });
    } catch (error) {
        console.error("Failed to create system log:", error);
    }
}
