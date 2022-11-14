//Main function to load when the html loads
async function main() {
	const itemList = await getItemList();
	displayAllItems(itemList);
}

main();

//List all usable functions below.
//Retrieve item list from the API
async function getItemList() {
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

//Display all items by looping on the function displayGivenItem that displays one given item
async function displayAllItems(itemArray) {
	const itemHtmlCards = document.getElementById('items');
	for (let i = 0; i < itemArray.length; i++) {
		displayGivenItem(itemHtmlCards, itemArray[i]);
	}
}

//Display a given item by creating the html content of its card, from an item object at API product format
async function displayGivenItem(itemHtmlCards, item) {
	var itemHtmlCardContent = "<a href=\"./product.html?id="
		+ item._id
		+ "\"><article><img src=\""
		+ item.imageUrl
		+ "\" alt=\""
		+ item.altTxt
		+ "\"><h3 class=\"productName\">"
		+ item.name
		+ "</h3><p class=\"productDescription\">"
		+ item.description
		+ "</p></article></a>";
	itemHtmlCards.innerHTML += itemHtmlCardContent;
}