import cookie from 'cookie';

export const handle = async ({ event, resolve }) => {
	console.log('handle');
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const session = await getSessionFromApi(cookies.sessionId);
	if (session.result) {
		event.locals.sessionId = cookies.sessionId;
		event.locals.user = session.result;
	} else {
		event.locals.sessionId = null;
	}
	const response = await resolve(event);
	if (event.locals.sessionId) {
		response.headers.append(
			'set-cookie',
			cookie.serialize('sessionId', event.locals.sessionId, {
                path: '/',
                httpOnly: true,
//                sameSite: 'strict',	redirection after login not working when enabled
                secure: process.env.NODE_ENV === 'production',
                maxAge: 604800
			})
		);
		response.headers.append(
			'set-cookie',
			cookie.serialize('user', event.locals.user, {
                path: '/',
                httpOnly: true,
//                sameSite: 'strict',	redirection after login not working when enabled
                secure: process.env.NODE_ENV === 'production',
                maxAge: 604800
			})
		);
	}
	return response;
}

export async function getSession(event) {
	//	not executed by prefetch
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