mod utils;
mod commands;

use tauri::{App, Runtime};
use tauri_plugin_window_state::StateFlags;

#[cfg(target_os = "windows")]
fn handlers() -> impl Fn(tauri::ipc::Invoke) -> bool  {
    tauri::generate_handler![
        commands::get_file_thumbnail,
        commands::get_audio_graph,
        commands::get_frame
    ]
}

#[cfg(not(target_os = "windows"))]
fn handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        commands::get_audio_graph,
        commands::get_frame
    ]
}

fn setup<R: Runtime>(app: &mut App<R>) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let mut window_builder = tauri::WebviewWindowBuilder::new(
        app,
        "main",
        tauri::WebviewUrl::App("index.html".into()),
    );

    if let Some(f) = std::env::args()
        .into_iter()
        .skip(1)
        .find(|f| !f.starts_with("-"))
    {
        window_builder = window_builder.initialization_script(format!(
            "window.openedFile = {:?}",
            f
        ));
    }

    window_builder
        .title("FFTrim")
        .min_inner_size(1050.0, 610.0)
        .inner_size(1050.0, 610.0)
        .transparent(true)
        .decorations(false)
        .visible(false)
        .build()
        .unwrap();

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    unsafe {
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }

    let builder = tauri::Builder::default();
    
    let plugin_window_state = tauri_plugin_window_state::Builder::new()
        .with_state_flags(
            StateFlags::SIZE
            | StateFlags::POSITION
            | StateFlags::MAXIMIZED
            | StateFlags::DECORATIONS
            | StateFlags::FULLSCREEN,
        ).build();

    builder
        .plugin(plugin_window_state)
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(handlers())
        .setup(setup)
        .run(tauri::generate_context!())
        .expect("Error while running aplication");
}
