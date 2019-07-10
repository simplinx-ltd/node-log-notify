import * as express from 'express';
import * as sinon from 'sinon';
import * as request from 'supertest';

import api from '../resource-memory';

describe('ResourceMemory Endpoint', (): void => {
    describe('Routes /api/resource-memory', function () {
        it('respond with json', function (done) {
            let app = express;
            let fake = sinon.fake();
            
            app.Router().use(api(fake));

            request(app)
                .get('/api/resource-memory')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done()
                });
            done();
        });
    });
});