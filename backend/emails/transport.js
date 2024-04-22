const axios = require("axios");
const assert = require("assert");

const from = process.env.MAILGUN_FROM_EMAIL;
assert.ok(from);

const domain = process.env.MAILGUN_DOMAIN;
assert.ok(domain);

const privateKey = process.env.MAILGUN_PRIVATE_KEY;
assert.ok(privateKey);

exports.sendMail = async function sendMail(params) {
  const url = `https://api.mailgun.net/v3/${domain}/messages`;

  try {
    const { data } = await axios(
      url,
      {
        method: 'post',
        params: params,
        auth: {
          username: 'api',
          password: privateKey
        }
      }
    );
    if (data && data.message) {
      return data.message;
    }
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      throw new Error(`Error sending email: ${error.response.data} (status code ${error.response.status})`);
    }
    throw error;
  }
};
