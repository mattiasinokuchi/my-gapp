<script context="module">
    export async function load({ session }) {
        if (session.user) {
            return { redirect: "/product", status: 302 };
        }
        return {
            props: {},
        };
    }
</script>

<main>
    <form action="/login" method="post">
        <p>I'm stepping in<sup>*</sup></p>
        <p>Send a magic link to</p>
        <input
            type="email"
            name="email"
            id="email"
            placeholder="my@email.address"
        />
        <input type="submit" value="Submit" />
    </form>
    <footer>
        <sup>*)</sup>
        I don't mind a
        <a
            href="https://en.wikipedia.org/wiki/HTTP_cookie"
            target="_blank"
            rel="noopener noreferrer"
        >
            web cookie
        </a> and having my email address stored privately for a while
    </footer>
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
    footer {
        position: fixed;
        bottom: 10%;
        left: 25%;
        right: 25%;
    }
    a {
        text-decoration: underline;
        color: black;
    }
</style>
