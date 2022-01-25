//  This is an endpoint to login with magic link

const url = `https://${process.env.AUTH0_DOMAIN}/passwordless/start`;

export const post = async (event) => {
    console.log('login endpoint');
    const data = await event.request.formData();
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            connection: 'email',
            email: data.get('email'),
            send: 'link',
            authParams: {
                scope: 'openid email',
                response_type: 'code',
                state: 'YOUR_STATE'
            }
        })
    });
    return {
        status: 302,
        location: '/',
        body: 'Please log in using the magic link sent to ' + data.get('email') + '!'
    }
}
