//Main function to load when the html loads
const main = async () => {
	const itemList = await getItemList();
	displayAllItems(itemList);
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

//Display all items by looping on them to create the full html content
const displayAllItems = async (itemArray) => {
	const itemHtmlCards = document.getElementById('items');
	let itemHtmlContent = '';
	for (let i = 0; i < itemArray.length; i++) {
		itemHtmlContent += `
		<a href="./product.html?id=${itemArray[i]._id}">
			<article>
				<img src="${itemArray[i].imageUrl}" alt="${itemArray[i].altTxt}">
				<h3 class="productName">${itemArray[i].name}</h3>
				<p class="productDescription">${itemArray[i].description}</p>
			</article>
		</a>`;
	}
	itemHtmlCards.insertAdjacentHTML('beforeend', itemHtmlContent);
}

// -----------------------------------------------------------------
// --- Waiting for the DOM loading to start the main function
// -----------------------------------------------------------------
window.addEventListener('load', main)