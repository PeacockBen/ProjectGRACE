fetch('/articles')
    .then(response => response.json()) // Parse the JSON from the response
    .then(data => {
        const articlesContainer = document.getElementById('articles');
        const genreFilter = document.getElementById('genreFilter');
        const genres = new Set(); 

        data.forEach((article,index) => {
            if (article.section && !genres.has(article.section)) {
                genres.add(article.section);
                const option = document.createElement('option');
                option.value = article.section;
                option.textContent = article.section;
                genreFilter.appendChild(option);
            }

            createArticleElement(article, articlesContainer);
        });
        genreFilter.addEventListener('change', function() {
            const selectedGenre = this.value;
            fetch('/articles')
                .then(response => response.json())
                .then(data => {
                    articlesContainer.innerHTML = ''; // Clear existing articles
                    data.forEach((article,index) => {
                        if (selectedGenre === '' || article.section === selectedGenre) {
                            createArticleElement(article, articlesContainer,index);
                        }
                    });
                })
                .catch(error => console.error('Error loading the articles:', error));
        });
    })
    .catch(error => console.error('Error loading the articles:', error));



function createArticleElement(article, container,index) {
    // Iterate through each article in the JSON
    
    const articleElement = document.createElement('div');
            
            // Create HTML for the article
    articleElement.innerHTML = `
        <h2>${article.title}</h2>
        <h3>${article.author}</h3>
        <h4>${article.date}</h4>
        <h4>${article.url}</h4>
        <button onclick="viewArticle('${index}')">Read More</button>
    `;

            // Append the article HTML to the container
    container.appendChild(articleElement);
}

function viewArticle(articleId) {
    window.location.href = 'articlePage.html?article=' + articleId;
}

