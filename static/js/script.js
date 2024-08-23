// Ajoute un écouteur d'événements pour exécuter le code lorsque le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";  // URL de base de l'API

    /**
     * Récupère une liste de films depuis l'API, éventuellement filtrée par catégorie.
     * @param {string} category - La catégorie de films à récupérer (optionnel).
     * @param {function} callback - Fonction de rappel pour traiter les résultats filtrés.
     */
    const fetchMovies = async (category, callback) => {
        let url = `${API_URL}titles/?sort_by=-imdb_score&page_size=40`;
        if (category) {
            url += `&genre=${category}`;
        }
        try {
            const response = await fetch(url);  // Effectue une requête à l'API
            const data = await response.json();  // Convertit la réponse en JSON
            if (data && data.results) {
                // Exclut un film spécifique et exécute le callback avec les résultats filtrés
                const filteredResults = excludeMovie(data.results, "Ramayana: The Legend of Prince Rama");
                callback(filteredResults);
            } else {
                console.error("No results found in the API response");
                callback([]);  // Exécute le callback avec une liste vide en cas d'erreur
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            callback([]);  // Exécute le callback avec une liste vide en cas d'erreur
        }
    };

    /**
     * Récupère le meilleur film (celui avec le score IMDb le plus élevé).
     * @returns {object|null} Le film ayant le meilleur score IMDb ou null en cas d'erreur.
     */
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

    /**
     * Récupère les détails d'un film spécifique via son ID.
     * @param {number} id - L'identifiant du film.
     * @returns {object|null} Les détails du film ou null en cas d'erreur.
     */
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

    /**
     * Crée un élément HTML représentant un film.
     * @param {object} movie - L'objet contenant les informations du film.
     * @returns {HTMLElement} L'élément HTML créé pour le film.
     */
    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        const defaultImageUrl = "{% static 'images/default-movie.png' %}";  // Image par défaut

        movieElement.innerHTML = `
            <img src="${movie.image_url || defaultImageUrl}" alt="${movie.title || 'No Title'}" onerror="this.src='${defaultImageUrl}'" />
            <p class="movie-title">${movie.title || 'No Title'}</p>`;

        if (movie.id) {
            movieElement.addEventListener("click", () => showModal(movie.id));  // Ajoute un événement de clic pour afficher les détails du film
        }

        return movieElement;
    };

    /**
     * Affiche une fenêtre modale avec les détails d'un film.
     * @param {number} id - L'identifiant du film.
     */
    const showModal = async (id) => {
        const movie = await fetchMovieDetails(id);  // Récupère les détails du film
        if (movie) {
            const modal = document.getElementById("modal");
            const modalDetails = document.getElementById("modal-details");

            const defaultImageUrl = "{% static 'images/default-movie.png' %}";  // Image par défaut

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
            modal.style.display = "block";  // Affiche la fenêtre modale
        } else {
            console.error("Movie details could not be retrieved for modal.");
        }
    };

    /**
     * Ferme la fenêtre modale.
     */
    const closeModal = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };

    // Ajoute des écouteurs d'événements pour fermer la modale
    document.querySelector(".close").addEventListener("click", closeModal);
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("modal");
        if (event.target === modal) {
            closeModal();
        }
    });

    /**
     * Gère le défilement des films dans un conteneur.
     * @param {string} containerId - L'identifiant du conteneur de films.
     * @param {string} direction - La direction du défilement ("left" ou "right").
     */
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

    /**
     * Configure les boutons de défilement pour les conteneurs de films.
     */
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

    /**
     * Exclut un film spécifique d'une liste de films.
     * @param {Array} movies - Liste des films.
     * @param {string} title - Titre du film à exclure.
     * @returns {Array} Liste des films filtrée.
     */
    const excludeMovie = (movies, title) => {
        return movies.filter(movie => movie.title !== title);
    };

    /**
     * Charge et affiche les films dans les différentes sections de la page.
     */
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

    // Ajoute des événements pour gérer l'indicateur de défilement vers le bas
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

    // Charge les films lorsque la page est prête
    loadMovies();
});
