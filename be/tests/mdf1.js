const rp = require('request-promise');
const cheerio = require('cheerio');
const scraper = require("./Scraper");
const url = 'https://www.cucchiaio.it/ricette/';
const domain = 'https://www.cucchiaio.it';
const putItemDb = require("./Models/WebScraping");
const sitemap = function(pag) {
    rp(url + pag)
      .then(function(html){
        //success!
        const $ = cheerio.load(html, {
          normalizeWhitespace: true,
          xmlMode: true
        });
          const content = []
          var request = []
          let nLi = $('.content_result.section ul li')
          const t = new Date()
          for(let i = 0; i < nLi.length; i++) {
            let title = $("h3.title_articolo",nLi.eq(i)).text()
            let href = $("h3.title_articolo > a",nLi.eq(i)).attr("href")
            if(title != '' && ( href != undefined || href != '')) {
                content.push({
                  "link" : href,
                  "title" : title
                })
              }
            }
          return Promise.all(
            content.map(function(items) {
              return scraper(domain + items.link, items);
            })
          );
    })
    .then(function(params) {
      //SAVE INTO DYNAMO DB
      params.forEach(function(e) {
        //putItemDb(e);
      })
    })
      .catch(function(err){
         console.error(err);
      });
  }
module.exports = sitemap
