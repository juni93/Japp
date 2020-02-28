const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const generateSafeId = require('generate-safe-id');
const AWS = require("aws-sdk");

let awsconfig = {
  "region": "us-east-2",
  "endpoint": "https://dynamodb.us-east-2.amazonaws.com",
  "accessKeyId": "",
  "secretAccessKey": "",
}
AWS.config.update(awsconfig);
var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Querying for categories of Mediaworld.");

var params = {
    TableName : "sitemaps",
    KeyConditionExpression: "#company = :mw",
    ExpressionAttributeNames:{
        "#company": "website"
    },
    ExpressionAttributeValues: {
        ":mw": "Mediaworld"
    },
    ScanIndexForward: true,
    Limit: 3
};


docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            calcolo(item.categories);
        });
    }
});

const calcolo = async function (categoryLink) {

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(categoryLink, {waitUntil: 'domcontentloaded'});

  const articleCategoryPage = await page.content();
  const $ = cheerio.load(articleCategoryPage);
  let allPages = [];
  let pageNumbers = Math.ceil(($(".pages").attr('data-pagination-total'))/24)

  for(let i = 1; i <= pageNumbers; i++){
  allPages.push(categoryLink + "?pageNumber=" + [i]);
  }
  let params = {
      TableName: "mediaworldurls",
      Item: {
          "id": String(generateSafeId()),
          "itemUrls": allPages,
          "categoryUrl": categoryLink
    }
  };
  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add single urls", allPages,  ". Error JSON:", JSON.stringify(err, null, 2));
     } else {
         console.log("PutItem succeeded:", categoryLink , "with total pages:", pageNumbers );
     }
  });
  // console.log(pageNumbers);
  // return pageNumbers;
  await browser.close();
};

module.exports = calcolo







// export default class PageNumber{
//   constructor(page){
//     this.page = page;
//   }
//   async getUrlPageNumbers() {
//     /**
//     * Get page content as HTML.
//     */
//       const articleCategoryPage = this.page.content();
//
//       /**
//       * Load content in cheerio.
//       */
//       const $ = cheerio.load(articleCategoryPage);
//       let allPages = [];
//       let pageNumbers = $(".pages a[data-page]").length
//       //pages.push(pageNumbers);
//       for(let i = 1; i <= pageNumbers; i++){
//         allPages.push(categorylink + "?pageNumber=" + [i]);
//       }
//       return allPages;
//   }
// }







// const MWParser = require('./mwparser');
// category = 'quest è il numero di pagina :'
// x = '12';
// numero = '';
// let PageNumber = (n) => {
//   for(let i = 0; i <= n; i++) {
//     numero += url + [i] + " , "
//   }
//   console.log(numero);
//   //return numero;
// }
//
// PageNumber(x);
// module.exports = PageNumber
