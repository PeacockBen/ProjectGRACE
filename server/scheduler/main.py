import requests
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.sentiment import SentimentIntensityAnalyzer
import json
from datetime import datetime,timedelta

class MainClass:
    def get_sentiment(self,text):
        tokens = word_tokenize(text.lower())
        stop_words = set(stopwords.words('english'))
        lemmatizer = WordNetLemmatizer()
        filtered_tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words]
        processed_text = ' '.join(filtered_tokens)
        analyzer = SentimentIntensityAnalyzer()
        sentiment = analyzer.polarity_scores(processed_text)
        return sentiment
    

    def get_articles(self,date):
        # mongodb_uri = "mongodb://localhost:27017/"
        # client = MongoClient(mongodb_uri)
        # db = client['ProjectGrace']
        # articles_collection = db['articles']


        # def get_sentiment(self,text):
        #     tokens = word_tokenize(text.lower())
        #     stop_words = set(stopwords.words('english'))
        #     lemmatizer = WordNetLemmatizer()
        #     filtered_tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words]
        #     processed_text = ' '.join(filtered_tokens)
        #     analyzer = SentimentIntensityAnalyzer()
        #     sentiment = analyzer.polarity_scores(processed_text)
        #     return sentiment

        api_key = 'd9c548f3-e3dc-486f-af1c-0a151fd5c8d4'
        url = 'https://content.guardianapis.com/search'

        params = {
        'q': '', 
        'api-key': api_key,
        'page-size': 200,
        "from-date": date,
        "show-fields": "body-text,byline"
        }
        response = requests.get(url, params=params)
        political_keywords = ['Labour', 'Conservative', 'tory', 'government','NHS','Brexit','Tory','Tories','election', 'Boris Johnson','abortion']

        # check if the request was successful
        if response.status_code == 200:
            data = response.json()
            articles = []
            try:
                # Load existing articles from JSON
                with open("server/data/articlesDay1.json", "r") as file:
                    existing_articles = json.load(file)
            except FileNotFoundError:
                existing_articles = []
            
            current_article_id = len(existing_articles) 

            # loop through all articles
            for article in data['response']['results']:
                articlejson = ""
                title = article['webTitle']
                if not any(keyword in title for keyword in political_keywords):

                    # check if the article is positive
                    if MainClass.get_sentiment(self,article['fields']['bodyText'])['pos'] > 0.2 and MainClass.get_sentiment(self,article['fields']['bodyText'])['neg'] < 0.15 and MainClass.get_sentiment(self,article['fields']['bodyText'])['neu'] < 0.75:
                        
                        # remove sports, football and politics articles
                        if article["sectionName"] != "Sport" and article["sectionName"] != "Football" and article["sectionName"] != "Politics" and article["sectionName"] != "Opinion":
                            
                            # format the date
                            parsed_date = datetime.strptime(article["webPublicationDate"], "%Y-%m-%dT%H:%M:%SZ")
                            formatted_date = parsed_date.strftime("%Y-%m-%d")
                            
                            
                            
                            #export to json
                            articlejson = {
                                    "title": article['webTitle'],
                                    "url": article['webUrl'], 
                                    "sentiment": MainClass.get_sentiment(self,article['fields']['bodyText']), 
                                    "body": article['fields']['bodyText'],
                                    "date": formatted_date,
                                    "section": article["sectionName"],
                                    "author": article["fields"].get("byline", ""),
                                    "id": current_article_id,
                                    }
                            if articlejson != "" and formatted_date == date:
                                articles.append(articlejson)
                                current_article_id += 1


            if len(articles) != 0:
                # articleExists = articles_collection.find_one({"date":articles[0]["date"]})
                # Check if the articles already exist in the json file
                articlesjson = json.load(open("server/data/articlesDay1.json"))

                articleExists = None
                for article in articlesjson:
                    if article["date"] == articles[0]["date"]:
                        articleExists = article
                        break
                if articleExists is None:
                    # append json with new articles
                    articlesjson.extend(articles)
                    with open("server/data/articlesDay1.json", "w") as f:
                        json.dump(articlesjson, f)

                    
                        
                else:
                    print("Error, already inserted articles from this date")
                
                return len(articles)
            else:
                print("No articles found")
                return 0
        else:
            print('Failed to fetch data:', response.status_code)

        
    



    





def get_articles_for_month(main_obj, year=2024, month=2, days=30):
    average=0
    aveArray = []
    # Start date of the month
    start_date = datetime(year, month, 1)
    
    # Loop through the first 30 days of the month
    for day_offset in range(days):
        # Calculate the date for the current iteration
        current_date = start_date + timedelta(days=day_offset)
        
        # Format the date as a string in the format "YYYY-MM-DD"
        date_str = current_date.strftime('%Y-%m-%d')
        
        # Call the get_articles function with the current date
        aveArray.append(main_obj.get_articles(date=date_str))
        
        # Optionally print the date to confirm the function call
        print(f"Fetching articles for: {date_str}")
    for number in aveArray:
        average = average + number
    average = average/len(aveArray)
        
    print("Average length of articles:")
    return average
        
        
    
if __name__ == "__main__":
    main_obj = MainClass()
    #fetch articles for every day in February 2024
    start_date = datetime(2023, 3, 1)
    for day_offset in range(31):
        # Calculate the date for the current iteration
        current_date = start_date + timedelta(days=day_offset)
        
        # Format the date as a string in the format "YYYY-MM-DD"
        date_str = current_date.strftime('%Y-%m-%d')
        
        # Call the get_articles function with the current date
        main_obj.get_articles(date=date_str)
    #main_obj.get_articles(date="2024-01-14")