import { ERC20SwapDocument, ERC20SwapQuery, execute } from "../../.graphclient";
import { prismaClient } from "../prisma";
import { insertToken } from "../tokens";
import { filterBlockField } from "../utils";

interface CurveSwapItem {
    block: number,
    transaction_hash: string
    from_amount: bigint,
    to_amount: bigint,
    from_token_address: string,
    to_token_address: string,
    usd_value: number,
}

export const CurveSwapImpl = {
    name: "curve",
    fetchDocument: ERC20SwapDocument,
    mapGraphQLResult: (value: ERC20SwapQuery): CurveSwapItem[] => value.swaps.map((swap): CurveSwapItem => ({
        block: Number.parseInt(swap.blockNumber, 10),
        transaction_hash: swap.hash,
        from_amount: BigInt(swap.amountIn),
        to_amount: BigInt(swap.amountIn),
        from_token_address: swap.tokenIn.id,
        to_token_address: swap.tokenOut.id,
        usd_value: (swap.amountInUSD + swap.amountOutUSD) / 2,
    })),
    insert: async (values: CurveSwapItem[]) => {
        for (const value of filterBlockField(values)) {
            await prismaClient.stablecoin_swaps.create({
                data: value
            })
        }
    }
}
