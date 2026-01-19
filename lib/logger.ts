import { prisma } from "./prisma";

export enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

export async function createLog(
    event: string, 
    message: string, 
    level: LogLevel = LogLevel.INFO, 
    userId?: string,
    userName?: string,
    userEmail?: string
) {
    try {
        await prisma.systemLog.create({
            data: {
                event,
                message,
                level,
                userId,
                userName,
                userEmail
            }
        });
    } catch (error) {
        console.error("Failed to create system log:", error);
        // TODO: Consider adding telemetry or failure tracking here
    }
}
