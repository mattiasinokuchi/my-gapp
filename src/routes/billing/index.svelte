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
			{#each delivery as { delivery_id, delivery_date, product_name, price, billing_date }}
				<!-- This is a form for updating delivery and billing dates -->
				<div id="unbilled">
					<!-- This is a form to undo a delivery -->
					<form action="/billing/remove_delivery.json" method="post">
						<input hidden name="delivery_id" value={delivery_id} />
						<input
							hidden={billing_date}
							type="submit"
							value="Undeliver"
						/>
					</form>
					<span
						hidden={!billing_date}
						class:active={billing_date}
						for="delivery_date"
						>{delivery_date}:
					</span>
					<input
						hidden={billing_date}
						type="date"
						name="delivery_date"
						value={delivery_date}
					/>
					<span class:active={billing_date} for="product_name"
						>{product_name} (${price})</span
					>
				</div>
				<div id="billed">
					<span hidden={!billing_date} for="billing_date"
						>billed
					</span>
					<input
						class="billing_date"
						hidden={!billing_date}
						type="date"
						name="billing_date"
						value={billing_date}
					/>
					<!-- This is a form to undo a billing -->
					<form action="/billing/update.json" method="post">
						<input hidden name="delivery_id" value={delivery_id} />
						<input
							hidden
							name="delivery_date"
							value={delivery_date}
						/>
						<input hidden name="billing_date" value="" />
						<input
							hidden={!billing_date}
							type="submit"
							value="Undo"
						/>
					</form>
				</div>
			{/each}
			<!-- This is a form to set multiple deliveries as billed -->
			<form action="/billing/set_date.json" method="post">
				<input hidden name="customer_id" value={customer_id} />
				<input type="submit" value="Bill them all!" />
			</form>
		</div>
	{/each}
</main>

<style>
	#unbilled,
	#billed {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	span.active {
		text-decoration: line-through;
		color: gray;
	}
	span {
		color: black;
	}
	input[type="date"] {
		background-color: lemonchiffon;
		border: none;
	}
</style>
