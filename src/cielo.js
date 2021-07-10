const header = 'Basic NTczOGMyZGYtYzY2Ni00Y2NmLWFjYTItOTFiOGE4YTA2ODk3OlB2ak1XQVpTM2lqajExdGFMd1FDMjlzQU0wTjJ3SFBZMlZCTW9pNjloejQ9';
const axios = require('axios');

async function getAuth() {
  try {
    const response = await axios.post('https://cieloecommerce.cielo.com.br/api/public/v2/token', {}, { headers: {
    Authorization: header
  }})
  return response.data;
  } catch (error) {
    console.log(error)
  }
}

async function generateAuth() {
  const auth = await getAuth()
  return auth;
}


async function createLink(order, token) {
  try {
    const response = await axios.post('https://cieloecommerce.cielo.com.br/api/public/v1/products/', order, { headers: { Authorization: `Bearer ${token}` } } );
    return response.data;
  } catch (error) {
    console.log(error);
  }

}

module.exports = { generateAuth, createLink }