//  This file exports two functions that run on the server...

/*
import { parse } from 'cookie';

export async function handle({ request, resolve }) {
	const cookies = parse(request.headers.cookie || '');

	if (cookies.sessionId) {
		const session = await getSessionFromApi(cookies.sessionId);
		if (session) {
			request.locals.user = session.result;
			return resolve(request);
		}
	}

	request.locals.user = null;
	return resolve(request);
}

export function getSession(request) {
	return request?.locals?.user
		? {
			user: request.locals.user
		}
		: {};
}

async function getSessionFromApi(sessionId) {
	const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${sessionId}`, {
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
		}
	});
	const session = await res.json();
	return session;
}

*/

//	Example from tutorial-sveltekit-authentication

import cookie from 'cookie';

export const handle = async ({ event, resolve }) => {
	// before endpoint call
	console.log('before endpoint call');
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	event.locals.sessionId = cookies.sessionId;
	//	request.locals.user = cookies.user;

	// endpoint call
	const response = await resolve(event);

	// after endpoint call
	console.log('after endpoint call');

	response.headers['set-cookie'] = `sessionId=${event.locals.sessionId || ''}; Path=/; HttpOnly`
	//	response.headers['set-cookie'] = `user=${request.locals.user || ''}; Path=/; HttpOnly`
	return response
}

export async function getSession(request) {
	console.log('return session to client');
	return {
		sessionId: request.locals.sessionId
		//		user: request.locals.user
	}
}

/*

Veggies

import cookie from 'cookie';

export async function handle({ request, resolve }) {
	const cookies = cookie.parse(request.headers.cookie || '');
	if (cookies.sessionId) {
		try {
			//	...the cache is searched for a user...
			const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${cookies.sessionId}`, {
				headers: {
					Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
				}
			});
			const user = await res.json();
			//	...no user found and added to the request...
			if (!user.result) {
				request.locals.user = null;
				return resolve(request);
			}
			//	...or user found and added to the request...
			request.locals.user = user.result;
			const response = await resolve(request);
			//	...request is passed with some security headers...
			return {
				...response,
				headers: {
					...response.headers,
					'X-Frame-Options': 'SAMEORIGIN',
					'X-Content-Type-Options': 'nosniff',
					'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
					'Content-Security-Policy': "img-src 'self'; script-src 'self' 'unsafe-inline'",
					'X-XSS-Protection': '1; mode=block'
				},
			}
		} catch (error) {
			console.log(error);
		}
	}
	request.locals.user = null;
	return resolve(request);

}

export async function getSession(request) {
	return {
		user: request.locals.user
	}
}

*/