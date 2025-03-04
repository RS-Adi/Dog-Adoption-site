let currentPage = 1; // For main search
let totalPages = 1;
let favCurrentPage = 1; // For favorites pagination
let favTotalPages = 1;
let currentFilters = {};
let favoritedDogs = [];

// Fetch all breeds and populate the breed filter
async function fetchBreeds() {
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/breeds', {
            credentials: 'include',
        });
        const breeds = await response.json();
        const breedFilter = document.getElementById('breed-filter');

        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching breeds:', error);
    }
}

// Fetch dogs based on filters and pagination
async function fetchDogs() {
    const { breed, sort } = currentFilters;
    const url = new URL('https://frontend-take-home-service.fetch.com/dogs/search');
    url.searchParams.set('size', 24);
    url.searchParams.set('from', (currentPage - 1) * 24);
    if (breed) url.searchParams.set('breeds', breed);
   url.searchParams.set('sort', 'breed:asc'); // Force sorting A-Z


    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        const data = await response.json();
        totalPages = Math.ceil(data.total / 24);
        renderDogs(data.resultIds);
        updatePagination();
    } catch (error) {
        console.error('Error fetching dogs:', error);
    }
}

// Render dog cards
async function renderDogs(dogIds) {
    const dogList = document.getElementById('dog-list');
    dogList.innerHTML = ''; // Clear previous results

    if (dogIds.length === 0) {
        dogList.innerHTML = '<p>No dogs found.</p>';
        return;
    }

    const dogsResponse = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include',
    });

    const dogs = await dogsResponse.json();

    dogs.forEach(dog => {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';
        const isFavorited = favoritedDogs.includes(dog.id);
        
        dogCard.innerHTML = `
            <img src="${dog.img}" alt="${dog.name}">
            <h3>${dog.name}</h3>
            <p>${dog.breed}, ${dog.age} years old</p>
            <button 
                data-id="${dog.id}" 
                onclick="addToFavorites('${dog.id}')"
                style="background-color: ${isFavorited ? '#dc3545' : '#4CAF50'};">
                ${isFavorited ? '💔' : '❤️'}
            </button>
        `;

        dogList.appendChild(dogCard);
    });

    updateFavoriteButtons(); // Ensure UI is updated
}

//To see if the fav dog condition
async function fetchDogsByIds(dogIds) {
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dogIds),
            credentials: 'include',
        });
        const dogs = await response.json();
        renderDogs(dogIds); // Render the favorited dogs
    } catch (error) {
        console.error('Error fetching favorited dogs:', error);
    }
}
// Update pagination buttons and page info
function updatePagination() {
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

//Function to handle the favorite dog.
// Function to toggle favorite status
function addToFavorites(dogId) {
    const index = favoritedDogs.indexOf(dogId);

    if (index === -1) {
        // If not in favorites, add it
        favoritedDogs.push(dogId);
    } else {
        // If already in favorites, remove it
        favoritedDogs.splice(index, 1);
    }

    // Refresh the favorites list if we're on that page
    if (localStorage.getItem('isFavoritesPage')) {
        fetchDogsByIds(favoritedDogs);
    }

    // Update UI immediately
    updateFavoriteButtons();
}

// Function to update favorite buttons in the UI
function updateFavoriteButtons() {
    document.querySelectorAll('.dog-card button').forEach(button => {
        const dogId = button.getAttribute('data-id');
        if (favoritedDogs.includes(dogId)) {
            button.textContent = '💔';
            button.style.backgroundColor = '#dc3545'; // Red color
        } else {
            button.textContent = '❤️';
            button.style.backgroundColor = '#4CAF50'; // Green color
        }
    });
}


//To handle the match generator
function displayMatch(dogId) {
    fetchDogsByIds([dogId]); // Fetch and display the matched dog
    alert('You’ve been matched with a dog! Check the list below.');
}

// Event listeners for filters and pagination
document.getElementById('breed-filter').addEventListener('change', (e) => {
    currentFilters.breed = e.target.value || undefined;
    currentPage = 1;
    fetchDogs();
});

document.getElementById('sort').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value || undefined;
    currentPage = 1;
    fetchDogs();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchDogs();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchDogs();
    }
});
document.getElementById('view-favorites').addEventListener('click', () => {
    if (favoritedDogs.length > 0) {
        // Store current page number and filters before navigating to favorites
        localStorage.setItem('currentPage', currentPage);
        localStorage.setItem('currentFilters', JSON.stringify(currentFilters));
        localStorage.setItem('isFavoritesPage', 'true'); // Mark that user was in favorites

        // Fetch and display favorited dogs
        fetchDogsByIds(favoritedDogs);
    } else {
        alert('You have no favorite dogs yet!');
    }
});
document.getElementById('generate-match').addEventListener('click', async () => {
    if (favoritedDogs.length > 0) {
        try {
            const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(favoritedDogs),
                credentials: 'include',
            });
            const match = await response.json();
            displayMatch(match.match); // Display the matched dog
        } catch (error) {
            console.error('Error generating match:', error);
        }
    } else {
        alert('Please favorite at least one dog to generate a match!');
    }
});

// Function to display the matched dog details
// Function to display the matched dog details and scroll to it
async function displayMatch(dogId) {
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([dogId]), // Fetch details for the matched dog
            credentials: 'include',
        });

        const matchedDog = await response.json();

        if (matchedDog.length > 0) {
            const dog = matchedDog[0]; // Get the matched dog's details
            const matchContainer = document.getElementById('matched-dog');
            const matchInfo = document.getElementById('matched-dog-info');

            // Populate the match display section
            matchInfo.innerHTML = `
                <div class="dog-card">
                    <img src="${dog.img}" alt="${dog.name}">
                    <h3>${dog.name}</h3>
                    <p><strong>Breed:</strong> ${dog.breed}</p>
                    <p><strong>Age:</strong> ${dog.age} years old</p>
                    <p><strong>Location:</strong> ZIP Code ${dog.zip_code}</p>
                </div>
            `;

            // Show the matched dog section
            matchContainer.style.display = 'block';

            // **Smooth Scroll to the Matched Dog Section**
            matchContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error('Error fetching matched dog details:', error);
    }
}
// Back button logic
document.getElementById('back-button').addEventListener('click', () => {
    // Hide back button and show favorites button
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('view-favorites').style.display = 'inline-block';

    // Restore previous search results
    fetchDogs();
});

// Modify favorites button to toggle visibility
document.getElementById('view-favorites').addEventListener('click', () => {
    if (favoritedDogs.length > 0) {
        fetchDogsByIds(favoritedDogs);
        
        // Show Back button and hide Favorites button
        document.getElementById('back-button').style.display = 'inline-block';
        document.getElementById('view-favorites').style.display = 'none';
    }
});



// Initialize the page
// Check if user came from favorites page
if (localStorage.getItem('isFavoritesPage')) {
    // Restore previous search state
    currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
    currentFilters = JSON.parse(localStorage.getItem('currentFilters')) || {};

    // Clear the flag since we're back to the search page
    localStorage.removeItem('isFavoritesPage');

    // Fetch the previous search results
    fetchDogs();
} else {
    // Default behavior: Load breeds and fetch dogs normally
    currentFilters.sort = 'breed:asc';
    fetchBreeds();
    fetchDogs();
}