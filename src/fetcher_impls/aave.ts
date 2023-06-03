import { AaveLiquidationDocument, AaveLiquidationQuery } from "../../.graphclient";
import { prismaClient } from "../prisma";

interface AAVELiquidationItem {
    block_number: number,
    transaction_hash: string,
    pool_address: string,
    collateral_token_address: string,
    collateral_amount: string,
    usd_value: number,
}

export const AAVELiquidationImpl = {
    name: "aave-liquidation",
    fetchDocument: AaveLiquidationDocument,
    mapGraphQLResult: (value: AaveLiquidationQuery) => value.liquidates.map((liquidate) => ({
        block_number: Number.parseInt(liquidate.blockNumber, 10),
        transaction_hash: liquidate.hash,
        pool_address: liquidate.market.id,
        collateral_token_address: liquidate.asset.id,
        collateral_amount: liquidate.amount,
        usd_value: Number.parseFloat(liquidate.amountUSD),
    })),
    insert: async (values: AAVELiquidationItem[]) => {
        await prismaClient.liquidations.createMany({ data: values });
    }
}
