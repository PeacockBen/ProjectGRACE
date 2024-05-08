function getArticleId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('article');
}

fetch('/articles')
    .then(response => response.json())
    .then(data => {
        const articleId = getArticleId();
        const article = data.find(art => art.id.toString() === articleId);  // Assuming 'id' is stored and compared as strings
        if (!article) {
            document.getElementById('articleContent').innerHTML = "<p>Article not found.</p>";
            return;
        }

        // Using compromise to process the article body into paragraphs
        const nlp = window.nlp;
        const doc = nlp(article.body);
        const sentences = doc.sentences().out('array');

        let paragraphText = '';
        let paragraphsHTML = '';
        sentences.forEach((sentence, index) => {
            paragraphText += sentence + ' ';
            if ((index + 1) % 5 === 0 || index + 1 === sentences.length) { // Group every 5 sentences into a paragraph
                paragraphsHTML += `<p>${paragraphText.trim()}</p>`;
                paragraphText = ''; // Reset for next paragraph
            }
        });

        const imgHTML = article.thumbnail ? `<img src="${article.thumbnail}" alt="Thumbnail for ${article.title}" style="width: 600px; height:auto;">` : '';
        const linkHTML = `<a href="${article.url}" target="_blank" style="display:block; margin-top:20px; text-align:center; color: #007BFF; text-decoration: none;">Read Original Article</a>`;

        document.getElementById('articleContent').innerHTML = `
            <div class="header-container">
                <h1>${article.title}</h1>
                ${imgHTML}
            </div>
            <h3>Author: ${article.author}</h3>
            ${paragraphsHTML}
            ${linkHTML}
        `;

        document.getElementById('backButton').addEventListener('click', function() {
            window.history.back();
        });
    })
    .catch(error => console.error('Error loading the article:', error));
