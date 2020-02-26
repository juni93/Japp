const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

const details = [];
(async function () {
  try {
    const website = "https://www.mediaworld.it";
    const sitemapUrl = "https://www.mediaworld.it/informazioni/mappa-del-sito";
    const mainHtml = await request({
    uri: sitemapUrl,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    },
    gzip: true
});
    const $ = cheerio.load(mainHtml);

    const links = $('.item-4 ul li ul li').map((i, sitemap) =>{
      const $category = $(sitemap).find('a[href^="/catalogo/"]');
      return website + $category.attr('href');
    }).get();

    await Promise.all(links.map(async (link) => {
      try {

        const categoryPage = await request(link);
        const $ = cheerio.load(categoryPage, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        const items = $('.search-product-list-content > article');
        const search = items.map((i, item) => {
          itemName = $(item).find('h3.product-name a').text();
          itemPrice = $(item).find('.product-prices.no-mob span.price').text();
          itemUrl = website + $(item).find('h3.product-name a').attr('href');
          if(itemName !== '' && (itemUrl !== undefined || itemUrl !== '' || itemUrl !== null )){
            return details.push({
              "ItemName" : itemName,
              "itemPrice" : itemPrice,
              "itemUrl" : itemUrl
            })
          }
        }).get();
        // console.log(details);
        //return details;
        let data = JSON.stringify(details, null, 2);

        fs.writeFile('MediaworldData.json', data, (err) => {
            if (err) throw err;
        });

      } catch(e) {
        console.log('Item error: ', e);
      }
    }));
    console.log('This is after the write call');
    //console.log(urls);

  } catch (e) {
    console.log('Category erro: ',e)
  }
})();
