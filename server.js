const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Load movies with error handling
let movies = [];
try {
    movies = require('./movies.json');
} catch (error) {
    console.error('Error loading movies.json:', error);
}

// In-memory favorites (replace with database in production)
let favorites = [];

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/movies/trending', (req, res) => {
    try {
        const trending = movies.filter(movie => movie.category === 'trending');
        res.json(trending);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

app.get('/api/movies/continue', (req, res) => {
    try {
        const continueWatching = movies.filter(movie => movie.category === 'continue');
        res.json(continueWatching);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch continue watching movies' });
    }
});

app.get('/api/movies/:id', (req, res) => {
    try {
        const movie = movies.find(movie => movie.id === parseInt(req.params.id));
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

app.get('/api/movies/search', (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toLowerCase() : '';
        if (!query) {
            return res.json(movies);
        }
        const results = movies.filter(movie => movie.title.toLowerCase().includes(query));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

app.get('/api/favorites', (req, res) => {
    try {
        const favoriteMovies = favorites.map(fav => {
            const movie = movies.find(m => m.id === fav.movieId);
            return movie ? { ...movie, title: fav.title } : null;
        }).filter(Boolean);
        res.json(favoriteMovies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

app.post('/api/favorites', (req, res) => {
    try {
        const { movieId, title } = req.body;
        if (!movieId || !title) {
            return res.status(400).json({ error: 'Movie ID and title required' });
        }
        if (!favorites.find(fav => fav.movieId === movieId)) {
            favorites.push({ movieId: parseInt(movieId), title });
        }
        res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

app.delete('/api/favorites/:id', (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        favorites = favorites.filter(fav => fav.movieId !== movieId);
        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});