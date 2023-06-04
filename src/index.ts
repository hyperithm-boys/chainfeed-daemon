import { Fetcher } from "./fetcher";
import { withClient } from "./prisma";
import { ERC20SwapImpl, ERC20TransferImpl } from "./fetcher_impls/erc20";
import { UniV3DepositImpl, UniV2PoolCreationImpl, UniV3WIthdrawImpl } from "./fetcher_impls/uniswap";
import { AAVELiquidationImpl } from "./fetcher_impls/aave";
import { OpenSeaTradeImpl } from "./fetcher_impls/opensea";

(async () => {
    withClient(async () => {
        const startBlock = 17404347;
        const fetchers = [
            new Fetcher(ERC20SwapImpl, 14, startBlock),
            new Fetcher(ERC20TransferImpl, 14, startBlock),
            new Fetcher(UniV3DepositImpl, 14, startBlock),
            new Fetcher(UniV3WIthdrawImpl, 14, startBlock),
            new Fetcher(UniV2PoolCreationImpl, 14, startBlock),
            new Fetcher(AAVELiquidationImpl, 14, startBlock),
            new Fetcher(OpenSeaTradeImpl, 14, startBlock),
        ]
        await Promise.all(fetchers.map(fetcher => fetcher.fetchTask()))
    })
})()

