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
	<!-- This is for screens -->
	<div id="screen">
		<!-- This is a field for finding customers	-->
		<div class="whitebox">
			<input bind:value={prefix} placeholder="filter by surname" />
			<!-- This is a button for printing out a list -->
			<button on:click={() => window.print()}>Print Out</button>
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
					<!-- This is a list of deliveries with billing dates -->
					<div id="unbilled">
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
						<form action="/billing/undo.json" method="post">
							<input
								hidden
								name="delivery_id"
								value={delivery_id}
							/>
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
				<hr />
				Sum to bill ({currency}): {to_pay}
				<!-- This is a form to set multiple deliveries as billed -->
				<form action="/billing/bill.json" method="post">
					<input hidden name="customer_id" value={customer_id} />
					<input
						type="submit"
						value="Billed them all!"
						hidden={(() => allDeliveriesBilled(delivery))()}
					/>
				</form>
			</div>
		{/each}
	</div>
	<!-- This is for printers -->
	<div id="print">
		<!-- This is a list of customers to bill -->
		{#each customer as { first_name, last_name, delivery, to_pay }}
			<div id="customer">
				<p>
					{first_name}
					{last_name}:
				</p>
				<ul>
					{#each delivery as { delivery_date, product_name, price, billing_date }}
						<!-- This is a list of deliveries with billing dates -->
						<li>
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
						</li>
					{/each}
				</ul>
				Sum to bill ({currency}): {to_pay}
			</div>
			<hr />
		{/each}
	</div>
</main>

<style>
	#print {
		display: none;
	}
	#screen {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
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
	/* Hides the navbar for printers*/
	@media print {
		#print {
			display: block;
			text-align: left;
			width: 100%;
			padding-left: 20vw;
			padding-bottom: 20vh;
			position: absolute;
			top: 0;
			background-color: white;
		}
		ul {
			list-style-type: circle;
			padding-left: 5vw;
		}
		#screen {
			display: none;
		}
		#customer {
			break-inside: avoid;
		}
	}
</style>
