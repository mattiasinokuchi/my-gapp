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
				<form action="">
					<!-- This is a form to undo a delivery -->
					<form action="">
						<input hidden name="delivery_id" value={delivery_id} />
						<input hidden={billing_date} type="submit" value="Undo" />
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
						>{product_name}</span
					>
					<div id="billed">
						<label hidden={!billing_date} for="billing_date"
							>billed</label
						>
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
							<input hidden name="delivery_date" value={delivery_date} />
							<input hidden name="billing_date" value="01-01-0001" />
							<input hidden={!billing_date} type="submit" value="Undo" />
						</form>
					</div>
				</form>
			{/each}
			<!-- This is a form to set multiple deliveries as billed -->
			<form action="/billing/set_date.json" method="post">
				<input hidden name="customer_id" value={customer_id} />
				<input type="submit" value="Billed them all!" />
			</form>
		</div>
	{/each}
</main>

<style>
	#billed {
		display: flex;
		align-items: center;
	}
	span.active {
		text-decoration: line-through;
		color: gray;
	}
	span {
		color: black;
	}
	label {
		color: black;
		width: auto;
	}
	.billing_date {
		background-color: lemonchiffon;
		border: none;
	}
</style>
