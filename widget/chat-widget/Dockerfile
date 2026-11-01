# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

# Serve stage
FROM node:18 AS runner
WORKDIR /app
RUN yarn global add serve
COPY --from=builder /app/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]