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
					currency: process.env.CURRENCY,
				},
			};
		} catch (error) {
			return error;
		}
	}
</script>

<script>
	export let customer, currency;

	function allDeliveriesBilled(delivery) {
		return delivery.every((element) => element.billing_date);
	}

	//	This a block of code for filtering customers
	let prefix = "";
	$: filteredCustomer = prefix
		? customer.filter((person) => {
				const name = `${person.last_name}, ${person.first_name}`;
				return name.toLowerCase().startsWith(prefix.toLowerCase());
		  })
		: customer;
</script>

<main>
	<!-- This is a field for finding customers	-->
	<div class="whitebox">
		<input bind:value={prefix} placeholder="filter by surname" />
	</div>

	<h2 hidden={customer.length > 0}>No billing to do. Relax!</h2>

	<!-- This is a list of customers to bill -->
	{#each filteredCustomer as { first_name, last_name, delivery, customer_id, to_pay }}
		<div class="box">
			<h2>
				{first_name}
				{last_name}:
			</h2>
			{#each delivery as { delivery_id, delivery_date, product_name, price, billing_date }}
				<!-- This is a form for updating delivery and billing dates -->
				<div id="unbilled">
					<!-- This is a form to undo a delivery -->
					<span
						hidden={!billing_date}
						class:active={billing_date}
						for="delivery_date"
						>{delivery_date}:
					</span>
					<input
						hidden={billing_date}
						type="text"
						name="delivery_date"
						value={delivery_date}
						size="10"
					/>
					<span class:active={billing_date} for="product_name"
						>{product_name} ({currency}{price})</span
					>
					<form action="/billing/remove_delivery.json" method="post">
						<input hidden name="delivery_id" value={delivery_id} />
						<input
							hidden={billing_date}
							type="submit"
							value="Undeliver"
						/>
					</form>
				</div>
				<div id="billed">
					<span hidden={!billing_date} for="billing_date"
						>billed
					</span>
					<input
						class="billing_date"
						hidden={!billing_date}
						type="text"
						name="billing_date"
						value={billing_date}
						size="10"
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
			Total ({currency}): {to_pay}
			<!-- This is a form to set multiple deliveries as billed -->
			<form action="/billing/set_date.json" method="post">
				<input hidden name="customer_id" value={customer_id} />
				<input
					type="submit"
					value="Bill them all!"
					hidden={(() => allDeliveriesBilled(delivery))()}
				/>
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
	input[type="text"] {
		background-color: lemonchiffon;
		border: none;
	}
</style>
