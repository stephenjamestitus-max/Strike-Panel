require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const zernio = require('./zernio-client');

async function test() {
  console.log('=== Zernio Connection Test ===\n');

  // 1. List accounts
  const accounts = await zernio.listAccounts();
  console.log(`Connected accounts: ${accounts.length}`);
  accounts.forEach(a => console.log(`  ${a.platform} — @${a.username} — ID: ${a._id} — ${a.followersCount} followers`));

  // 2. Test scheduling a post (saves as draft if no publishNow)
  console.log('\nCreating draft post...');
  const draft = await zernio.createDraft({
    content: 'Test draft from StrikePanel automation. Ignore this.',
  });
  console.log('Draft created:', draft?._id || JSON.stringify(draft));

  console.log('\nAll good. Automation is wired up and ready.');
}

test().catch(e => {
  console.error('Failed:', e.message);
  if (e.response) console.error('Response:', JSON.stringify(e.response?.data || e.response, null, 2));
  process.exit(1);
});
