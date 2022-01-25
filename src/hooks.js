import cookie from 'cookie';

export const handle = async ({ event, resolve }) => {
	console.log('handle');
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	event.locals.sessionId = cookies.sessionId || null;
	const response = await resolve(event);
	if (event.locals.sessionId) {
		response.headers.set(
			'set-cookie',
			cookie.serialize('sessionId', event.locals.sessionId, {
				path: '/',
				httpOnly: true
			})
		);
	}
	return response;
};

export async function getSession(event) {
	console.log('getSession');
	return {
		sessionId: event.locals.sessionId
	}
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

/*	...request is passed with some security headers...
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
*/