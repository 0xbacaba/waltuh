FROM rust:1.84 AS cargobuilder

WORKDIR /app

COPY src/ ./src/
COPY Cargo.lock Cargo.toml ./
RUN cargo build --release

FROM node:alpine3.20 AS tscbuilder
WORKDIR /app
RUN npm install typescript
COPY frontend ./frontend
RUN cd frontend && npx tsc

FROM debian:bookworm-slim
WORKDIR /app

COPY --from=cargobuilder /app/target/release/waltuh ./waltuh
COPY --from=tscbuilder /app/frontend/static ./frontend/static

CMD [ "/app/waltuh" ]
