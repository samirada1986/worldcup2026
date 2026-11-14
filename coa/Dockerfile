# COA backend — runs anywhere Docker runs (Render, Koyeb, Fly, Cloud Run, a VPS…).
# Zero dependencies, so the image is tiny and the build is instant.
FROM node:20-alpine

WORKDIR /app
COPY . .

# Hosts set $PORT; the server already reads it (defaults to 3000).
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
