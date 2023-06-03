import { Fetcher } from "./fetcher";
import { withClient } from "./prisma";
import { ERC20SwapImpl, ERC20TransferImpl } from "./fetcher_impls/erc20";
import { UniV3DepositImpl, UniV3PoolCreationImpl } from "./fetcher_impls/univ3";
import { AAVELiquidationImpl } from "./fetcher_impls/aave";

(async () => {
    withClient(async () => {
        const startBlock = 17402915;
        const fetchers = [
            new Fetcher(ERC20SwapImpl, 14, startBlock),
            new Fetcher(ERC20TransferImpl, 14, startBlock),
            new Fetcher(UniV3DepositImpl, 14, startBlock),
            new Fetcher(UniV3PoolCreationImpl, 14, startBlock),
            new Fetcher(AAVELiquidationImpl, 14, startBlock),
        ]
        await Promise.all(fetchers.map(fetcher => fetcher.fetchTask()))
    })
})()

