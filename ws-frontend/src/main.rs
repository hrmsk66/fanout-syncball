//! Default Compute@Edge template program.
use fastly::experimental::RequestUpgradeWebsocket;
use fastly::http::StatusCode;
use fastly::{mime, Error, Request, Response};

fn main() -> Result<(), Error> {
    let req = Request::from_client();
    match req.get_path() {
        // If request is to the `/` path...
        "/" => {
            Ok(Response::from_status(StatusCode::OK)
                .with_content_type(mime::TEXT_HTML_UTF_8)
                .with_body(include_str!("index.html")).send_to_client())
        },
        "/sketch.js" => {
            Ok(Response::from_status(StatusCode::OK)
                .with_content_type(mime::APPLICATION_JAVASCRIPT)
                .with_body(include_str!("sketch.js")).send_to_client())
        },
        "/p5.js" => {
            Ok(Response::from_status(StatusCode::OK)
                .with_content_type(mime::APPLICATION_JAVASCRIPT)
                .with_body(include_str!("p5.js")).send_to_client())
        },
        "/style.css" => {
            Ok(Response::from_status(StatusCode::OK)
                .with_content_type(mime::TEXT_CSS)
                .with_body(include_str!("style.css")).send_to_client())
        },
        _ => Ok(req.upgrade_websocket("kake-ws-backend")?)
    }
}
