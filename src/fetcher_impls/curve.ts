import { Prisma } from "@prisma/client";
import { ERC20SwapDocument, ERC20SwapQuery, execute } from "../../.graphclient";
import { prismaClient } from "../prisma";
import { upsertToken } from "../tokens";
import { splitBlockField } from "../utils";

interface CurveSwapItem {
    block: number,
    transaction_hash: string
    from_amount: string,
    to_amount: string,
    from_token_address: string,
    from_token_name: string,
    from_token_symbol: string
    from_token_decimals: number,
    to_token_address: string,
    to_token_name: string,
    to_token_symbol: string
    to_token_decimals: number,
    usd_value: number,
}

export const CurveSwapImpl = {
    name: "curve",
    fetchDocument: ERC20SwapDocument,
    mapGraphQLResult: (value: ERC20SwapQuery): CurveSwapItem[] => value.swaps.map((swap): CurveSwapItem => ({
        block: Number.parseInt(swap.blockNumber, 10),
        transaction_hash: swap.hash,
        from_amount: swap.amountIn,
        to_amount: swap.amountOut,
        from_token_address: swap.tokenIn.id,
        from_token_name: swap.tokenIn.name,
        from_token_symbol: swap.tokenIn.symbol,
        from_token_decimals: swap.tokenIn.decimals,
        to_token_address: swap.tokenOut.id,
        to_token_name: swap.tokenOut.name,
        to_token_symbol: swap.tokenOut.symbol,
        to_token_decimals: swap.tokenOut.decimals,
        usd_value: (swap.amountInUSD + swap.amountOutUSD) / 2,
    })),
    insert: async (values: CurveSwapItem[]) => {
        const filtered = splitBlockField(
            values,
            "from_token_name",
            "from_token_symbol",
            "from_token_decimals",
            "to_token_name",
            "to_token_symbol",
            "to_token_decimals",
        );

        for (const [value, other] of filtered) {
            await upsertToken({
                contract_address: other.from_token_address,
                name: other.from_token_name,
                symbol: other.from_token_symbol,
                decimals: other.from_token_decimals,
            });
            await upsertToken({
                contract_address: other.to_token_address,
                name: other.to_token_name,
                symbol: other.to_token_symbol,
                decimals: other.to_token_decimals,
            });
            await prismaClient.stablecoin_swaps.create({ data: { ...value, usd_value: Number.isNaN(value.usd_value) ? -1 : value.usd_value } });
        }
    }
}
