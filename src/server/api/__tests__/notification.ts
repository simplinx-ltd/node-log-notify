import * as express from 'express';
import * as sinon from 'sinon';
import * as request from 'supertest';

import api from '../notification';

describe('Notification Endpoints', (): void => {
    describe('Route /api/notification to getAll()', function(): void {
        it('respond with json', function(done): void {
            let app = express;
            let fake = sinon.fake();

            app.Router().use(api(fake));

            request(app)
                .get('/api/notification')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function(err, res): void {
                    if (err) return done(err);
                    done();
                });
            done();
        });
    });
});
