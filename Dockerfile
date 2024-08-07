FROM node:20-slim AS base

FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production



ARG DATABASE_URL
ARG HOST_NAME

ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ARG RESEND_FROM_EMAI
ARG EMAIL_SERVER_HOST
ARG EMAIL_SERVER_PORT
ARG EMAIL_SERVER_USER
ARG RESEND_API_KEY

ARG AWS_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_BUCKET_NAME

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/run.sh ./run.sh

RUN cd drizzle/migrate && npm i

WORKDIR /app

USER nextjs

EXPOSE 3000

ENV PORT=3000

ARG HOSTNAME

CMD ./run.sh