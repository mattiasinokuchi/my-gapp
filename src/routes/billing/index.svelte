<!-- This is the page for billing -->
<script context="module">
	export async function load({ fetch }) {
		let res = null;
		try {
			res = await fetch("/billing.json");
			const customer = await res.json();
			return {
				props: {
					customer,
				},
			};
		} catch (error) {
			return error;
		}
	}
</script>

<script>
	export let customer;
</script>

<main>
	<h2 hidden={customer.length > 0}>No billing to do. Relax!</h2>

	<!-- This is a list of customers to bill -->
	{#each customer as { first_name, last_name, delivery, customer_id }}
		<div class="box">
			<h2>
				{first_name}
				{last_name}:
			</h2>
			{#each delivery as { delivery_date, product_name, price, billing_date }}
				<p>
					<span class:active={billing_date}>
						{delivery_date}: {product_name} (${price})
					</span>
					<span hidden={!billing_date}>
						billed {billing_date}
					</span>
				</p>
			{/each}
			<form action="/billing/set_date.json" method="post">
				<input hidden name="customer_id" value={customer_id} />
				<input type="submit" value="Done" />
			</form>
		</div>
	{/each}
</main>

<style>
	span.active {
		text-decoration: line-through;
		color: gray;
	}
	span {
		text-decoration: none;
		color: black;
	}
</style>
