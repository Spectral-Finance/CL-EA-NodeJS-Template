const axios = require('axios');

const delay = ms => new Promise(res => setTimeout(res, ms));

//bytes32 0x5e8263ccb549ba98b8416ab7141aa689b7f573497a1cabc4a1982e6ddb401bb5
//uint256 42747786677057537933777365201756780713494970703527385451017290874280990481333
function numBigIntToBytes32(num) { 
  return '0x' + BigInt(num).toString(16).padStart(64, '0')
}

async function getAddresses(tokenId) {
  try {
    const response = await axios.post('https://spec-address-db.herokuapp.com/v1/addressBatch/availAddressesEA', {
      tokenId: tokenId,
      key: '12345'
    })
    console.log(response.status);
    return response.data.signed_addresses
  } catch (error) {
    console.error(error);
  }
}

async function callMacroScore(addresses) {
  const data = JSON.stringify({"addresses": addresses,"job_type":"calculate"});
  const config = {
    method: 'post',
    url: 'http://18.117.142.124/api/submit/',
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data
  };
  try {
    const response = await axios(config)
    return response.data.job_id
  } catch (error) {
    console.error(error);
  }
}

async function resolveMacroScore(jobid) {
  try {
    const result = await axios.get(`http://18.117.142.124/api/resolve/${jobid}`)
    return result.data
  } catch(error) {
    console.error(error);
  }
}

async function main() {
  try {
    const tokenId = numBigIntToBytes32("42747786677057537933777365201756780713494970703527385451017290874280990481333")
    const addresses = await getAddresses(tokenId)
    const jobid = await callMacroScore(addresses)
    console.log(jobid)
    let score = await resolveMacroScore(jobid)
    while(score.completed==false) {
      await delay(5000)
      console.log("score not ready, trying again...")
      score = await resolveMacroScore(jobid)
    }
    console.log(score.result)
  } catch (err) {
    console.error(err);
  }
}

main()
  .then((result) => {
    console.log("Process finished!")
  })
  .catch((error) => {
    console.error("Process errored out", error)
  })

// exports.handler = async (event) => {
//   const responseData = await main()
//   const response = {
//       statusCode: 200,
//       body: JSON.stringify(responseData),
//   };
//   return response;
// };