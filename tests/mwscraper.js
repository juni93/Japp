const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const generateSafeId = require('generate-safe-id');

const AWS = require("aws-sdk");

let awsconfig = {
  "region": "us-east-2",
  "endpoint": "https://dynamodb.us-east-2.amazonaws.com",
  "accessKeyId": "AKIAIULRT35PJAV7SG3Q",
  "secretAccessKey": "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",
}
AWS.config.update(awsconfig);


const getSitemapUrls = async function (sitemap) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 926 });
  await page.goto(sitemap, {waitUntil: 'domcontentloaded'});

  const sitemapData = await page.content();
  const $ = cheerio.load(sitemapData);
  let categoryUrls = [];
  let urlPages = [];
  let nLi = $("div.item-4 ul li ul li");
  let ID = [];
  for(let i = 0; i <= nLi.length; i++){
    try{
      let href = 'https://www.mediaworld.it' + $("a[href^='/catalogo/']",nLi.eq(i)).attr('href')
      let nid = [i];
      ID.push(nid);
      categoryUrls.push(href);
    }
    catch(err){
      console.log(err);
    }
    await browser.close()
  }
  //***********************************************
  //Insert in Dynamodb
  //***********************************************
  var docClient = new AWS.DynamoDB.DocumentClient();

  console.log("Importing categories into DynamoDB. Please wait.");
  categoryUrls.forEach(function(categoryUrl) {
    let params = {
        TableName: "sitemaps",
        Item: {
            "id": ID,
            "categories": categoryUrl,
            "website": "Mediaworld"
      }
    };
    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add Sitemap", {S: String(generateSafeId())}, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", categoryUrl);
       }
    });

  });

  //console.log(categoryUrls);
  //return categoryUrls;

};

module.exports = getSitemapUrls

//getSitemapUrls()

//***********************************************
//Insert in Dynamodb
//***********************************************
// var docClient = new AWS.DynamoDB.DocumentClient();
//
// console.log("Importing movies into DynamoDB. Please wait.");
// sitemapData.forEach(function(uniquecategory) {
//   let params = {
//       TableName: "MediaworldSitemap",
//       Item: {
//           "id": String(generateSafeId()),
//           "categories": uniquecategory,
//     }
//   };
//   docClient.put(params, function(err, data) {
//      if (err) {
//          console.error("Unable to add MediaworldSitemap", {S: String(generateSafeId())}, ". Error JSON:", JSON.stringify(err, null, 2));
//      } else {
//          console.log("PutItem succeeded:", uniquecategory);
//      }
//   });
//
// });

//***********************************************
//scrap all with puppeteer
//***********************************************
// let sitemapData = await page.evaluate(() => {
//   let urlToBeFilter = [];
//   let urlFiltered = [];
//
//   let categoriesElms = document.querySelectorAll('div.item-4 ul li, div.link-container');
//
//   categoriesElms.forEach((categoriesElement) => {
//       let categoryJson = {};
//       let domainJson = {};
//       try {
//           domainJson = 'https://www.mediaworld.it';
//           categoryJson.category = categoriesElement.querySelector('a[href^="/catalogo/"]').getAttribute('href');
//       }
//       catch (exception){
//
//       }
//
//       urlToBeFilter.push(domainJson + categoryJson.category);
//       urlFiltered = urlToBeFilter.filter (function (element) {return element !== 'https://www.mediaworld.itundefined'});
//       unique = [...new Set(urlFiltered)];
//   });
//   return unique;
// });
//***********************************************
