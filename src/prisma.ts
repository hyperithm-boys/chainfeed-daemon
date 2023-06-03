import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export const prismaClient = new PrismaClient()
export async function withClient(fn: () => Promise<void>): Promise<void> {
    await fn()
        .then(async () => {
            await prismaClient.$disconnect()
        })
        .catch(async (e) => {
            logger.error(e)
            await prismaClient.$disconnect()
            process.exit(1)
        });
}
