mod utils;
mod commands;

use tauri_plugin_window_state::StateFlags;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(
                    StateFlags::SIZE
                        | StateFlags::POSITION
                        | StateFlags::MAXIMIZED
                        | StateFlags::DECORATIONS
                        | StateFlags::FULLSCREEN,
                )
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_file_thumbnail,
            commands::get_audio_graph,
            commands::get_frame
        ])
        .setup(|app| {
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
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
