#!/usr/bin/env bash
# Provision + configure the WingBuddy hosted Vocal Bridge agent.
# VOICE_BRIDGE_WINGBUDDY is an ACCOUNT key, so we create/select an agent and
# capture its id into VB_AGENT_ID (the server sends it as X-Agent-Id on the
# token mint). Re-run after editing prompts/ or config/.
#
# Usage:
#   pip install vocal-bridge
#   source ../.env.local   # or export VOICE_BRIDGE_WINGBUDDY / VB_AGENT_ID
#   ./scripts/vb-setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

GREETING='नमस्ते, मैं WingBuddy हूँ, एक AI सहायक। आपका परिवार हमारी बातचीत देख सकता है। बताइए, मैं आपकी क्या मदद करूँ? आप ठीक कर रहे हैं।'

: "${VOICE_BRIDGE_WINGBUDDY:?set VOICE_BRIDGE_WINGBUDDY}"
vb auth login "$VOICE_BRIDGE_WINGBUDDY"

if [ -n "${VB_AGENT_ID:-}" ]; then
  vb agent use "$VB_AGENT_ID"
else
  echo ">> No VB_AGENT_ID set — creating a new agent (paid plan required)."
  vb agent create \
    --name "WingBuddy" \
    --style "Focused" \
    --prompt-file prompts/agent_hi.md \
    --greeting "$GREETING" \
    --deploy-targets web \
    --model-settings-file config/model_settings.json \
    --client-actions-file config/client_actions.json
  echo ">> Capture the printed agent id into VB_AGENT_ID in .env.local, then re-run."
  exit 0
fi

# Apply prompt + config to the selected agent (idempotent).
vb prompt set --file prompts/agent_hi.md
vb prompt set --greeting --file <(printf '%s' "$GREETING")
vb config set --model-settings-file config/model_settings.json
vb config set --client-actions-file config/client_actions.json
# Bring-Your-Own-Agent: hosted agent delegates domain questions to our
# /api/agent (via the client's onAIAgentQuery) and speaks the reply verbatim.
vb config set --ai-agent-enabled true --ai-agent-verbatim true \
  --ai-agent-description "WingBuddy airport-assistance brain: flight status, rebooking, wheelchair (WCHR) SSR, and facilities. Replies with one calm Hindi sentence."

echo ">> Done. Verify with: vb config show"
