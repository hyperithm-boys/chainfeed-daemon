import { CurveSwapImpl } from "./fetcher_impls/curve";
import { Fetcher } from "./fetcher";
import { prismaClient, withClient } from "./prisma";

process.on('beforeExit', async () => {
    await prismaClient.$disconnect();
});

(async () => {
    withClient(async () => {
        const fetcher = new Fetcher(CurveSwapImpl, 14, 17400400);
        await fetcher.fetchTask();
    })
})()

