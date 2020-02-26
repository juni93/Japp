var AWS = require("aws-sdk");
let awsconfig = {
  "region": "us-east-2",
  "endpoint": "https://dynamodb.us-east-2.amazonaws.com",
  "accessKeyId": "AKIAIULRT35PJAV7SG3Q",
  "secretAccessKey": "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",
}
AWS.config.update(awsconfig);

var dynamodb = new AWS.DynamoDB();

// // /**
//  SITEMAP TABLE
// */
// var params = {
//     TableName : "sitemaps",
//     KeySchema: [
//         { AttributeName: "website", KeyType: "HASH"},  //Partition key
//         { AttributeName: "id_sitemap_url", KeyType: "RANGE" } //Sort key
//     ],
//     AttributeDefinitions: [
//         { AttributeName: "website", AttributeType: "S" },
//         { AttributeName: "id_sitemap_url", AttributeType: "N" }
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 10,
//         WriteCapacityUnits: 10
//     }
// };
//
// dynamodb.createTable(params, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });


// /**
//  Complete Urls (with page number) Table
// */


// var params = {
//     TableName : "mediaworldurls",
//     KeySchema: [
//         { AttributeName: "id", KeyType: "HASH"},  //Partition key
//         { AttributeName: "categoryUrl", KeyType: "RANGE" } //Sort key
//     ],
//     AttributeDefinitions: [
//         { AttributeName: "id", AttributeType: "S" },
//         { AttributeName: "categoryUrl", AttributeType: "S" }
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 10,
//         WriteCapacityUnits: 10
//     }
// };
//
// dynamodb.createTable(params, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });
