import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import * as jsonwebtoken from 'jsonwebtoken';
import * as log4js from 'log4js';
import * as Debug from 'debug';
import { ApiError } from 'sx-sequelize-api';

// Logger
const logger = log4js.getLogger('API-AUTH');

const debug = Debug('Auth');

let credentials = {
	username: null,
	password: null,
};

export { authMiddleware, authLogin, authLogout, getAuthHashCode, setUsernamePassword };

let _hashCode: string = null;

function authMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
	if (!_hashCode) {
		logger.debug('Generating hash Code...');
		_hashCode = crypto.randomBytes(32).toString('hex');
	}

	return (req: Request, res: Response, next: NextFunction): void => {
		let accessToken = req.body.token || req.query.token || req.headers['x-access-token'];

		// If no access token return
		if (!accessToken) {
			debug('Request does not have a access-token.');
			return next(ApiError.accessError());
		}

		// Decrypt Token
		jsonwebtoken.verify(accessToken, _hashCode, (err0: Error /** , decoded: any**/): void => {
			// Can not verify
			if (err0) {
				debug('Can not verify token');
				return next(ApiError.accessError());
			}

			return next();
		});
	};
}

function authLogin(req: Request, res: Response, next: NextFunction): void {
	let username: string = req.body.username || null;
	let password: string = req.body.password || null;

	if (!credentials || !credentials.username || !credentials.password) {
		logger.error('Credentials not set yet');
		return next(ApiError.accessError());
	}

	if (!username || !password) {
		logger.debug(`username or password is null`);
		return next(ApiError.accessError());
	}

	if (password !== credentials.password) {
		logger.warn(`Wrong password for ${username}`);
		return next(ApiError.accessError());
	}

	logger.info(`${username} logged in.`);
	let hash = {
		_hashCode,
	};
	let token = jsonwebtoken.sign(hash, _hashCode, { expiresIn: 180 * 60 * 1000 });
	res.json({ token });
}

function authLogout(req: Request, res: Response): void {
	// Nothing to do
	res.json(true);
}

function getAuthHashCode(): string {
	return _hashCode;
}

function setUsernamePassword(_credentials: { username: string; password: string }): void {
	credentials = _credentials;
}
