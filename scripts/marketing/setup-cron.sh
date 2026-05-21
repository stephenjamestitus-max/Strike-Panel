#!/bin/bash
# StrikePanel Instagram Automation — Cron Setup
# Run once: bash scripts/marketing/setup-cron.sh

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
NODE="$(which node)"
LOG="$REPO_DIR/marketing/automation.log"

echo "Setting up StrikePanel daily automation..."
echo "Repo: $REPO_DIR"
echo "Node: $NODE"
echo ""

# Create log directory
mkdir -p "$REPO_DIR/marketing/carousels"

# Add cron job: 8am Dubai (UTC+4) = 4am UTC
CRON_CMD="0 4 * * * cd $REPO_DIR && $NODE scripts/marketing/run-daily.js >> $LOG 2>&1"

# Check if already exists
if crontab -l 2>/dev/null | grep -q "run-daily.js"; then
  echo "Cron job already exists. Skipping."
else
  (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
  echo "Cron job added: runs daily at 8am Dubai time (4am UTC)"
fi

echo ""
echo "Done. Verify with: crontab -l"
echo "Logs will appear at: $LOG"
echo ""
echo "To run manually right now:"
echo "  node $REPO_DIR/scripts/marketing/run-daily.js"
