var config = require('./lib/config'),
  Twitter = require('node-tweet-stream'),
  Redis = require('redis'),
  db = Redis.createClient(config.redis.port, config.redis.host, config.redis.options);

db.auth('tK2ib192DqELMH+WLMaZuuD8gPU6HAbHXzJzj6oIYtA=');

twitter = new Twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  token: config.twitter.access_token_key,
  token_secret: config.twitter.access_token_secret
});

twitter.on('tweet', function (tweet) {
  if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
    console.log('new image');
    db.incr('images', function (error, id) {
      console.log(error, id);
      db.set('cats-' + id, tweet.entities.media[0].media_url, function (error, success) {
        console.log(error, success);
        db.lpush('cats', 'cats-' + id, function (error, success) {
          console.log('image stored.');
        });
      });
    });
  }
});

twitter.on('error', function (error) {
  console.log('error', error);
});

twitter.track('cats,cat');
