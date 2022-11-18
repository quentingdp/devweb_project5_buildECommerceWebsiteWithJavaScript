//Main function to load when the html loads
const main = async () => {
	//Variable that will contain the cart
	const cart = [];
	const itemList = await getItemList();
	getStoredCartAndDisplay(cart, itemList);

	//Initialyzing the default form content
	const formInputs = {
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		email: ""
	};

	//Activating the quantity fields behavior : when updated,
	//the quantity is updated in cart (except if the value is non-valid)
	document.querySelectorAll(".itemQuantity").forEach(input => {
		input.addEventListener('input', (event) => {
			updateCurrentQuantity(event, cart, itemList);
		})
	});

	//Activating the "delete" button behavior : on click, the item is removed off the cart
	document.querySelectorAll(".deleteItem").forEach(input => {
		input.addEventListener('click', (event) => {
			removeItemFromChart(event, cart, itemList);
		})
	});

	//Activating the submit button behavior : when clicked, the form is sent if every field is valid
	document.querySelector("#order").addEventListener('click', (event) => {
		event.preventDefault();
		sendForm(formInputs, cart);
	});

	//Activating all input fields behavior : when updated, we check if they are valid, regarding their respective criterias
	document.querySelectorAll(".cart__order__form input").forEach(input => {
		input.addEventListener('input', (event) => {
			formInputs[event.currentTarget.getAttribute("id")] = event.currentTarget.value;
		});
	});
}

//Define the class that represents a Cart Item
class CartItem {
	constructor(id, quantity, color) {
		this.id = id;
		this.quantity = quantity;
		this.color = color;
	}
}

//Retrieve item list from the API
const getItemList = async () => {
	const itemList = fetch("http://localhost:3000/api/products")
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
		})
		.catch((err) => {
			console.log(err);
		});
	return itemList;
}

//This function loads the stored cart in the local storage and cleans it. Then, it displays it in the page
//NB: we gathered these 2 behaviours in one function given the performance cost required, to avoid looping 2 different times
const getStoredCartAndDisplay = (cart, itemList) => {
	//Initialyzation of the cart from the Local Storage, if any + preparation of the html to display
	const cartHtmlItems = document.getElementById('cart__items');
	const htmlTotalQuantity = document.getElementById('totalQuantity');
	const htmlTotalPrice = document.getElementById('totalPrice');
	let cartHtmlContent = '';
	let totalQuantity = 0;
	let totalPrice = 0;
	if (localStorage.getItem('cartItems')) {
		//Check if the JSON is correctly formatted
		try {
			const cartStored = JSON.parse(localStorage.getItem('cartItems'));
			//For each id of item in the itemList, then for each color available, we gather all corresponding entries of the cart
			for (let i = 0; i < itemList.length; i++) {
				for (let c = 0; c < itemList[i].colors.length; c++) {
					//Given the primary key id + color from the itemList (i.e. the API), we loop on the stored cart items to create them, aggregating quantities in case of duplicates
					for (let j = 0; j < cartStored.length; j++) {
						if ((Number.isInteger(cartStored[j].quantity)) && (cartStored[j].id === itemList[i]._id) && (cartStored[j].color === itemList[i].colors[c])) {
							if ((cart.length !== 0) && (cart[cart.length - 1].id === cartStored[j].id) && (cart[cart.length - 1].color === cartStored[j].color)) {
								cart[cart.length - 1].quantity += cartStored[j].quantity;
							} else {
								cart.push(new CartItem(cartStored[j].id, cartStored[j].quantity, cartStored[j].color));
							}
						}
					}
					//We get the information from the API (itemList) + from the cart, and prepare it for html only if a cart item exist
					if ((cart.length !== 0) && (cart[cart.length - 1].id === itemList[i]._id) && (cart[cart.length - 1].color === itemList[i].colors[c])) {
						cartHtmlContent += `
							<article class="cart__item" data-id="${cart[cart.length - 1].id}" data-color="${cart[cart.length - 1].color}">
								<div class="cart__item__img">
									<img src="${itemList[i].imageUrl}" alt="${itemList[i].altTxt}">
								</div>
								<div class="cart__item__content">
									<div class="cart__item__content__description">
										<h2>${itemList[i].name}</h2>
										<p>${cart[cart.length - 1].color}</p>
										<p>${itemList[i].price},00 €</p>
									</div>
									<div class="cart__item__content__settings">
										<div class="cart__item__content__settings__quantity">
											<p>Qté : </p>
											<input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${cart[cart.length - 1].quantity}">
										</div>
										<div class="cart__item__content__settings__delete">
											<p class="deleteItem">Supprimer</p>
										</div>
									</div>
								</div>
							</article>
						`;
						totalPrice += itemList[i].price * cart[cart.length - 1].quantity;
						totalQuantity += cart[cart.length - 1].quantity;
					}
				}
			}
		} catch (e) {
			console.error("Le panier stocké n'est pas valide. Il a été réinitialisé. Code d'erreur :", e);
		}
	};
	//Replaces the cart defined in the Local Storage by the cart stored in the Array "cart"
	localStorage.setItem('cartItems', JSON.stringify(cart));
	//Displays the HTML
	cartHtmlItems.insertAdjacentHTML('beforeend', cartHtmlContent);
	htmlTotalQuantity.insertAdjacentHTML('beforeend', totalQuantity);
	htmlTotalPrice.insertAdjacentHTML('beforeend', totalPrice + ',00');
}

//Retrieve the price of an item from the item List (coming from the API), given its id
const getPriceOfItem = (id, itemList) => {
	for (let i = 0; i < itemList.length; i++) {
		if (itemList[i]._id === id) {
			return itemList[i].price;
		}
	}
	console.log(`Invalid item id : ${id}`);
	return 0;
}

//This functions triggers when a quantity is updated : it identifies which item has been changed, then update the cart + the total quantities and prices
const updateCurrentQuantity = (event, cart, itemList) => {
	//Gather all item related data from HTML
	let itemQuantity = event.currentTarget.value;
	const self = event.currentTarget.closest("input");
	const id = event.currentTarget.closest("article").getAttribute("data-id");
	const color = event.currentTarget.closest("article").getAttribute("data-color");
	//Prepare the elements + variables for calculating the total quantity and price
	const htmlTotalQuantity = document.getElementById('totalQuantity');
	const htmlTotalPrice = document.getElementById('totalPrice');
	let price;
	let totalQuantity = 0;
	let totalPrice = 0;
	//Errors management on quantity written
	if (isNaN(itemQuantity) || itemQuantity < 1 || itemQuantity > 100) {
		alert(`La valeur ${itemQuantity} n'est pas autorisée. Elle doit être entre 1 et 100.`);
		itemQuantity = 1;
		self.value = itemQuantity;
	} else {
		//Cast to integer
		itemQuantity *= 1;
	};
	for (let i = 0; i < cart.length; i++) {
		if ((cart[i].id === id) && (cart[i].color === color)) {
			cart[i].quantity = itemQuantity;
		}
		price = getPriceOfItem(cart[i].id, itemList);
		totalQuantity += cart[i].quantity;
		totalPrice += price * cart[i].quantity;
	};
	htmlTotalQuantity.innerText = totalQuantity;
	htmlTotalPrice.innerText = totalPrice + ',00';
	//Replaces the cart defined in the Local Storage by the cart stored in the Array "cart"
	localStorage.setItem('cartItems', JSON.stringify(cart));
}

//This functions triggers when a button "delete" is clicked : it identifies which item has been changed, then removes it from the cart
const removeItemFromChart = (event, cart, itemList) => {
	//Gather all item related data from HTML
	const thisItemCart = event.currentTarget.closest("article");
	const id = thisItemCart.getAttribute("data-id");
	const color = thisItemCart.getAttribute("data-color");
	//Prepare the elements + variables for calculating the total quantity and price
	const htmlTotalQuantity = document.getElementById('totalQuantity');
	const htmlTotalPrice = document.getElementById('totalPrice');
	let price;
	let totalQuantity = 0;
	let totalPrice = 0;
	for (let i = 0; i < cart.length; i++) {
		if ((cart[i].id === id) && (cart[i].color === color)) {
			cart.splice(i, 1);
			thisItemCart.remove();
			//When deleted from Array Cart, the index of the next elements reduces by 1.
			//We do the same to "i" to stay aligned
			i--;
		} else {
			price = getPriceOfItem(cart[i].id, itemList);
			totalQuantity += cart[i].quantity;
			totalPrice += price * cart[i].quantity;
		};
	}
	htmlTotalQuantity.innerText = totalQuantity;
	htmlTotalPrice.innerText = totalPrice + ',00';
	//Replaces the cart defined in the Local Storage by the cart stored in the Array "cart"
	localStorage.setItem('cartItems', JSON.stringify(cart));
}

//Checks the overall validity of the form, based on the validity of all its inputs, write the error message in the form and returs the validity of the form as a boolean
const checkFormValidity = (formInputs) => {
	let isFormValid = true;
	const validityFirstNamePattern = /[0-9]/;
	const validityEmailPattern = /@/;
	//FirstName validity : it shouldn't be empty nor contain any digits
	if (validityFirstNamePattern.test(formInputs.firstName) || formInputs.firstName === "") {
		isFormValid = false;
		document.getElementById('firstNameErrorMsg').innerText = "Le prénom n'est pas valide : il ne doit pas être vide ni contenir de chiffres (0, 1, 2 ...)";
	} else {
		document.getElementById('firstNameErrorMsg').innerText = "";
	};
	//LastName validity : shouldn't be empty
	if (formInputs.lastName === "") {
		isFormValid = false;
		document.getElementById('lastNameErrorMsg').innerText = "Le nom ne peut pas être vide";
	} else {
		document.getElementById('lastNameErrorMsg').innerText = "";
	};
	//Address validity : shouldn't be empty
	if (formInputs.address === "") {
		isFormValid = false;
		document.getElementById('addressErrorMsg').innerText = "L'adresse ne peut pas être vide";
	} else {
		document.getElementById('addressErrorMsg').innerText = "";
	};
	//City validity : shouldn't be empty
	if (formInputs.city === "") {
		isFormValid = false;
		document.getElementById('cityErrorMsg').innerText = "La ville ne peut pas être vide";
	} else {
		document.getElementById('cityErrorMsg').innerText = "";
	};
	//Email validity : should contain a '@' char
	if (validityEmailPattern.test(formInputs.email)) {
		document.getElementById('emailErrorMsg').innerText = "";
	} else {
		isFormValid = false;
		document.getElementById('emailErrorMsg').innerText = "L'email n'est pas valide : il doit contenir le caractère '@'";
	};
	return isFormValid;
}

//This function calls the API to send the order given in JSON format, and returns API's response in JSON format (if successfull)
const sendOrderAPI = async (requestBody) => {
	const requestAnswer = await fetch('http://localhost:3000/api/products/order', {
		method: 'POST',
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: requestBody
	});
	if (requestAnswer.ok) {
		return requestAnswer.json();
	} else {
		console.error(`Erreur lors de l'exécution de l'API`);
	};
}


//Sends the order to the API after applying the validity checks
const sendForm = async (formInputs, cart) => {
	if (checkFormValidity(formInputs)) {
		//Formatting of API's expected body
		const productIds = [];
		for (let i = 0; i < cart.length; i++) {
			if (!(productIds[productIds.length - 1] === cart[i].id)) {
				productIds.push(cart[i].id);
			}
		};
		const requestBody = {
			contact: formInputs,
			products: productIds
		};
		//Sending to API, recovering the order id and cleaning the cart
		const requestAnswer = await sendOrderAPI(JSON.stringify(requestBody));
		const orderId = requestAnswer.orderId;
		localStorage.removeItem('cartItems');
		//Redirects to the confirmation page
		const confirmationPageUrl = window.location.origin + `/front/html/confirmation.html?orderId=${orderId}`;
		window.location = confirmationPageUrl;
	}
};

// -----------------------------------------------------------------
// --- Waiting for the DOM loading to start the main function
// -----------------------------------------------------------------
window.addEventListener('load', main)