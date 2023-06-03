import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { DocumentNode, ExecutionResult } from "graphql";
import { execute } from "../.graphclient";
import { logger } from "./logger";

type DocumentToQuery<T> = T extends TypedDocumentNode<infer U> ? U : never;

interface FeedItem {
    block: number;
}

export interface Fetchable<T extends TypedDocumentNode, U extends FeedItem> {
    name: string;
    fetchDocument: T;
    mapGraphQLResult(value: DocumentToQuery<T>): U[];
    insert(values: U[]): Promise<void>;
}

export class Fetcher<T extends TypedDocumentNode, U extends FeedItem> {
    private nextBlock: number;
    constructor(
        private readonly inner: Fetchable<T, U>,
        private readonly periodSeconds: number,
        initialBlock: number,
    ) { this.nextBlock = initialBlock; }

    private async fetchAndInsert(): Promise<void> {
        let result: ExecutionResult<DocumentToQuery<T>> | undefined = undefined;;
        let error: any = undefined;
        for (let i = 0; i < 5; i++) {
            try {
                result = await execute(this.inner.fetchDocument, { fromBlock: this.nextBlock });
                break;
            } catch (e) {
                logger.error(`fetcher ${this.inner.name} could not fetch data: ${e}`);
                error = e;
                continue;
            }
        }
        if (!result) throw error;
        if (!result?.data) throw `result.data is null or undefined: ${JSON.stringify(result?.errors)}`
        const itemsToInsert = this.inner.mapGraphQLResult(result?.data);
        if (itemsToInsert.length === 0) {
            return;
        }
        for (let i = 0; i < 5; i++) {
            try {
                await this.inner.insert(itemsToInsert);
                this.nextBlock = itemsToInsert.reduce((prev, curr) => prev < curr.block ? curr.block : prev, this.nextBlock) + 1;
                logger.info(`fetcher ${this.inner.name} inserted ${itemsToInsert.length} items, next block to fetch: ${this.nextBlock}`)
                break;
            } catch (e) {
                logger.error(`fetcher ${this.inner.name} could not insert data: ${e}`);
                continue;
            }
        }
    }

    public async fetchTask(): Promise<void> {
        while (true) {
            const sleep = new Promise(r => setTimeout(r, this.periodSeconds * 1000));
            this.fetchAndInsert();
            await sleep;
        }
    }
}