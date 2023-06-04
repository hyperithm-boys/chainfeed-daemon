import { UniV3DepositDocument, UniV3DepositQuery, UniV3WithdrawDocument, UniV3WithdrawQuery, UniV2PoolCreationDocument, UniV2PoolCreationQuery } from "../../.graphclient";
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
        transaction_hash: deposit.hash,
        block_number: Number.parseInt(deposit.blockNumber, 10),
        usd_value: Number.isNaN(Number.parseFloat(deposit.amountUSD)) ? 0 : Number.parseFloat(deposit.amountUSD),
    })),
    insert: async (values: UniV3DepositItem[]) => {
        await prismaClient.lp_deposit_withdraws.createMany({ data: values });
    }
}

interface UniV3WithdrawItem {
    transaction_hash: string,
    block_number: number,
    usd_value: number,
}

export const UniV3WIthdrawImpl = {
    name: "univ3-withdraw",
    fetchDocument: UniV3WithdrawDocument,
    mapGraphQLResult: (value: UniV3WithdrawQuery) => value.withdraws.map((withdraw) => ({
        transaction_hash: withdraw.hash,
        block_number: Number.parseInt(withdraw.blockNumber, 10),
        usd_value: Number.isNaN(Number.parseFloat(withdraw.amountUSD)) ? 0 : -Number.parseFloat(withdraw.amountUSD),
    })),
    insert: async (values: UniV3WithdrawItem[]) => {
        await prismaClient.lp_deposit_withdraws.createMany({ data: values });
    }
}

interface UniV2PoolCreationItem {
    transaction_hash: string,
    block_number: number,
    token_address1: string,
    token_address2: string,
}

export const UniV2PoolCreationImpl = {
    name: "univ3-pool-creation",
    fetchDocument: UniV2PoolCreationDocument,
    mapGraphQLResult: (value: UniV2PoolCreationQuery) => value.pairCreateds.map((pairCreated) => ({
        block_number: Number.parseInt(pairCreated.blockNumber, 10),
        transaction_hash: pairCreated.transactionHash,
        token_address1: pairCreated.token0,
        token_address2: pairCreated.token1,
    })),
    insert: async (values: UniV2PoolCreationItem[]) => {
        await prismaClient.swap_pool_creations.createMany({ data: values });
    }
}
