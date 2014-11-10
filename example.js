var pubeasy = require('./pubeasy.js');

// Example check login call
pubeasy.checkLogin({
    pin: 'PXXXXXX',
    userId: '0001',
    pwd: 'XXXXXX'
}, function (err, result) {
  if(err) {
    return console.log(err);
  }
  console.log(result);
});

// Example bibliography call
pubeasy.bibliography({
    pin: 'PXXXXXX',
    userId: '0001',
    pwd: 'XXXXXX',
    isbn: '9780590058995',
    region: 'AME'
}, function (err, result) {
  if(err) {
    return console.log(err);
  }
  console.log(result);
});