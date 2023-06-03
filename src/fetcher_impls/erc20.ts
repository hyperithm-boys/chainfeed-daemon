import { ERC20SwapDocument, ERC20SwapQuery, ERC20TransferDocument, ERC20TransferQuery } from "../../.graphclient";
import { prismaClient } from "../prisma";
import { upsertToken } from "../tokens";
import { filterField } from "../utils";

interface ERC20SwapItem {
    block_number: number,
    transaction_hash: string,
    from_token_address: string,
    from_token_name: string,
    from_token_symbol: string,
    from_token_decimals: number,
    to_token_address: string,
    to_token_name: string,
    to_token_symbol: string,
    to_token_decimals: number,
    from_amount: string,
    to_amount: string,
    usd_value: number,
}


export const ERC20SwapImpl = {
    name: "erc20-swap",
    fetchDocument: ERC20SwapDocument,
    mapGraphQLResult: (value: ERC20SwapQuery) => value.swaps.map((swap) => ({
        block_number: Number.parseInt(swap.blockNumber, 10),
        transaction_hash: swap.hash,
        from_token_address: swap.tokenIn.id,
        from_token_name: swap.tokenIn.name,
        from_token_symbol: swap.tokenIn.symbol,
        from_token_decimals: swap.tokenIn.decimals,
        to_token_address: swap.tokenOut.id,
        to_token_name: swap.tokenOut.name,
        to_token_symbol: swap.tokenOut.symbol,
        to_token_decimals: swap.tokenOut.decimals,
        from_amount: swap.amountIn,
        to_amount: swap.amountOut,
        usd_value: Number.isNaN((Number.parseFloat(swap.amountInUSD) + Number.parseFloat(swap.amountOutUSD)) / 2) ? -1 : (Number.parseFloat(swap.amountInUSD) + Number.parseFloat(swap.amountOutUSD)),
    })),
    insert: async (values: ERC20SwapItem[]) => {
        const filteredValues = [] as any[]
        const it = filterField(
            values,
            "from_token_name",
            "from_token_symbol",
            "from_token_decimals",
            "to_token_name",
            "to_token_symbol",
            "to_token_decimals",
        );
        for (const [value, orig] of it) {
            await upsertToken({
                contract_address: value.from_token_address,
                name: orig.from_token_name,
                symbol: orig.from_token_symbol,
                decimals: orig.from_token_decimals,
            });
            await upsertToken({
                contract_address: value.to_token_address,
                name: orig.to_token_name,
                symbol: orig.to_token_symbol,
                decimals: orig.to_token_decimals,
            });
            filteredValues.push(value);
        }
        await prismaClient.erc20_swaps.createMany({ data: filteredValues });
    }
}

interface ERC20TransferItem {
    block_number: number,
    transaction_hash: string,
    token_address: string,
    from_address: string,
    to_address: string,
    amount: string,
}


export const ERC20TransferImpl = {
    name: "erc20-transfer",
    fetchDocument: ERC20TransferDocument,
    mapGraphQLResult: (value: ERC20TransferQuery) => value.transfers.map((transfer) => ({
        block_number: Number.parseInt(transfer.blockNumber, 10),
        transaction_hash: transfer.transactionHash,
        token_address: transfer.tokenAddress,
        from_address: transfer.from,
        to_address: transfer.to,
        amount: transfer.value,
    })),
    insert: async (values: ERC20TransferItem[]) => {
        await prismaClient.transfers.createMany({ data: values });
    }
}
