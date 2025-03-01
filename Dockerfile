###### Build rust source ######
FROM lukemathwalker/cargo-chef:0.1.71-rust-1.84 AS cargobuilder-base
WORKDIR /app

FROM cargobuilder-base AS cargobuilder-planner
COPY src/ ./src/
COPY Cargo.lock Cargo.toml ./
RUN cargo chef prepare --recipe-path recipe.json

FROM cargobuilder-base AS cargobuilder-out
COPY --from=cargobuilder-planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

COPY src/ ./src/
COPY Cargo.lock Cargo.toml ./
RUN cargo build --release


### Build typescript source ###
FROM node:alpine3.20 AS tscbuilder
WORKDIR /app
RUN npm install typescript
COPY frontend ./frontend
RUN cd frontend && npx tsc


########## Runtime ############
FROM debian:bookworm-slim
WORKDIR /app

COPY --from=cargobuilder-out /app/target/release/waltuh ./waltuh
COPY --from=tscbuilder /app/frontend/static ./frontend/static

CMD [ "/app/waltuh" ]
