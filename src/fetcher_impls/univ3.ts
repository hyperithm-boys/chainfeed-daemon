import { UniV3DepositDocument, UniV3DepositQuery, UniV3PoolCreationDocument, UniV3PoolCreationQuery } from "../../.graphclient";
import { prismaClient } from "../prisma";

interface UniV3DepositItem {
    transaction_hash: string,
    block_number: number,
    usd_value: number,
}

export const UniV3DepositImpl = {
    name: "univ3-deposit",
    fetchDocument: UniV3DepositDocument,
    mapGraphQLResult: (value: UniV3DepositQuery) => value.deposits.map((deposit) => ({
        block_number: Number.parseInt(deposit.blockNumber, 10),
        transaction_hash: deposit.hash,
        usd_value: Number.isNaN(Number.parseFloat(deposit.amountUSD)) ? -1 : Number.parseFloat(deposit.amountUSD),
    })),
    insert: async (values: UniV3DepositItem[]) => {
        await prismaClient.lp_deposit_withdraws.createMany({ data: values });
    }
}

interface UniV3PoolCreationItem {
    transaction_hash: string,
    block_number: number,
    token_address1: string,
    token_address2: string,
}

export const UniV3PoolCreationImpl = {
    name: "univ3-pool-creation",
    fetchDocument: UniV3PoolCreationDocument,
    mapGraphQLResult: (value: UniV3PoolCreationQuery) => value.pairCreateds.map((pairCreated) => ({
        block_number: Number.parseInt(pairCreated.blockNumber, 10),
        transaction_hash: pairCreated.transactionHash,
        token_address1: pairCreated.token0,
        token_address2: pairCreated.token1,
    })),
    insert: async (values: UniV3PoolCreationItem[]) => {
        await prismaClient.swap_pool_creations.createMany({ data: values });
    }
}
