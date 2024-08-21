document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";

    const fetchMovies = async (category, callback) => {
        let url = `${API_URL}titles/?sort_by=-imdb_score&page_size=40`;
        if (category) {
            url += `&genre=${category}`;
        }
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.results) {
                const filteredResults = excludeMovie(data.results, "Ramayana: The Legend of Prince Rama");
                callback(filteredResults);
            } else {
                console.error("No results found in the API response");
                callback([]);
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            callback([]);
        }
    };

    const fetchBestMovie = async () => {
        try {
            const response = await fetch(`${API_URL}titles/?sort_by=-imdb_score&page_size=1`);
            const data = await response.json();
            if (data && data.results && data.results.length > 0) {
                return data.results[0];
            } else {
                console.error("No best movie found in the API response");
                return null;
            }
        } catch (error) {
            console.error("Error fetching the best movie:", error);
            return null;
        }
    };

    const fetchMovieDetails = async (id) => {
        try {
            const response = await fetch(`${API_URL}titles/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching details for movie ID ${id}:`, error);
            return null;
        }
    };

    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        const defaultImageUrl = "{% static 'images/default-movie.png' %}";

        movieElement.innerHTML = `
            <img src="${movie.image_url || defaultImageUrl}" alt="${movie.title || 'No Title'}" onerror="this.src='${defaultImageUrl}'" />
            <p class="movie-title">${movie.title || 'No Title'}</p>`;

        if (movie.id) {
            movieElement.addEventListener("click", () => showModal(movie.id));
        }

        return movieElement;
    };

    const showModal = async (id) => {
        const movie = await fetchMovieDetails(id);
        if (movie) {
            const modal = document.getElementById("modal");
            const modalDetails = document.getElementById("modal-details");

            const defaultImageUrl = "{% static 'images/default-movie.png' %}";

            modalDetails.innerHTML = `
                <div class="modal-header">
                    <h2>${movie.title || 'No Title'}</h2>
                </div>
                <div class="modal-body">
                    <div class="left-column">
                        <img src="${movie.image_url || defaultImageUrl}" alt="${movie.title || 'No Title'}" onerror="this.src='${defaultImageUrl}'" />
                        <p>${movie.description || 'No Description available'}</p>
                    </div>
                    <div class="right-column">
                        <ul>
                            <li><strong>Genre: </strong> ${movie.genres ? movie.genres.join(", ") : 'N/A'}</li>
                            <li><strong>Date de sortie: </strong> ${movie.date_published || 'N/A'}</li>
                            <li><strong>Rated: </strong> ${movie.rated || 'N/A'}</li>
                            <li><strong>Score Imdb: </strong> ${movie.imdb_score || 'N/A'}</li>
                            <li><strong>Réalisateur: </strong> ${movie.directors ? movie.directors.join(", ") : 'N/A'}</li>
                            <li><strong>Acteurs: </strong> ${movie.actors ? movie.actors.join(", ") : 'N/A'}</li>
                            <li><strong>Durée: </strong> ${movie.duration || 'N/A'} minutes</li>
                            <li><strong>Pays d'origine: </strong> ${movie.countries ? movie.countries.join(", ") : 'N/A'}</li>
                            <li><strong>Box Office: </strong> ${movie.worldwide_gross_income || 'N/A'}</li>
                        </ul>
                    </div>
                </div>
            `;
            modal.style.display = "block";
        } else {
            console.error("Movie details could not be retrieved for modal.");
        }
    };

    const closeModal = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };

    document.querySelector(".close").addEventListener("click", closeModal);
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("modal");
        if (event.target === modal) {
            closeModal();
        }
    });

    const slideMovies = (containerId, direction) => {
        const container = document.getElementById(containerId);
        const movies = container.querySelectorAll(".movie");
        const firstVisibleIndex = parseInt(container.getAttribute("data-first-index"), 10) || 0;
        const totalMovies = movies.length;
        let newFirstVisibleIndex;

        if (direction === "right") {
            newFirstVisibleIndex = (firstVisibleIndex + 7) % totalMovies;
        } else {
            newFirstVisibleIndex = (firstVisibleIndex - 7 + totalMovies) % totalMovies;
        }

        container.setAttribute("data-first-index", newFirstVisibleIndex);

        movies.forEach((movie, index) => {
            movie.style.display = (index >= newFirstVisibleIndex && index < newFirstVisibleIndex + 7) ? "block" : "none";
        });
    };

    const setupScrollButtons = () => {
        document.getElementById("scroll-left-top-rated").addEventListener("click", () => slideMovies("top-rated-movies", "left"));
        document.getElementById("scroll-right-top-rated").addEventListener("click", () => slideMovies("top-rated-movies", "right"));
        document.getElementById("scroll-left-category1").addEventListener("click", () => slideMovies("category1-movies", "left"));
        document.getElementById("scroll-right-category1").addEventListener("click", () => slideMovies("category1-movies", "right"));
        document.getElementById("scroll-left-category2").addEventListener("click", () => slideMovies("category2-movies", "left"));
        document.getElementById("scroll-right-category2").addEventListener("click", () => slideMovies("category2-movies", "right"));
        document.getElementById("scroll-left-category3").addEventListener("click", () => slideMovies("category3-movies", "left"));
        document.getElementById("scroll-right-category3").addEventListener("click", () => slideMovies("category3-movies", "right"));
    };

    const excludeMovie = (movies, title) => {
        return movies.filter(movie => movie.title !== title);
    };

    const loadMovies = async () => {
        const bestMovie = await fetchBestMovie();
        if (bestMovie && bestMovie.id) {
            const bestMovieDetails = await fetchMovieDetails(bestMovie.id);
            if (bestMovieDetails) {
                const bestMovieSection = document.getElementById("best-movie-image");
                bestMovieSection.style.backgroundImage = `url(${bestMovieDetails.image_url})`;

                document.getElementById("best-movie-title").innerText = bestMovieDetails.title;
                document.getElementById("best-movie-summary").innerText = bestMovieDetails.description;
                document.getElementById("more-info-button").addEventListener("click", () => showModal(bestMovieDetails.id));
            }
        } else {
            console.error("Best movie data is not available or invalid.");
        }

        fetchMovies(null, (movies) => {
            const section = document.getElementById("top-rated-movies");
            section.setAttribute("data-first-index", "0");
            movies.forEach(movie => section.appendChild(createMovieElement(movie)));
            slideMovies("top-rated-movies", "right");
        });

        const categories = ["Adventure", "Animation", "Biography"];
        const sections = ["category1-movies", "category2-movies", "category3-movies"];

        categories.forEach((category, index) => {
            fetchMovies(category, (movies) => {
                const section = document.getElementById(sections[index]);
                section.setAttribute("data-first-index", "0");
                movies.forEach(movie => section.appendChild(createMovieElement(movie)));
                slideMovies(sections[index], "right");
            });
        });

        setupScrollButtons();
    };

    const scrollDownIndicator = document.getElementById("scroll-down-indicator");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
            scrollDownIndicator.style.display = "none";
        } else {
            scrollDownIndicator.style.display = "block";
        }
    });

    scrollDownIndicator.addEventListener("click", () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });

    loadMovies();
});
