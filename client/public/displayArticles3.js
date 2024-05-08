document.addEventListener('DOMContentLoaded', function () {
    const articlesContainer = document.getElementById('articles');
    const genreFilter = document.getElementById('genreFilter');
    const sentimentSlider = document.getElementById('sentiment-slider');
    const sentimentValue = document.getElementById('sentiment-value');
    const articleCount = document.getElementById('article-count');
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('sidebar');

    let currentGenre = '';  // Variable to store the currently selected genre
    let articlesData = [];

    menuButton.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-hidden');
    });
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.classList.add('sidebar-hidden');
        }
    });
    sidebar.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    fetch('/articles')
        .then(response => response.json())
        .then(data => {
            articlesData = data; // Save fetched data for re-filtering
            populateGenres(data);
            filterAndDisplayArticles(data, currentGenre);
        })
        .catch(error => console.error('Error loading the articles:', error));

    sentimentSlider.addEventListener('input', function() {
        sentimentValue.textContent = this.value; // Update and display the slider value
        filterAndDisplayArticles(articlesData, currentGenre);
    });

    function populateGenres(data) {
        const genres = new Set();
        const genreList = document.getElementById('genreList');

        // Create "All Genres" option
        const allGenresItem = document.createElement('li');
        allGenresItem.textContent = 'All Genres';
        allGenresItem.classList.add('active'); // Highlight "All Genres" by default
        allGenresItem.addEventListener('click', () => {
            setActiveGenre(allGenresItem);
            currentGenre = '';
            filterAndDisplayArticles(data, currentGenre);
        });
        genreList.appendChild(allGenresItem);

        data.forEach(article => {
            if (article.section && !genres.has(article.section)) {
                genres.add(article.section);
                const listItem = document.createElement('li');
                listItem.textContent = article.section;
                listItem.addEventListener('click', () => {
                    setActiveGenre(listItem);
                    currentGenre = article.section;
                    filterAndDisplayArticles(data, currentGenre);
                });
                genreList.appendChild(listItem);
            }
        });
    }

    function filterAndDisplayArticles(data, genre) {
        const selectedSentiment = parseFloat(sentimentSlider.value);
        articlesContainer.innerHTML = ''; // Clear existing articles
        let displayedCount = 0;
        data.forEach((article, index) => {
            if ((genre === '' || article.section === genre) && article.sentiment.compound >= selectedSentiment) {
                createArticleElement(article, articlesContainer, index);
                displayedCount++;
            }
        });
        articleCount.textContent = `Displayed Articles: ${displayedCount}`;
    }

    function setActiveGenre(selectedItem) {
        document.querySelectorAll('#genreList li').forEach(li => li.classList.remove('active'));
        selectedItem.classList.add('active');
    }
});

function createArticleElement(article, container, index) {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.innerHTML = `
        <h2>${article.title}</h2>
        <div class = "date-and-button">
        
            <p class = "article-date">${article.date}</p>
            <button onclick="viewArticle(${index})"class="read-more-btn">Read More</button>
        </div>
    `;
    container.appendChild(articleElement);
}

function viewArticle(articleId) {
    window.location.href = 'articlePage.html?article=' + articleId;
}

