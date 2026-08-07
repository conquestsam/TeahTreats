import { Inject, Injectable } from '@nestjs/common';
import type { Client } from '@opensearch-project/opensearch';
import { OPENSEARCH_CLIENT } from './opensearch.tokens.js';

@Injectable()
export class OpenSearchService {
  constructor(@Inject(OPENSEARCH_CLIENT) private readonly client: Client) {}

  ping() {
    return this.client.ping();
  }

  indexProduct(document: Record<string, unknown>) {
    return this.client.index({
      index: 'products-v1',
      id: String(document.id),
      body: document,
      refresh: false
    });
  }

  async reindexProducts(documents: Array<Record<string, unknown>>) {
    const index = 'products-v1';
    const existsResponse = await this.client.indices.exists({ index });
    const exists = Boolean((existsResponse as { body?: boolean }).body);
    if (exists) {
      await this.client.indices.delete({ index });
    }
    await this.client.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            tenantId: { type: 'keyword' },
            status: { type: 'keyword' },
            slug: { type: 'keyword' },
            name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            brand: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            category: { type: 'keyword' },
            description: { type: 'text' },
            tags: { type: 'keyword' },
            dietaryLabels: { type: 'keyword' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });

    if (!documents.length) {
      return { indexed: 0 };
    }

    await this.client.bulk({
      refresh: true,
      body: documents.flatMap((document) => [
        { index: { _index: index, _id: String(document.id) } },
        document
      ])
    });

    return { indexed: documents.length };
  }

  async searchProductIds(input: { tenantId: string; query: string; limit: number }) {
    const response = await this.client.search({
      index: 'products-v1',
      size: input.limit,
      body: {
        query: {
          bool: {
            filter: [{ term: { tenantId: input.tenantId } }, { term: { status: 'active' } }],
            must: [
              {
                multi_match: {
                  query: input.query,
                  fields: ['name^3', 'brand^2', 'category^2', 'description', 'tags', 'dietaryLabels'],
                  fuzziness: 'AUTO'
                }
              }
            ]
          }
        }
      }
    });

    const hits = (response.body as { hits: { hits: Array<{ _id?: string }> } }).hits.hits;

    return hits
      .map((hit: { _id?: string }) => hit._id)
      .filter((id: string | undefined): id is string => Boolean(id));
  }
}
