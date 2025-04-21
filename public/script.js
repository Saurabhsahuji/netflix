function showAlert(action) {
    alert(`${action} functionality is not implemented in this demo.`);
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fetch movies from backend
async function fetchMovies() {
    try {
        // Fetch trending movies
        const trendingResponse = await fetch('http://localhost:3000/api/movies/trending');
        if (!trendingResponse.ok) throw new Error('Failed to fetch trending movies');
        const trendingMovies = await trendingResponse.json();
        const trendingGrid = document.getElementById('trending-now');
        trendingGrid.innerHTML = trendingMovies.map(movie => `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="overlay"><p>${movie.title}</p></div>
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${movie.id}, '${movie.title}')">
                    ${isFavorite(movie.id) ? 'Remove Favorite' : 'Add Favorite'}
                </button>
            </div>
        `).join('');

        // Fetch continue watching movies
        const continueResponse = await fetch('http://localhost:3000/api/movies/continue');
        if (!continueResponse.ok) throw new Error('Failed to fetch continue watching movies');
        const continueMovies = await continueResponse.json();
        const continueGrid = document.getElementById('continue-watching');
        continueGrid.innerHTML = continueMovies.map(movie => `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="overlay"><p>${movie.title}</p></div>
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${movie.id}, '${movie.title}')">
                    ${isFavorite(movie.id) ? 'Remove Favorite' : 'Add Favorite'}
                </button>
            </div>
        `).join('');

        // Fetch favorites
        await fetchFavorites();
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Search movies
async function searchMovies() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    try {
        const response = await fetch(`http://localhost:3000/api/movies/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const movies = await response.json();
        const trendingGrid = document.getElementById('trending-now');
        trendingGrid.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="overlay"><p>${movie.title}</p></div>
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${movie.id}, '${movie.title}')">
                    ${isFavorite(movie.id) ? 'Remove Favorite' : 'Add Favorite'}
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

// Favorites management (client-side)
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function isFavorite(movieId) {
    return favorites.includes(movieId);
}

async function toggleFavorite(movieId, title) {
    try {
        if (isFavorite(movieId)) {
            // Remove from favorites
            await fetch(`http://localhost:3000/api/favorites/${movieId}`, { method: 'DELETE' });
            favorites = favorites.filter(id => id !== movieId);
        } else {
            // Add to favorites
            await fetch('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieId, title })
            });
            favorites.push(movieId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        await fetchFavorites();
        fetchMovies(); // Refresh grids to update button text
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

async function fetchFavorites() {
    try {
        const response = await fetch('http://localhost:3000/api/favorites');
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favoriteMovies = await response.json();
        const favoritesGrid = document.getElementById('favorites');
        favoritesGrid.innerHTML = favoriteMovies.map(movie => `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="overlay"><p>${movie.title}</p></div>
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${movie.id}, '${movie.title}')">
                    Remove Favorite
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

// Movie details modal
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        const movie = await response.json();
        const modal = document.getElementById('movie-modal');
        document.getElementById('modal-title').textContent = movie.title;
        document.getElementById('modal-poster').src = movie.poster;
        document.getElementById('modal-description').textContent = movie.description || 'No description available.';
        document.getElementById('modal-genre').textContent = `Genre: ${movie.genre || 'Unknown'}`;
        const favoriteBtn = document.getElementById('modal-favorite-btn');
        favoriteBtn.textContent = isFavorite(movieId) ? 'Remove Favorite' : 'Add to Favorites';
        favoriteBtn.onclick = () => toggleFavoriteFromModal(movieId, movie.title);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

function toggleFavoriteFromModal(movieId, title) {
    toggleFavorite(movieId, title);
    const favoriteBtn = document.getElementById('modal-favorite-btn');
    favoriteBtn.textContent = isFavorite(movieId) ? 'Remove Favorite' : 'Add to Favorites';
}

function closeModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

// Load movies when the page loads
window.addEventListener('DOMContentLoaded', fetchMovies);