
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://baobaote00:M1kHL93T70udniIl@tu-vung.jeysuu1.mongodb.net/?retryWrites=true&w=majority&appName=tu-vung";
const axios = require('axios');
const cheerio = require('cheerio');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("tu-vung").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
// run().catch(console.dir);

// const url = 'https://mazii.net/api/search';

// axios.post(url, {"dict":"javi","type":"word","query":"面接","limit":20,"page":1})
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error(`Error: ${error}`);
//   });



// axios.post('https://mazii.net/api/search', {
//   dict: 'javi',
//   type: 'kanji',
//   query: '別物',
//   page: 1
// }, {
//   headers: {
//     'accept': 'application/json, text/plain, */*',
//     'accept-language': 'vi,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,ja;q=0.6',
//     'content-type': 'application/json',
//     'priority': 'u=1, i',
//     'sec-ch-ua': '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127"',
//     'sec-ch-ua-mobile': '?0',
//     'sec-ch-ua-platform': '"Windows"',
//     'sec-fetch-dest': 'empty',
//     'sec-fetch-mode': 'cors',
//     'sec-fetch-site': 'same-origin',
//     'cookie': '_gcl_au=1.1.1012853872.1718456491; _ga=GA1.1.203432973.1718456491; G_ENABLED_IDPS=google; _cc_id=158465f1f3e1803de54cf2579f52bbb9; G_AUTHUSER_H=0; _pbjs_userid_consent_data=3524755945110770; __gads=ID=0555675cac498421:T=1719616258:RT=1719616258:S=ALNI_Mb1rFQDBFWrGAPivKPRbqA09fPP2w; __gpi=UID=00000e69f889f475:T=1719616258:RT=1719616258:S=ALNI_MaWcN2TUJbPxdsnS0h1SMkef2ABSQ; __eoi=ID=78d33bfca771904e:T=1719616258:RT=1719616258:S=AA-AfjZYdh1pHA6zXRP5cGY62xzg; cto_bidid=8JbOYl9LSDYlMkJ3TFNHakEwdXNKc1Ztd0MlMkJQT2tRb3N6eCUyQmxUJTJCMk5yUTlIY3pVUTh5T3N2RWhBaE12RyUyQjIxbDZlMUFUUmRWV1dwQmdRbFJNb1R1YkMxNzNoRlAwWCUyQjdpNmdjQVlhenZoZlM2M3J0OXZESGdETWh3T1RTT2xxSVhFdHR6SE5MZjJHcGNyVXVrUFVDMWFxR1clMkJQdyUzRCUzRA; cto_dna_bundle=64DTNl9CdmNRRDg0S1JDakx2MXZ4dE01d2R3dlZEVm5LQjJWJTJCTjV2YkVLMTZnOTNZYXQ0QnhhJTJGNGMlMkJqMVJWbSUyQlM1ajJkTkE2JTJCMDlYd3lpZkdWdVVOM0JzVEElM0QlM0Q; panoramaId_expiry=1723172432633; panoramaId=7dc21a1e92ea95ebffe6bb61f49316d5393870e9e57ef9683f4374bff741536a; panoramaIdType=panoIndiv; cto_bundle=9L5H7F9CdmNRRDg0S1JDakx2MXZ4dE01d2Qyalk3bUZZJTJGJTJCSjFWM2V0JTJCajhzZXB2TWliWlpzWHM3akFCMTZHd2dvS2dqVyUyQldEYnF5eDg3JTJCajhDdDcxejI1T1JpQktJa3RnQU44NUpOc0xGMWZLSXliSDNkJTJCeHNnN0olMkZ1c2RNN1k5QjFYdUs4QU03ZG1uMGk1OXkxeGl6blAwJTJCTkN0UmZ4bDY5U3kxa2daenFKbjU4JTNE; ph_phc_C8t1V9riJI8sIm2fcxyciTpdSEpI2KUFL8RFG2jdTSn_posthog=%7B%22distinct_id%22%3A%2201901bfd-2018-799e-8819-905763a676da%22%2C%22%24sesid%22%3A%5B1722567883138%2C%2201911107-313b-7ea3-b346-92432feeed92%22%2C1722567569723%5D%7D; _ga_MNX2FE1BXT=GS1.1.1722567569.88.1.1722568618.58.0.1119216967; _ga_XN196EXE2T=GS1.1.1722567569.88.1.1722568618.58.0.0',
//     'Referer': 'https://mazii.net/vi-VN/search',
//     'Referrer-Policy': 'strict-origin-when-cross-origin'
//   }
// }).then(response => {
//   console.log(response.data);
// }).catch(error => {
//   console.error(error);
// });


// kuroshiro.init(new KuromojiAnalyzer())
//   .then(function () {
//     return kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { to: "hiragana" });
//   })
//   .then(function (result) {
//     console.log(result);
//   })

// const url = 'https://convert-tu-vung-a4dyqf7unq-uc.a.run.app/convert_tu_vung';
// const url2 = 'http://127.0.0.1:5001/tu-vung-447ad/us-central1/convert_tu_vung';


// axios.post(url2, { "query": "勉強し" })
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error(`Error: ${error}`);
//   });

const url2 = 'http://127.0.0.1:3001/login';
const urlgetdata = 'http://127.0.0.1:3001/protected';


axios.get(urlgetdata)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(`Error: ${error}`);
  });