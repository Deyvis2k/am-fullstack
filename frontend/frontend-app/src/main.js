import './style.css'

const api_url = "http://localhost:3333"
const session_storage = sessionStorage;

let current_page = 0;
let lastResults = [];

document.addEventListener("DOMContentLoaded", () => {
    const search = session_storage.getItem("search");
    const hasSearched = session_storage.getItem("hasSearched") === "true";

    if (search) {
        lastResults = JSON.parse(search);
    }

    if (hasSearched) {
        const lastQuery = session_storage.getItem("lastQuery") || "";
        const sortBy = session_storage.getItem("sortBy") || "relevance";
        renderResultsPage(lastQuery, sortBy);
    } else {
        renderSearchForm();
        renderLastResults();
    }
});

function getStars(rating) {
    const fullStar = '★';
    const halfStar = '⯪';
    const emptyStar = '☆';

    const rounded = Math.round(rating * 2) / 2;
    let stars = '';

    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rounded)) {
            stars += fullStar;
        } else if (i - 0.5 === rounded) {
            stars += halfStar;
        } else {
            stars += emptyStar;
        }
    }

    return stars;
}

function getNumberOfReview(review) {
    if (!review) return 0;
    
    if (review.toLowerCase().includes("best seller")) {
        return 999999;
    }
    
    return parseInt(review.replace(/[^0-9]/g, ''));
}

function getTitleEllipsized(title) {
    const maxChar = 150;
    return title.length > maxChar ? title.slice(0, maxChar) + "..." : title;
}

function getPrettyNumberOfReview(review) {
    const numberOfReview = getNumberOfReview(review);
    
    if (review && review.toLowerCase().includes("best seller")) {
        return `<p style="color: darkred; font-weight: bold; font-size: 1.2rem; text-decoration: underline">best seller</p>`;
    }
    
    if (numberOfReview === 0) {
        return `<p style="color: gray; font-weight: bold; font-size: 1.2rem">no reviews</p>`;
    }
    
    return `<p style="color: lightblue; font-weight: bold; font-size: 1.2rem">${numberOfReview.toLocaleString()} reviews</p>`;
}

function processAmazonDataForSorting(data) {
    return data.map(item => ({
        ...item,
        numericRating: parseFloat(item.rating) || 0,
        numReviews: getNumberOfReview(item.number_of_reviews)
    }));
}

function sortAmazonData(data, sortBy) {
    if (!data || data.length === 0) return [];
    
    const processedData = processAmazonDataForSorting([...data]);
    
    console.log('Sorting by:', sortBy);
    
    switch (sortBy) {
        case "numreviews":
            return processedData.sort((a, b) => {
                const aReviews = a.numReviews;
                const bReviews = b.numReviews;
                
                if (bReviews !== aReviews) {
                    return bReviews - aReviews;
                }
                return b.numericRating - a.numericRating;
            });
            
        case "rating":
            return processedData.sort((a, b) => {
                const aRating = a.numericRating;
                const bRating = b.numericRating;
                
                if (bRating !== aRating) {
                    return bRating - aRating;
                }
                return b.numReviews - a.numReviews;
            });
            
        case "price":
            return processedData.sort((a, b) => {
                const aPrice = a.price;
                const bPrice = b.price;
                
                if (bPrice !== aPrice) {
                    return bPrice - aPrice;
                }
                return b.numericRating - a.numericRating;
            });
        default:
            return processedData;
    }
}

async function renderResultsPage(search, sortBy = "relevance") {
    const app = document.querySelector("#app");

    session_storage.setItem("hasSearched", "true");
    session_storage.setItem("lastQuery", search);
    session_storage.setItem("sortBy", sortBy);

    app.innerHTML = `
        <div id="vertical-box">
            <div id="search-body">
                <h1>Amazon Scrape</h1><br>
                <p>⏳ Searching results for: ${search}...</p>
            </div>
        </div>
    `;

    const amazonData = await getAmazonData(search);
    if (!amazonData || amazonData.length === 0) {
        app.innerHTML = `
            <div id="vertical-box">
                <div id="search-body">
                    <h1>amazon scrape</h1><br>
                    <p>não foram encontrados resultados para a busca: ${search}</p>
                    <button type="submit" id="return-button">return</button>
                </div>
            </div>
        `;

        document.querySelector("#return-button").addEventListener("click", () => {
            session_storage.setItem("hasSearched", "false");
            renderSearchForm();
            renderLastResults();
        });

        return;
    }

    const sortedData = sortAmazonData(amazonData, sortBy);

    const totalSliced = Math.ceil(sortedData.length / 10);
    const sliced = [];
    for (let i = 0; i < totalSliced; i++) {
        sliced.push(sortedData.slice(i * 10, (i + 1) * 10));
    }

    app.innerHTML = `
        <div id="vertical-box">
            <div id="search-body">
                <h1>Amazon Scrape</h1><br>
                <form id="return-form">
                    <div id="horizontal_wrapper" style="display: flex; flex-direction: row; gap: 10px; align-items: center; width: 100%;">
                        <input type="text" id="search-input" placeholder="search" required>
                        <button type="submit" id="search-button">search</button>
                        <button type="submit" id="return-button">return</button>
                    </div>
                </form>
            </div>

            <div id="fetched-results">
                <div id="horizontal_wrapper" style="display: flex; flex-direction: row; align-items: center; width: 100%; text-align: center;">
                    <h2 style="flex-grow: 1;">Results</h2>
                    <div id="sorted_dropdown" style="flex-grow: 0;">
                        <label for="sort">sort by:</label>
                        <div class="custom-select">
                          <select id="sort">
                                <option value="price">price</option>
                                <option value="numreviews">reviews</option>
                                <option value="rating">rating</option>
                          </select>
                        </div>
                    </div>
                </div>

                <div id="current-page">${current_page + 1} of ${sliced.length}</div>

                ${sliced[current_page].map((product) => `
                    <a href="${product.product_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;"> 
                        <div class="result-card">
                            <img src="${product.product_image_url}" alt="${product.product_title}">
                            <div id="vertical-information">
                                <h3>${getTitleEllipsized(product.product_title)}</h3>
                                <p style="font-weight: bold; font-size: 1.2rem">$${product.price}</p>
                                <p>rating: ${getStars(product.numericRating || product.rating)} ${(product.numericRating || product.rating).toFixed(1)}</p>
                                ${getPrettyNumberOfReview(product.number_of_reviews)}
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>

            <div id="pagination">
                <button id="previous-button" ${current_page === 0 ? "disabled" : ""}>previous</button>
                <button id="next-button" ${current_page === sliced.length - 1 ? "disabled" : ""}>next</button>
            </div>
        </div>
    `;

    document.querySelector("#search-input").value = search;

    document.querySelector("#return-button").addEventListener("click", () => {
        session_storage.setItem("hasSearched", "false");
        renderSearchForm();
        renderLastResults();
    });

    document.querySelector("#previous-button").addEventListener("click", () => {
        if (current_page > 0) {
            current_page--;
            renderResultsPage(search, sortBy);
        }
    });

    document.querySelector("#next-button").addEventListener("click", () => {
        if (current_page < sliced.length - 1) {
            current_page++;
            renderResultsPage(search, sortBy);
        }
    });

    document.querySelector("#return-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const searchInput = document.querySelector("#search-input").value;
        current_page = 0;
        renderResultsPage(searchInput, sortBy);
    });

    const sortDropdown = document.querySelector("#sort");
    sortDropdown.value = sortBy;
    sortDropdown.addEventListener("change", (event) => {
        current_page = 0;
        renderResultsPage(search, event.target.value);
    });
}

async function getAmazonData(search) {
    if (!search) {
        console.log("no search term provided");
        return [];
    }
    try {
        const response = await fetch(`${api_url}/api/scrape/?q=${search}`);
        return await response.json();
    } catch (error) {
        console.log(error);
        return [];
    }
}

function renderSearchForm() {
    const app = document.querySelector("#app");
    app.innerHTML = `
        <div id="vertical-box" style="text-align: center;">
            <h1>Scrap Amazon Products</h1>
            <form id="search-form">
                <input type="text" id="search-input" placeholder="search" required/>
                <button type="submit" id="search-button">search</button>
            </form>
            <div id="last_results"></div>
        </div>
    `;

    document.querySelector("#search-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const searchInput = document.querySelector("#search-input").value;
        if (!lastResults.includes(searchInput)) lastResults.push(searchInput);
        session_storage.setItem("search", JSON.stringify(lastResults));
        session_storage.setItem("hasSearched", "true");
        session_storage.setItem("lastQuery", searchInput);
        current_page = 0;
        renderResultsPage(searchInput);
    });
}

function renderLastResults() {
    const lastResultsDiv = document.querySelector("#last_results");
    if (!lastResultsDiv) return;

    if (lastResults.length === 0) {
        lastResultsDiv.innerHTML = "<p>nenhuma busca anterior.</p>";
        return;
    }

    lastResultsDiv.innerHTML += lastResults.map((result) => `
        <div class="card">
            <button type="button" class="last-results-button">${result}</button>
        </div>
    `).join('');

    lastResultsDiv.querySelectorAll(".last-results-button").forEach((button) => {
        button.addEventListener("click", () => {
            current_page = 0;
            renderResultsPage(button.textContent);
        });
    });
}
