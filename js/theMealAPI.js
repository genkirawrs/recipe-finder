const deviceMedia = window.matchMedia("(min-width: 600px)");
let defaultMaxResults = 10;

    if(deviceMedia.matches){
        defaultMaxResults = 9;
    }


function scrollToTop(){
    $("html, body").animate({ scrollTop: 0 }, "fast");
}

function formatFetchUrl(searchType){
    const apiKey = '9973533';
    const url = 'https://www.themealdb.com/api/json/v2/';
    const urlPaths = {
        recent: '/latest.php',
        by_name: '/search.php?s=',
        by_id: '/lookup.php?i=',
        random: '/random.php',
        type_list: '/list.php?c=list',
        type: '/filter.php?c=',
        ingredients: '/filter.php?i='
    }
    return `${url}${apiKey}${urlPaths[searchType]}`;
}

//these functions will format search parameters and then pass it along to the contact function
function getRecentRecipes(qty=defaultMaxResults){
    //retrieves specified number of most recent recipes
    const url = formatFetchUrl('recent');

    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        if(responseJson.meals.length > 0){
            let count = 0;
            const meals = responseJson.meals;
            while(count < qty){
                $('#recipes-list').append(`
                <div class="recipe-grid-square" id="recipe-${meals[count]['idMeal']}">
                    <a href="javascript:loadFullRecipe(${meals[count]['idMeal']})">
                    <img src="${meals[count]['strMealThumb']}" alt="Image of ${meals[count]['strMeal']}" title="${meals[count]['strMeal']}" class="recipe-grid-img">
                    <br>
                    <p>${meals[count]['strMeal']}</p>
                    </a>
                </div>
                `);
                count++;
            }
        }
    })
    .catch(error => {
        //$('#search-progress').text(`Sorry, there was an error: ${error.message}`);
    });
}

function searchByRecipeID(recipeID){
    //retrieve recipe by ID
    let url = formatFetchUrl('by_id');
        url = `${url}${recipeID}`;

    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        scrollToTop();
        const mealDetails = formatRecipeDetails(responseJson.meals[0]);
        const recipeHTML = formatRecipeDisplay(mealDetails);
        $('#full-recipe').html("");
        $('#full-recipe').append(`<div id="recipe-progress"><div class="return-btn"><button class="search_return_btn" onclick="backToSearchResults()">Back to Search Results</button></div></div>`);
        $('#full-recipe').append(recipeHTML);
        $('#recipes-list').hide()
        $('#simple-search-form').hide();
        $('#full-recipe').show();
        getYouTubeVideos(mealDetails.name, mealDetails.video);
    })
    .catch(error => {
        scrollToTop();
        $('#full-recipe').html('Sorry, there was an error looking up this recipe. Please try again later.');
        $('#recipes-list').hide()
        $('#simple-search-form').hide();
        $('#full-recipe').show();

    });

}

function getRandomRecipe(){
    //retrieve a random recipe
    const url = formatFetchUrl('random');
        
    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        scrollToTop();
        const mealDetails = formatRecipeDetails(responseJson.meals[0]);
        const recipeHTML = formatRecipeDisplay(mealDetails);

        $('#random-result').html(recipeHTML);
        getYouTubeVideos(mealDetails.name, mealDetails.video);

    })
    .catch(error => {
        $('#random-result').html('Sorry there was an error, please try again later.');
    });

}

function getRecipeTypeList(){
    //retrieve list of recipe categories
    const url = formatFetchUrl('type_list');
        
    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        let categoriesHTML = "";
        $.each(responseJson.meals, function(){
            let cat = this.strCategory;
            categoriesHTML = `${categoriesHTML}<button onclick="getRecipeType('${cat}')">${cat}</button>`;
        });
        $('#recipe-categories').html(categoriesHTML);
        $('#type-search').show();
    })
    .catch(error => {
        $('#recipe-categories').html("Sorry, there wasn an error. Please try again later.");
        $('#type-search').show();
    });

}

function getRecipeType(type){
    //retrieve recipes within a category
    let url = formatFetchUrl('type');
        url = `${url}${type}`;
    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        scrollToTop();
        $('#recipes-list').html("");
        $('#recipes-list').append(`<h3 id="search-progress">Your Search Results:</h3>`);
        let count = 0;
        const meals = responseJson.meals;
        while(count < meals.length){
            if( count >= responseJson.meals.length){
                break;
            }
            $('#recipes-list').append(`
            <div class="recipe-grid-square" id="recipe-${meals[count]['idMeal']}">
                <a href="javascript:loadFullRecipe(${meals[count]['idMeal']})">
                <img src="${meals[count]['strMealThumb']}" alt="Image of ${meals[count]['strMeal']}" title="${meals[count]['strMeal']}" class="recipe-grid-img">
                <br>
                ${meals[count]['strMeal']}   
                </a>
            </div>
            `);
            count++;
        }
    })
    .catch(error => {
        scrollToTop();
        $('#search-progress').text(`Sorry, there was an error. Please try again later.`);
    });

}

function searchRecipe(phrase,qty){
    //retrieve a recipes by search terms
    let url = formatFetchUrl('by_name');
        url = `${url}${phrase}`;
    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        if(responseJson.meals.length > 0){
            scrollToTop();
            $('#recipes-list').html("");
            $('#recipes-list').append(`<h3 id="search-progress">Your Search Results:</h3>`);
            
            let count = 0;
            const meals = responseJson.meals;
            while(count < qty){
                if( count >= responseJson.meals.length){
                    break;
                }
                $('#recipes-list').append(`
                <div class="recipe-grid-square" id="recipe-${meals[count]['idMeal']}">
                    <a href="javascript:loadFullRecipe(${meals[count]['idMeal']})">
                    <img src="${meals[count]['strMealThumb']}" alt="Image of ${meals[count]['strMeal']}" title="${meals[count]['strMeal']}" class="recipe-grid-img">
                    <br>
                    ${meals[count]['strMeal']}   
                    </a>
                </div>
                `);
                count++;
            }

            if(count < qty){
                searchByIngredients(phrase,qty,count);
            }
        }

    })
    .catch(error => {
        searchByIngredients(phrase,qty,0);
        //$('#search-progress').text(`Sorry, there was an error: ${error.message}`);
    });
    
}

function searchByIngredients(ingredients,qty,searchFiller=0){
    //retrieve recipe based on ingredients
    let url = formatFetchUrl('ingredients');
        url = `${url}${ingredients}`;
    
    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error();
    })
    .then(responseJson => {
        console.log(responseJson.meals);
        console.log(searchFiller);
        if(responseJson.meals == null && searchFiller == 0){
            console.log("Test");
            throw new Error();
        }
        if(searchFiller){
            scrollToTop();
            let count = searchFiller;
            const meals = responseJson.meals;
            while(count < qty){
                if( count >= responseJson.meals.length){
                    break;
                }
                $('#search-progress').text('Your Search Results:');
                $('#recipes-list').append(`
                <div class="recipe-grid-square" id="recipe-${meals[count]['idMeal']}">
                    <a href="javascript:loadFullRecipe(${meals[count]['idMeal']})">
                    <img src="${meals[count]['strMealThumb']}" alt="Image of ${meals[count]['strMeal']}" title="${meals[count]['strMeal']}" class="recipe-grid-img">
                    <br>
                    ${meals[count]['strMeal']}   
                    </a>
                </div>
                `);
                count++;
            }

        }else{
            scrollToTop();
            $('#recipes-list').html("");
            $('#recipes-list').append(`<h3 id="search-progress">Your Search Results:</h3>`);
            let count = 0;
            const meals = responseJson.meals;
            while(count < qty){
                if( count >= responseJson.meals.length){
                    break;
                }
                $('#recipes-list').append(`
                <div class="recipe-grid-square" id="recipe-${meals[count]['idMeal']}">
                    <a href="javascript:loadFullRecipe(${meals[count]['idMeal']})">
                    <img src="${meals[count]['strMealThumb']}" alt="Image of ${meals[count]['strMeal']}" title="${meals[count]['strMeal']}" class="recipe-grid-img">
                    <br>
                    ${meals[count]['strMeal']}   
                    </a>
                </div>
                `);
                count++;
            }
        }
    })
    .catch(error => {
        if(searchFiller > 0){
            
        }else{
            $('#search-progress').text(`Sorry, no recipes found. Please try another search!`);
        }
    });
}


//functions that format input/returned values
function formatRecipeSearch(parameters,type){
    const paramString = parameters.split(' ').join(',');
    return paramString;
}

function formatRecipeDetails(recipe){
    //receives an object and returns something we can use for display
    let meal = {
        id: recipe.idMeal,
        name: recipe.strMeal,
        img: recipe.strMealThumb,
        ingredients: [],
        instructions: [],
        video: recipe.strYoutube.split("v=").pop()
    };

    let ingredientsList = [];
    let mealInstructions = recipe.strInstructions;


    for (let key of Object.keys(recipe)) {
        if (key.startsWith('strIngredient') && (recipe[key] != null && recipe[key].length > 0) ) {
            const lineItem = key.split("Ingredient").pop();
            const measurement = `strMeasure${lineItem}`;
            const ingredientLine = `${recipe[key]} - ${recipe[measurement]}`;
            
            ingredientsList.push(ingredientLine);
        }
      }

    meal.ingredients = ingredientsList;
    meal.instructions = mealInstructions.replace(/(\r\n|\r|\n)(\r\n|\r|\n)/g, "LINEBREAK").split('LINEBREAK');

      return meal;
}

function loadFullRecipe(mealId){
    searchByRecipeID(mealId);
}

function formatRecipeDisplay(mealDetails){
    let ingredientsHTML = ""
    $.each(mealDetails.ingredients, function(){
        const list = this;
        ingredientsHTML = `${ingredientsHTML}<li>${list}</li>`;
    });

    let instructionsHTML = "";
    $.each(mealDetails.instructions, function(){
        const list = this;
        if(list.length > 2){
            instructionsHTML = `${instructionsHTML}<li>${list}</li>`;
        }
    });

    const returnHTML = `
    <section class="full-recipe-panel">
        <section class="full-recipe-img">
            <img src="${mealDetails.img}" alt="${mealDetails.name} image" title="${mealDetails.name} image">
            <br>
            <a href="printable.html?recipe=${mealDetails.id}" alt="Open new page to print recipe" target="_blank">print recipe</a>
            <br>
            <a href="printable.html?grocery=${mealDetails.id}" alt="Open new page to print recipe shopping list" target="_blank">grocery list</a>
        </section>
        <section class="full-recipe-name"><h2>${mealDetails.name}</h2></section>
        <section class="full-recipe-ingredients">
        <h3>Ingredients:</h3>
        <ul>${ingredientsHTML}</ul>
        </section>
        <section class="full-recipe-instructions">
        <h3>Instructions:</h3>
        <ul>${instructionsHTML}</ul>
        </section>
        <section id="recipe-videos">
            <h3>More on this recipe:</h3>
                <section id="video-player">
                    <iframe id="playable-video" src="https://www.youtube.com/embed/${mealDetails.video}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </section>
                <section id="more-videos">
                <ul id="video-thumbs"></ul>
                </section>
        </section>
    </section>
    `;

    return returnHTML;
}

function loadSearchByType(){
    $('#simple-form').hide();
    getRecipeTypeList();
}

function loadSearchForm(){
    $('#type-search').hide();
    $('#simple-form').show();
    $('#recipe-categories').html('');

}

function backToSearchResults() {
    scrollToTop();
    $('#recipes-list').show()
    $('#simple-search-form').show();
    $('#full-recipe').hide();
    $('#search-progress').html('');

}