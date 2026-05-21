require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const zernio = require('./zernio-client');

async function test() {
  console.log('Testing Zernio connection...\n');

  const accounts = await zernio.listAccounts();
  console.log(`Connected accounts (${accounts.length}):`);
  for (const a of accounts) {
    console.log(`  ${a.platform} — ID: ${a._id} — @${a.username || a.handle || a.name || '?'}`);
  }

  const igId = await zernio.getInstagramAccountId();
  console.log(`\nInstagram account ID: ${igId}`);
  console.log('\nConnection OK. Save this ID to .env as ZERNIO_INSTAGRAM_ID=' + igId);
}

test().catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
