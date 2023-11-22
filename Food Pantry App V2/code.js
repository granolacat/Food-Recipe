// Hold the API URL which will be used to fetch data
let API = "https://www.themealdb.com/api/json/v1/1/";

let app = document.querySelector(".app");

// Hold references to the main screen and recipe screen elements
let screen = {
  main: app.querySelector(".main-screen"),
  recipe: app.querySelector(".recipe-screen")
};

// Hold references to the search input and search button elements
let search = {
  input: app.querySelector(".search-input"),
  btn: app.querySelector(".search-btn")
};

(async function () {
  // Manually create the meal categories array
  let categories = ["Beef", "Chicken", "Goat", "Lamb", "Pasta", "Pork", "Tomato", "Eggs"];
  
  // Loop through each category and create a clickable element for it
  for (let i = 0; i < categories.length; i++) {
    let div = document.createElement("div");
    // Add an image element to the category element and set its source attribute
    let img = document.createElement("img");
    img.src = "food/" + categories[i] + ".png";
    div.appendChild(img);

    // Add an event listener to each category element that will activate it when clicked
    div.addEventListener("click", function () {
      // Remove the active class from the previously active category element
      let activeCategory = screen.main.querySelector(".categories .active");
      if (activeCategory) {
        activeCategory.classList.remove("active");
      }

      // Add the active class to the clicked category element
      div.classList.add("active");

      // Retrieve the recipes for the clicked category
      getRecipesOfCategory(categories[i], search.input.value.trim());
    });

    // Set the first category element to be active and retrieves its recipes
    if (i == 0) {
      div.classList.add("active");
      getRecipesOfCategory(categories[i]);
    }
    // Add the category element to the app
    screen.main.querySelector(".categories").appendChild(div);
  }

  // Add event listener to the search button
  search.btn.addEventListener("click", function () {
    let query = search.input.value.trim();
    if (query.length > 0) {
      searchRecipes(query);
    }
  });
})();





async function getRecipesOfCategory(category) {
   // Clear the recipe list before retrieving new recipes
  screen.main.querySelector(".recipe-list").innerHTML = "";
  try {
    // Build the API URL for fetching the recipes data
    let url = API + "filter.php?c=" + category;
    // Modify the API URL to include recipes that have tomatoes or eggs as ingredients - scuffed
    if (category === 'Tomato' || category === 'Eggs') {
      url = API + "filter.php?i=" + category;
    }
    // Fetch the recipes data for the given category and ingredient from the API
    let res = await fetch(url);
    let data = await res.json();
    let recipes = data.meals;
    // Loop through each recipe and create a clickable element for it
    for (let i = 0; i < recipes.length; i++) {
      let div = document.createElement("div");
      div.classList.add("item");
      // Add an event listener to each recipe element that will display its full details when clicked
      div.addEventListener("click", function () {
        showFullRecipe(recipes[i].idMeal);
      });
      // Set the content for the recipe element
      div.innerHTML = `
        <div class="thumbnail">
          <img src="${recipes[i].strMealThumb}"/>
        </div>
        <div class="details">
          <h2>${recipes[i].strMeal}</h2>
        </div>
      `;
      // Add the recipe element to the recipe list
      screen.main.querySelector(".recipe-list").appendChild(div);
    }
  } catch (msg) { }
}

async function showFullRecipe(recipeId){
	// Hide the main screen and shows the recipe screen
	screen.main.classList.add("hidden");
	screen.recipe.classList.remove("hidden");
	// Add an event listener to the back button that will return the user to the main screen and reset the recipe screen
	screen.recipe.querySelector(".back-btn").addEventListener("click",function(){
		screen.recipe.classList.add("hidden");
		screen.main.classList.remove("hidden");
		screen.recipe.querySelector(".thumbnail img").src= "";
		screen.recipe.querySelector(".details h2").innerText = "";
		screen.recipe.querySelector(".details ul").innerHTML = "";
		screen.recipe.querySelector(".details ol").innerHTML = "";
	});
	try {
		// Fetch the recipe details from the API using the recipe ID
		let res = await fetch(API + "lookup.php?i="+recipeId);
		let data = await res.json();
		let recipe = data.meals[0];
		// Update the recipe screen with the details for the selected recipe
		screen.recipe.querySelector(".thumbnail img").src = recipe.strMealThumb;
		screen.recipe.querySelector(".details h2").innerText = recipe.strMeal;

		// Loop through the ingredients and measurements for the recipe and adds them to a list
		for (let i=1;i<=20;i++){
			if (recipe["strIngredient"+i].length == 0){
				break;
			}
			let li = document.createElement("li");
			li.innerText = recipe["strIngredient"+i] + " - " + recipe["strMeasure" + i];
			screen.recipe.querySelector(".details ul").appendChild(li);
		}
		// Split the instructions for the recipe into a list and adds them to a separate list on the recipe screen
		let instructions = recipe.strInstructions.split("\r\n").filter(v => v);
		for (let i=0;i<instructions.length;i++){
			let li = document.createElement("li");
			li.innerText = instructions[i];
			screen.recipe.querySelector(".details ol").appendChild(li);
		}
	} catch(msg){}
}

async function searchRecipes(query) {
  // Clear the recipe list before retrieving new recipes
  screen.main.querySelector(".recipe-list").innerHTML = "";
  try {
    // Fetch the recipes data for the given query from the API
    let res = await fetch(API + "search.php?s=" + query);
    let data = await res.json();
    let recipes = data.meals;

    // Fetch the recipes data for the given query from the API by ingredient
    let resByIngredient = await fetch(API + "filter.php?i=" + query);
    let dataByIngredient = await resByIngredient.json();
    let recipesByIngredient = dataByIngredient.meals;

    // Merge the two arrays of recipes
    let allRecipes = recipes.concat(recipesByIngredient);

    // Loop through each recipe and creates a clickable element for it
    for (let i = 0; i < allRecipes.length; i++) {
      let div = document.createElement("div");
      div.classList.add("item");
      // Add an event listener to each recipe element that will display its full details when clicked
      div.addEventListener("click", function () {
        showFullRecipe(allRecipes[i].idMeal);
      });
      // Set the content for the recipe element
      div.innerHTML = `
				<div class="thumbnail">
					<img src="${allRecipes[i].strMealThumb}"/>
				</div>
				<div class="details">
					<h2>${allRecipes[i].strMeal}</h2>
				</div>
			`;
      // Add the recipe element to the recipe list
      screen.main.querySelector(".recipe-list").appendChild(div);
    }
  } catch (msg) {}
}
