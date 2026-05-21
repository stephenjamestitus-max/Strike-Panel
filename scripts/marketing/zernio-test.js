require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Zernio } = require('@zernio/node');

async function test() {
  const z = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });
  console.log('Testing Zernio connection...\n');

  const result = await z.accounts.listAccounts();
  console.log('Raw response:', JSON.stringify(result, null, 2));
}

test().catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
