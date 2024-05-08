document.addEventListener('DOMContentLoaded', function () {
    const articlesContainer = document.getElementById('articles');
    const genreFilter = document.getElementById('genreFilter');
    const sentimentSlider = document.getElementById('sentiment-slider');
    const sentimentValue = document.getElementById('sentiment-value');
    const articleCount = document.getElementById('article-count');
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('sidebar');

    menuButton.addEventListener('click', function() {
        if (sidebar.classList.contains('sidebar-hidden')) {
            sidebar.classList.remove('sidebar-hidden');
        } else {
            sidebar.classList.add('sidebar-hidden');
        }
    });
    document.addEventListener('click', function(event) {
        // Check if the click happened outside the sidebar
        if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.classList.add('sidebar-hidden');
        }
    });
    sidebar.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    sentimentValue.textContent = sentimentSlider.value; // Display the default slider value

    let articlesData = [];

    fetch('/articles')
        .then(response => response.json())
        .then(data => {
            articlesData = data; // Save fetched data for re-filtering
            populateGenres(data);
            filterAndDisplayArticles(data);
        })
        .catch(error => console.error('Error loading the articles:', error));

    genreFilter.addEventListener('change', () => filterAndDisplayArticles(articlesData));
    sentimentSlider.addEventListener('input', function() {
        sentimentValue.textContent = this.value; // Update and display the slider value
        filterAndDisplayArticles(articlesData);
    });

    function populateGenres(data) {
        const genres = new Set();
        data.forEach(article => {
            if (article.section && !genres.has(article.section)) {
                genres.add(article.section);
                const option = document.createElement('option');
                option.value = article.section;
                option.textContent = article.section;
                genreFilter.appendChild(option);
            }
        });
    }

    function filterAndDisplayArticles(data) {
        const selectedGenre = genreFilter.value;
        const selectedSentiment = parseFloat(sentimentSlider.value);
        articlesContainer.innerHTML = ''; // Clear existing articles
        let displayedCount = 0; // Initialize counter for displayed articles
        data.forEach((article, index) => {
            if ((selectedGenre === '' || article.section === selectedGenre) && article.sentiment.compound >= selectedSentiment) {
                createArticleElement(article, articlesContainer, index);
                displayedCount++; // Increment for each displayed article
            }
        });
        articleCount.textContent = `Displayed Articles: ${displayedCount}`; 
    }
});

function createArticleElement(article, container, index) {
    const articleElement = document.createElement('div');
    articleElement.innerHTML = `
        <h2>${article.title}</h2>
        <h3>${article.author}</h3>
        <h4>${article.date}</h4>
        <h4>${article.url}</h4>
        <button onclick="viewArticle(${index})">Read More</button>
    `;
    container.appendChild(articleElement);
}

function viewArticle(articleId) {
    window.location.href = 'articlePage.html?article=' + articleId;
}

