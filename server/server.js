// const express = require('express');
// const mongoose = require('mongoose');
// const Article = require('./models/articleModel');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Connect to the database
// mongoose.connect('mongodb://localhost:27017/ProjectGrace', { useNewUrlParser: true}).then(() => {
//     console.log('Connected to MongoDB');
// }).catch(err => {
//     console.error('Error connecting to MongoDB:', err);
// });

// // Define a route
// app.get('/articles', async (req, res) => {
//     try{
//         const articles = await Article.find();
//         res.json(articles);
//     }catch (error) {
//         console.error('Error fetching articles:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const fs = require('fs')
const path = require('path');

//  create express app
const app = express();
app.use(express.static('client/public'));
const PORT = process.env.PORT || 3000;


const jsonData = fs.readFileSync('server/data/articles.json', 'utf8');
const articles = JSON.parse(jsonData);


app.get('/', (req, res) => {
    // res.json(articles);
    const mainHtmlPath = path.join(__dirname,'..', 'client', 'public', 'main.html');
    // Send main.html as the response
    res.sendFile(mainHtmlPath);
});

app.get('/articles', (req, res) => {
    res.json(articles);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

