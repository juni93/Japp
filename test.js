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
    const website = "https://www.eprice.it";
    const sitemapUrl = "https://www.eprice.it/s/informatica/portatili-notebook-tablet/tablet?fd=1";
    const pagesUrls = [];
    let verifyUrl;
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
    const $ = cheerio.load(mainHtml, {
      normalizeWhitespace: true,
      xmlMode: true
    });

    const totalPages = $('.navRes .pagNum .btn_grey').last().text();
    for(let i = 0; i <= totalPages; i++){
      pagesUrls.push(sitemapUrl + "&vv=1&pp=" + [i]);
    }

    await Promise.all(pagesUrls.map(async (pageUrl) => {
      try {

        const currentPage = await request(pageUrl);
        const $ = cheerio.load(currentPage, {
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
        //console.log(details);
        //return details;
        let data = JSON.stringify(details, null, 2);

        fs.writeFile('EpriceItems.json', data, (err) => {
            if (err) throw err;
        });

      } catch(e) {
        console.log('Item error: ', e);
      }
    }));
    //console.log(pagesUrls);
    console.log('This is after the write call');
  } catch (e) {
    console.log('Category error: ',e)
  }
})();



//***********************************
//assign function return to a variable and then manipulate
//***********************************
// let test = bb();
// totalPages = [];
// test.then(function(result){
//   for(let x = 0; x <= 2; x++){
//     try{
//       let a = result[x];
//       totalPages.push({
//         "Category" : result[x]
//       });
//     }
//     catch(err){
//       console.log(err);
//     }
//
//   }
//
//
//   console.log(totalPages)
// });
