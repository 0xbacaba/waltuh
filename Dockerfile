FROM rust:1.84 as cargobuilder

WORKDIR /app

COPY src/ ./src/
COPY Cargo.lock Cargo.toml ./
RUN ls && cargo build --release

FROM node:alpine3.20 as tscbuilder
WORKDIR /app
COPY frontend ./frontend
RUN npm install typescript
RUN cd frontend && npx tsc

FROM debian:bookworm-slim
WORKDIR /app

COPY --from=cargobuilder /app/target/release/waltuh ./waltuh
COPY --from=tscbuilder /app/frontend/static ./frontend/static

CMD [ "/app/waltuh" ]
