<script context="module">
	//	not executed by prefetch
	import "../app.css";
	import { page } from "$app/stores";

	export async function load({ url, session }) {
		if (url.pathname !== "/" && !session.user) {
			return { redirect: "/", status: 302 };
		}
		return {
			props: {
				demoMode: process.env.DEMO_MODE,
			},
		};
	}
</script>

<script>
	export let demoMode;
</script>

<nav>
	<a
		class:active={$page.url.pathname.match(/product/)}
		sveltekit:prefetch
		href="/product">PRODUCTS</a
	>
	<a
		class:active={$page.url.pathname.match(/customer/)}
		sveltekit:prefetch
		href="/customer">CUSTOMERS</a
	>
	<a
		class:active={$page.url.pathname.match(/deliver/)}
		sveltekit:prefetch
		href="/deliver">DELIVERY</a
	>
	<a
		class:active={$page.url.pathname.match(/billing/)}
		sveltekit:prefetch
		href="/billing">BILLING</a
	>
</nav>

<div hidden={!demoMode}>This is a demo. Anyone can see and edit this content.</div>

<main>
	<slot />
</main>

<style>
	nav {
		padding: 2vh;
		box-shadow: 0vw 1vw 1vw 0.2vw lightgray;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}
	a {
		text-decoration: none;
		color: gray;
		margin: 1vw;
		font-weight: bold;
		font-size: 4vw;
	}
	a.active {
		text-decoration: none;
		color: salmon;
		margin-right: 1rem;
	}
	div {
		text-align: center;
		color: gray;
	}
</style>
