use actix_files as fs;
use actix_web::{App, HttpServer};

mod game;

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    HttpServer::new(|| {
        App::new()
            .service(fs::Files::new("/", "./frontend/static")
                .index_file("index.html"))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
