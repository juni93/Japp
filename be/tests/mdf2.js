const rp = require('request-promise');
const cheerio = require('cheerio');
const generateSafeId = require('generate-safe-id');
const scraper = function(url,items) {
 return rp(url)
    .then(function(html){
      //success!
      const $ = cheerio.load(html, {
        normalizeWhitespace: true,
        xmlMode: true
      });
      const content = []
      const details = []
      const ingredients = []
        let nLi = $('ul.ingredients-list > li')
        for(let i = 0; i < nLi.length; i++) {
          ingredients.push(nLi.eq(i).text())
        }
        //get difficult and timing
        let nDetails = $('.scheda-ricetta-new tr')
        //console.log(nDetails.eq(0).children().eq(0).text())
        for(let i = 0; i < nDetails.length; i++) {
           let details = nDetails.eq(i).text()
        }
        details.push({
          "ingredients" : ingredients,
          "details" : "mmm"
        })
        let nBody = $('.cda-text')
        let procedure = nBody.text()
        content.push( {
            PutRequest : {
              Item: {
                'sId' : {S: String(generateSafeId())},
                'link' : {S: items.link},
                'text' : {S: procedure},
                "details" : {S: cookingTime},
                'title' : {S: items.title}
                }
              }
            })
        //dinamodb obj
        var params = {
          RequestItems : {
            "WebScraping" :
              content
          }
        }
        return params
    })
    .catch(function(err){
      console.error()
    });
}
module.exports = scrape
