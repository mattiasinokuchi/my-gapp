<!--	This is the parent page for customers	-->
<script context="module">
	export async function load({ fetch }) {
		let res = null;
		try {
			res = await fetch("/customer.json");
			const customer = await res.json();
			res = await fetch("/customer/get_phone_numbers.json");
			const phone = await res.json();
			return {
				props: {
					customer,
					phone,
				},
			};
		} catch (error) {
			console.log(error);
		}
	}
</script>

<script>
	export let customer, phone;
	let formHidden = true;
	let buttonText = "Copy telephone numbers";
	let prefix = "";
	
	$: filteredPeople = prefix
		? customer.filter((person) => {
				const name = `${person.last_name}, ${person.first_name}`;
				return name.toLowerCase().startsWith(prefix.toLowerCase());
		  })
		: customer;

	function copy() {
		navigator.clipboard.writeText(phone[0].numbers);
		buttonText = "Telephone numbers copied";
	}
</script>

<main>
	<!-- This is a button for copying all customers phone numbers-->
	<form on:click={copy} class="whitebox"><h2>{buttonText}</h2></form>

	<!-- This is a form for adding new customers -->
	<form
		class="whitebox"
		id="new_customer"
		action="/customer.json"
		method="post"
		on:click={() => (formHidden = false)}
	>
		<h2>Add new customer</h2>
		<div hidden={formHidden}>
			<p>
				<label for="first_name">First Name</label>
				<input type="text" id="first_name" name="first_name" required />
			</p>
			<p>
				<label for="last_name">Last Name</label>
				<input type="text" id="last_name" name="last_name" />
			</p>
			<p>
				<label for="street_address">Street Address</label>
				<input type="text" id="street_address" name="street_address" />
			</p>
			<p>
				<label for="postcode">Postcode</label>
				<input type="text" id="postcode" name="postcode" />
			</p>
			<p>
				<label for="city">City</label>
				<input type="text" id="city" name="city" />
			</p>
			<p>
				<label for="telephone">Telephone</label>
				<input type="tel" id="telephone" name="telephone" />
			</p>
			<p>
				<label for="email">Email</label>
				<input type="email" id="email" name="email" />
			</p>
			<p>
				<label for="place_of_delivery">Place of delivery</label>
				<input type="text" id="place_of_delivery" name="place_of_delivery" />
			</p>
			<input type="submit" value="Submit" />
		</div>
	</form>

	<!-- This is a field for filtering customers	-->
	<div class="whitebox">
		<input bind:value={prefix} placeholder="filter by surname" />
	</div>

	<h3 hidden={customer.length > 0}>No customers. Add someone!</h3>

	<!---	This is a filterable list of customers 
			with a form for changing their delivery order	-->
	{#each filteredPeople as { first_name, last_name, customer_id, delivery_order }}
		<div class="box">
			<a sveltekit:prefetch href={`/customer/${customer_id}`}>
				<h2>{first_name} {last_name}</h2>
			</a>
			<form action="/customer/reorder_delivery.json" method="post">
				<label for="delivery_order">Delivery order</label>
				<input hidden name="customer_id" value={customer_id} />
				<input
					type="number"
					name="delivery_order"
					min="1"
					max={customer.length}
					value={delivery_order}
				/>
				<input type="submit" value="Reorder" />
			</form>
		</div>
	{/each}
</main>

<style>
</style>
