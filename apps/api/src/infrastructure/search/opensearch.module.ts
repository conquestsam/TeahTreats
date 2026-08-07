import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { OpenSearchService } from './opensearch.service.js';
import { OPENSEARCH_CLIENT } from './opensearch.tokens.js';

@Global()
@Module({
  providers: [
    {
      provide: OPENSEARCH_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const username = config.get<string>('OPENSEARCH_USERNAME');
        const password = config.get<string>('OPENSEARCH_PASSWORD');
        return new Client({
          node: config.getOrThrow<string>('OPENSEARCH_NODE'),
          ...(username && password ? { auth: { username, password } } : {})
        });
      }
    },
    OpenSearchService
  ],
  exports: [OpenSearchService, OPENSEARCH_CLIENT]
})
export class SearchInfrastructureModule {}
