import { CurveSwapImpl } from "./fetcher_impls/curve";
import { Fetcher } from "./fetcher";
import { withClient } from "./prisma";

(async () => {
    withClient(async () => {
        const fetcher = new Fetcher(CurveSwapImpl, 14, 17400400);
        await fetcher.fetchTask();
    })
})()

