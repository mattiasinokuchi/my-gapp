<script context="module">
    export async function load({ session }) {
        console.log('load page');
        return {
            props: {
                session: session.sessionId,
//                user: session.user,
            },
        };
    }

    /*
    export async function load({ session }) {
        if (session.user) {
            return {
                status: 303,
                redirect: "/product",
            };
        }
        return {
            props: {
                user: session.user,
            },
        };
    }
    */
</script>

<script>
    export let session;
//    export let user;
</script>

{#if session}
<!--{#if user}
    <h2>Welcome {user}</h2>-->
    <h2>Welcome</h2>
    <form action="/logout">
        <button>Logout</button>
    </form>
{:else}
    <form action="/login" method="post">
        <p>I'm stepping in.</p>
        <p>Send a magic link to</p>
        <input
            type="email"
            name="email"
            id="email"
            placeholder="me@domain.tld"
        />
        <input type="submit" value="Submit" />
    </form>
{/if}

<!--
<main>
    <form action="/login" method="post">
        <p>I'm stepping in.</p>
        <p>Send a magic link to</p>
        <input
            type="email"
            name="email"
            id="email"
            placeholder="me@domain.tld"
        />
        <input type="submit" value="Submit" />
    </form>
</main>

<style>
    /* Hides the navbar */
    main {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        background-color: white;
    }
    form {
        position: fixed;
        top: 40%;
        left: 25%;
        right: 25%;
    }
</style>
-->
