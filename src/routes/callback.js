/*  Endpoint for callback from authentication...   */

export const get = async (event) => {
    //  ...gets the code from Auth0...
    const url = new URL (event.url.href);
    const params = new URLSearchParams(url.search);
    const code = params.get('code');
    //  ...to use when getting an access token...
    const accessToken = await getAccessToken(code, event.url.origin);
    //  ...to use for validation and getting users email...
    const userEmail = await getUserEmail(accessToken)
    //  ...and cache for later use in hooks.js...
    await cacheUser(accessToken, userEmail);
    //  ...and mutate request object read in hooks.js after the resolve...
    event.locals.sessionId = accessToken;
    return {
        status: 302,
        headers: {
            location: '/'
        }
    }
}

async function getAccessToken(code, origin) {
    const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            code: code,
            redirect_uri: origin + '/callback'
        })
    });
    const token = await res.json();
    return token.access_token;
}

async function getUserEmail(accessToken) {
    const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
        }
    });
    const user = await res.json();
    return user.email;
}

//	store session with in-memory database API (to keep authentication fast) for 12h
async function cacheUser(accessToken, userEmail) {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${accessToken}/${userEmail}/EX/43200`, {
        headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        }
    });
}