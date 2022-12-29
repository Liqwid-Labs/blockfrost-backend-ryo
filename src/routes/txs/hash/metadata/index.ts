import { FastifyInstance, FastifyRequest } from 'fastify';
import * as QueryTypes from '../../../../types/queries/tx';
import * as ResponseTypes from '../../../../types/responses/tx';
import { getSchemaForEndpoint } from '@blockfrost/openapi';
import { getDbSync } from '../../../../utils/database';
import { handle404 } from '../../../../utils/error-handler';
import { SQLQuery } from '../../../../sql';

async function route(fastify: FastifyInstance) {
  fastify.route({
    url: '/txs/:hash/metadata',
    method: 'GET',
    schema: getSchemaForEndpoint('/txs/{hash}/metadata'),
    handler: async (request: FastifyRequest<QueryTypes.RequestParameters>, reply) => {
      const clientDbSync = await getDbSync(fastify);

      try {
        const query404 = await clientDbSync.query<QueryTypes.ResultFound>(SQLQuery.get('txs_404'), [
          request.params.hash,
        ]);

        if (query404.rows.length === 0) {
          clientDbSync.release();
          return handle404(reply);
        }

        const { rows }: { rows: ResponseTypes.TxMetadata } =
          await clientDbSync.query<QueryTypes.TxMetadata>(SQLQuery.get('txs_hash_metadata'), [
            request.params.hash,
          ]);

        clientDbSync.release();

        if (rows.length === 0) {
          return reply.send([]);
        }

        return reply.send(rows);
      } catch (error) {
        if (clientDbSync) {
          clientDbSync.release();
        }
        throw error;
      }
    },
  });
}

export default route;
