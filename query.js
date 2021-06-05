const axios = require('axios');

const delay = ms => new Promise(res => setTimeout(res, ms));

//bytes32 0x5e8263ccb549ba98b8416ab7141aa689b7f573497a1cabc4a1982e6ddb401bb5
//uint256 42747786677057537933777365201756780713494970703527385451017290874280990481333
function numBigIntToBytes32(num) { 
  return '0x' + BigInt(num).toString(16).padStart(64, '0')
}

async function getAddresses(tokenId) {
  const result = await axios.post('https://spec-address-db.herokuapp.com/v1/addressBatch/availAddressesEA', {
    tokenId: tokenId,
    key: '12345'
  })
  .then(response => {
    console.log(response.status);
    return response.data.signed_addresses
  })
  .catch(error => {
    console.log(error);
  });

  return result
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

  axios(config)
  .then(response => {
    console.log(response.data)
  })
  .catch(error => {
    console.log(error);
  });
}

async function resolveMacroScore(jobid) {
  const result = await axios.get(`http://18.117.142.124/api/resolve/${jobid}`)
  .then(response => {
    return response.data
  })
  .catch(error => {
    console.log(error);
  });
  return result
}

async function main() {
  const tokenId = numBigIntToBytes32("42747786677057537933777365201756780713494970703527385451017290874280990481333")
  const addresses = await getAddresses(tokenId)
  console.log(addresses)
  const jobid = await callMacroScore(addresses)
  let score = await resolveMacroScore("ba42b81d-f728-4521-9fe0-4c85c0ea736d")
  while(score.completed==false) {
    await delay(5000)
    console.log("score not ready, trying again...")
    score = await resolveMacroScore("ba42b81d-f728-4521-9fe0-4c85c0ea736d")
  }
  console.log(score.result)
}

main()
