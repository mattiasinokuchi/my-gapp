import cookie from 'cookie';

export const handle = async ({ event, resolve }) => {
	//	get session id from cookie
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	//	authenticate by finding session in cache
	const session = await getSessionFromApi(cookies.sessionId);
	//	request attachment to forward authenticated user
	if (session.result !== 'undefined') {
		event.locals.sessionId = cookies.sessionId;
		event.locals.user = session.result;
	//	attachment to stop unauthenticated request
	} else {
		event.locals.sessionId = null;
		event.locals.user = null;
	}
	//	pass request to endpoint
	const response = await resolve(event);
	//	set session id in cookie for future requests
	if (event.locals.sessionId) {
		response.headers.append(
			'set-cookie',
			cookie.serialize('sessionId', event.locals.sessionId, {
                path: '/',
                httpOnly: true,
//                sameSite: 'strict',	redirection after login not working when enabled
//                secure: process.env.NODE_ENV === 'production',
//                maxAge: 604800
			})
		);
		response.headers.append(
			'set-cookie',
			cookie.serialize('user', event.locals.user, {
                path: '/',
                httpOnly: true,
//                sameSite: 'strict',	redirection after login not working when enabled
//                secure: process.env.NODE_ENV === 'production',
//                maxAge: 604800
			})
		);
	}
	response.headers.append('X-Frame-Options', 'SAMEORIGIN');
	response.headers.append('X-Content-Type-Options', 'nosniff');
	response.headers.append('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	response.headers.append('Content-Security-Policy', "img-src 'self'; script-src 'self' 'unsafe-inline'");
	response.headers.append('X-XSS-Protection', '1; mode=block');
	//	pass request to getSession before page is rendered
	return response;
}

//	pass users email to page (not executed by prefetch)
export async function getSession(event) {
	return {
		user: event.locals.user
	}
}

//	get session from in-memory database API (to keep authentication fast)
async function getSessionFromApi(sessionId) {
	const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${sessionId}`, {
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
		}
	});
	const session = await res.json();
	return session;
}
