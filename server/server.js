const express = require('express');
const fs = require('fs')
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

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
    fs.readFile('server/data/articles.json', 'utf8', (err, jsonData) => {
        if (err) {
            console.error('Error reading the articles file:', err);
            res.status(500).send('Error reading articles data');
            return;
        }
        res.json(JSON.parse(jsonData));
    });
});

app.get('/articlesPageFetch', (req, res) => {
    res.json(articles);
});

cron.schedule('10 11 * * *', function() {
    console.log('Running a daily task to update articles.');
    exec('python server/scheduler/main.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

