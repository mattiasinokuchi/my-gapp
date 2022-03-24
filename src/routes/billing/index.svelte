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

	let edit_id = null;
	let showBilled = false;

	function allDeliveriesBilled(delivery) {
		return delivery.every((element) => element.billing_date);
	}

	//	This a block of code for filtering customers
	let lettersInFilter = "";
	$: deliveredCustomers = !showBilled //	apply filter below if showBilled is not checked
		? customer.filter((person) => {
				return person.to_pay > 0;
		  })
		: customer; //	don't apply filter if showBilled is checked
	$: filteredCustomer = lettersInFilter //	apply filter below if there is any lettersInFilter
		? deliveredCustomers.filter((person) => {
				return person.last_name
					.toLowerCase()
					.startsWith(lettersInFilter.toLowerCase());
		  })
		: deliveredCustomers; //	don't apply filter below if there is no lettersInFilter
</script>

<main>
	<!-- This is for screens -->
	<div id="screen">
		<div class="whitebox">
			<!-- This is a checkbox for showing billed deliveries	-->
			<label for="showBilled">Show billed</label>
			<input
				type="checkbox"
				name="showBilled"
				bind:checked={showBilled}
			/>
			<!-- This is a field for filtering customers	-->
			<input
				type="text"
				bind:value={lettersInFilter}
				placeholder="filter by last name"
				size="11"
			/>
			<!-- This is a button for printing out a list -->
			<button on:click={() => window.print()}>Print Out</button>
		</div>

		<h2 hidden={filteredCustomer.length > 0}>No billing to do. Relax!</h2>

		<!-- This is a list of customers to bill -->
		{#each filteredCustomer as { first_name, last_name, delivery, customer_id, to_pay }}
			<div class="box">
				<h2>
					{first_name}
					{last_name}:
				</h2>
				<!-- This is a list of deliveries -->
				<ul>
					{#each delivery as { delivery_id, delivery_date, product_name, price, billing_date, delivery_comment }}
						<!-- This is a form for updating a delivery -->
						{#if edit_id === delivery_id}
							<li>
								<form
									action="/billing/update.json"
									method="post"
								>
									<fieldset>
										<input
											hidden
											name="delivery_id"
											value={delivery_id}
										/>
										<p>
											<label for="product_name"
												>Product</label
											>
											<input
												type="text"
												name="product_name"
												value={product_name}
												disabled
											/>
										</p>
										<p>
											<label for="delivery_date"
												>Delivery date
											</label>
											<input
												type="date"
												name="delivery_date"
												value={delivery_date}
												required
											/>
										</p>
										<p>
											<label for="price"
												>Price ({currency})
											</label>
											<input
												type="number"
												name="price"
												value={price}
												min="0"
												max="999"
											/>
										</p>
										<p>
											<label for="delivery_comment"
												>Comment
											</label>
											<input
												type="text"
												name="delivery_comment"
												value={delivery_comment}
												size="20"
											/>
										</p>
										<p>
											<label for="billing_date"
												>Billing date
											</label>
											<input
												type="date"
												name="billing_date"
												value={billing_date}
											/>
										</p>
										<input
											type="button"
											value="Cancel"
											on:click={() => (edit_id = null)}
										/>
										<input type="submit" value="Update" />
									</fieldset>
								</form>
							</li>
						{:else}
							<div>
								<span
									hidden={!showBilled && billing_date}
									class:active={billing_date}
								>
									{delivery_date}, {product_name}, {currency}
									{price}
								</span>
								<button
									on:click={() => (edit_id = delivery_id)}
									hidden={edit_id === delivery_id ||
										(!showBilled && billing_date)}
									disabled={edit_id}
									>Edit
								</button>
							</div>
						{/if}
					{/each}
				</ul>
				<hr />
				Sum to bill ({currency}): {to_pay}
				<!-- This is a form to set multiple deliveries as billed -->
				<form action="/billing/bill_all.json" method="post">
					<input hidden name="customer_id" value={customer_id} />
					<input
						type="submit"
						value="Billed them all!"
						hidden={(() => allDeliveriesBilled(delivery))()}
						disabled={edit_id}
					/>
				</form>
			</div>
		{/each}
	</div>
	<!-- This is for printers -->
	<div id="print">
		<!-- This is a list of customers to bill -->
		{#each filteredCustomer as { first_name, last_name, delivery, to_pay }}
			<div id="customer">
				<p>
					{first_name}
					{last_name}:
				</p>
				<ul>
					{#each delivery as { delivery_date, product_name, price, billing_date }}
						<!-- This is a list of deliveries with billing dates -->
						<li hidden={!showBilled && billing_date}>
							<span
								class:active={billing_date}
								for="delivery_date"
								>{delivery_date}:
							</span>
							<span class:active={billing_date} for="product_name"
								>{product_name} ({currency}{price})</span
							>
							<span hidden={!billing_date} for="billing_date"
								>billed
							</span>
							<span hidden={!billing_date}>{billing_date} </span>
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
	span.active {
		text-decoration: line-through;
		color: gray;
	}
	fieldset {
		border-radius: 5vw;
		border-color: salmon;
		border-width: 1px;
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
		#screen {
			display: none;
		}
		ul {
			list-style-type: circle;
			padding-left: 5vw;
		}
		#customer {
			break-inside: avoid;
		}
	}
</style>
