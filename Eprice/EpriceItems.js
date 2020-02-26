
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

const details = [];
const singleUrl = [];
(async function () {
  try {

    fs.readFile('EpriceUrls.json', async (err, data) => {
      if (err) throw err;
      let singleUrls = JSON.parse(data);
      for (let i = 0; i < singleUrls.length; i++){
        singleUrl.push(singleUrls[i]);
      }

      await Promise.all(singleUrl.map(async (pageNumber) => {
        try{
          const pageUrl = await request(pageNumber);
          const $ = cheerio.load(pageUrl, {
            normalizeWhitespace: true,
            xmlMode: true
          });

          const items = $('.row .item');
          const search = items.map((i, item) => {
            return details.push({
              "itemName" : $(item).find('h2.itemName').text(),
              "itemPrice" : $(item).find('span.contPrice').text(),
              "ItemUrl" : $(item).find('a.linkTit').attr('href')
            })
          }).get();

          let data = JSON.stringify(details, null, 2);

          fs.writeFile('EpriceItems.json', data, (err) => {
              if (err) throw err;
          });

        }catch(e){
          console.log('item error', e)
        }
      }));
    });
    console.log('This is after the write call');
  } catch (e) {
    console.log('page error: ',e)
  }
})();
