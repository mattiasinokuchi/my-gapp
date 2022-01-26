<script context="module">
    export async function load({ session }) {
        if (session.sessionId) {
            return { redirect: "/product", status: 302 };
        }
        return {
            props: {},
        };
    }
</script>

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
