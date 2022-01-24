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
	const today = new Date().toISOString().slice(0, 10);
	function allDeliveriesToday (delivery) {
		return delivery.every(element => element.delivery_date === today);
	}
</script>

<main>
	<h2 hidden={customer.length > 0}>No billing to do. Relax!</h2>

	<!-- This is a list of customers to bill -->
	{#each customer as { first_name, last_name, delivery, to_pay, customer_id }}
		<div class="box">
			<h2>
				{first_name}
				{last_name}:
			</h2>
			{#each delivery as { delivery_date, product_name, price }}
				<p>
					{delivery_date}: {product_name} (${price})
				</p>
			{/each}
			Total: ${to_pay}
			<form action="/billing.json?_method=delete" method="post">
				<input hidden name="customer_id" value={customer_id} />
				<input
					type="submit"
					value="Clear"
					disabled={(() => allDeliveriesToday(delivery))()}
				/>
			</form>
		</div>
	{/each}
</main>

<style>
</style>
