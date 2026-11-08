FROM node:24.11.1-bookworm-slim
ARG CODEX_VERSION=0.166.0-alpha.6
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global @openai/codex@${CODEX_VERSION}
WORKDIR /opt/hcg
COPY scripts/pr-policy.mjs ./scripts/pr-policy.mjs
COPY scripts/autonomy ./scripts/autonomy
COPY infra/autonomy ./infra/autonomy
USER 1000:1000
WORKDIR /workspace
ENTRYPOINT ["node","/opt/hcg/scripts/autonomy/entry.mjs"]
