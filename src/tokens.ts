import { prismaClient } from "./prisma";

export interface Token {
    contract_address: string;
    name: string;
    symbol: string;
    decimals: number;
}

export async function insertToken(token: Token) {
    await prismaClient.tokens.upsert({
        where: { contract_address: token.contract_address },
        update: token,
        create: token,
    });
}
