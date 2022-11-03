import sinon from 'sinon';
import * as databaseUtils from '../../../../src/utils/database';
import supertest from 'supertest';
import fixtures from '../../fixtures/metadata.fixtures';
import buildFastify from '../../../../src/app';
import { describe, expect, test } from 'vitest';

describe('metadata service', () => {
  fixtures.map(fixture => {
    test(fixture.name, async () => {
      const queryMock = sinon.stub();
      const fastify = buildFastify({ maxParamLength: 32_768 });

      // @ts-ignore
      const database = sinon.stub(databaseUtils, 'getDbSync').resolves({
        release: () => null,
        query: queryMock,
      });

      await fastify.ready();
      queryMock.onFirstCall().resolves(fixture.sqlQueryMock);
      const response = await supertest(fastify.server).get(fixture.endpoint);

      expect(response).toSatisfyApiSpec();
      expect(response.body).toEqual(fixture.response);
      database.restore();
      fastify.close();
    });
  });
});
