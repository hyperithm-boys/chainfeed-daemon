import { OpenSeaTradeDocument, OpenSeaTradeQuery } from "../../.graphclient";
import { prismaClient } from "../prisma";

interface OpenSeaTradeItem {
    transaction_hash: string,
    block_number: number,
    from_address: string,
    to_address: string,
    contract_address: string,
    nft_name: string,
    nft_symbol: string,
    nft_token_id: string,
    price_eth: number,
}

export const OpenSeaTradeImpl = {
    name: "opensea-trade",
    fetchDocument: OpenSeaTradeDocument,
    mapGraphQLResult: (value: OpenSeaTradeQuery) => value.trades.map((trade) => ({
        transaction_hash: trade.transactionHash,
        block_number: Number.parseInt(trade.blockNumber, 10),
        from_address: trade.seller,
        to_address: trade.buyer,
        contract_address: trade.collection.id,
        nft_name: trade.collection.name ?? "<unknown>",
        nft_symbol: trade.collection.symbol ?? "<unknown>",
        nft_token_id: trade.tokenId,
        price_eth: Number.parseFloat(trade.priceETH),
    })),
    insert: async (values: OpenSeaTradeItem[]) => {
        await prismaClient.nft_trades.createMany({ data: values });
    }
}
