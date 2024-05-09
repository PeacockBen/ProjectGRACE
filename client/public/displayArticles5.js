document.addEventListener('DOMContentLoaded', function () {

    const articlesContainer = document.getElementById('articles');
    articlesContainer.innerHTML = '<p>Loading articles... This may take a moment. Please do not refresh the page.</p>'; 
    const sentimentSlider = document.getElementById('sentiment-slider');
    const sentimentValue = document.getElementById('sentiment-value');
    const articleCount = document.getElementById('article-count');
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('sidebar');
    const nextPageButton = document.getElementById('next-page');
    const prevPageButton = document.getElementById('prev-page');

    let currentGenre = '';  // Variable to store the currently selected genre
    let articlesData = [];
    let currentPage = 1;
    const articlesPerPage = 21;

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

    nextPageButton.addEventListener('click', function() {
        currentPage++;
        filterAndDisplayArticles(articlesData, currentGenre);
    });

    prevPageButton.addEventListener('click', function() {
        currentPage--;
        filterAndDisplayArticles(articlesData, currentGenre);
    });

    sentimentSlider.addEventListener('input', function() {
        sentimentValue.textContent = this.value;
        currentPage = 1;  // Reset to the first page whenever filter changes
        filterAndDisplayArticles(articlesData, currentGenre);
    });

    fetch('/articles')
        .then(response => response.json())
        .then(data => {
            articlesData = data; // Save fetched data for re-filtering
            
            articlesData.sort((a,b)=>{
                return new Date(b.date) - new Date(a.date);
            });

            populateGenres(data);
            filterAndDisplayArticles(data, currentGenre);
        })
        .catch(error => console.error('Error loading the articles:', error));

    

    function populateGenres(data) {
        const genreCount = {};  // Object to store the count of articles per genre

        // Count articles in each genre
        data.forEach(article => {
            if (article.section) {
                if (genreCount[article.section]) {
                    genreCount[article.section]++;
                } else {
                    genreCount[article.section] = 1;
                }
            }
        });

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

        // Add genres to sidebar only if they have at least 3 articles
        Object.keys(genreCount).forEach(section => {
            if (genreCount[section] >= 3) {
                const listItem = document.createElement('li');
                listItem.textContent = section;
                listItem.addEventListener('click', () => {
                    setActiveGenre(listItem);
                    currentGenre = section;
                    filterAndDisplayArticles(data, currentGenre);
                });
                genreList.appendChild(listItem);
            }
        });
    }

    function filterAndDisplayArticles(data, genre) {
        const selectedSentiment = parseFloat(sentimentSlider.value);
        const startIndex = (currentPage - 1) * articlesPerPage;
    
        // Filter data based on genre and sentiment
        let filteredData = data.filter(article =>
            (genre === '' || article.section === genre) && article.sentiment.compound >= selectedSentiment
        );
    
        // Filter data based only on sentiment for percentage calculation
        let sentimentFilteredData = data.filter(article => article.sentiment.compound >= selectedSentiment);
    
        // Calculate the end index for pagination
        let endIndex = startIndex + articlesPerPage;
        if (endIndex > filteredData.length) {
            endIndex = filteredData.length;
        }
    
        // Get the paginated data to display
        const paginatedData = filteredData.slice(startIndex, endIndex);
    
        // Clear existing articles from the container
        articlesContainer.innerHTML = '';
        if (paginatedData.length === 0) {
            // Display a message if no articles meet the sentiment filter criteria
            articlesContainer.innerHTML = '<p>No articles are available at this level of sentiment. Please adjust the filter settings.</p>';
        } else {
    
            // Populate articles based on paginated data
            paginatedData.forEach((article) => {
                createArticleElement(article, articlesContainer);
            });
        
            // Calculate the percentage of displayed articles based on sentiment
            const percentageDisplayed = (sentimentFilteredData.length / data.length) * 100;
            articleCount.textContent = `Displayed: ${percentageDisplayed.toFixed(2)}% of articles`;
        }
        // Update pagination button visibility
        document.getElementById('next-page').style.display = endIndex < filteredData.length ? 'block' : 'none';
        document.getElementById('prev-page').style.display = currentPage > 1 ? 'block' : 'none';
    }
    

    function setActiveGenre(selectedItem) {
        document.querySelectorAll('#genreList li').forEach(li => li.classList.remove('active'));
        selectedItem.classList.add('active');
    }
});

function createArticleElement(article, container) {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    const imageHTML = article.thumbnail ? `<img src="${article.thumbnail}" alt="Thumbnail for ${article.title}" style="width:100%; height:auto;">` : '';
    articleElement.innerHTML = `
        ${imageHTML}
        <h2 class = "article-title">${article.title}</h2>
        <div class = "date-and-button">
            <p class = "article-date">${article.date}</p>
            <button onclick="viewArticle(${article.id})"class="read-more-btn">Read More</button>
        </div>
    `;
    container.appendChild(articleElement);
}

function viewArticle(articleId) {
    window.location.href = 'articlePage.html?article=' + articleId;
}



