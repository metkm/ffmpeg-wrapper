use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use tauri_plugin_window_state::StateFlags;
use std::path::Path;

#[tauri::command]
async fn create_thumbnail(app: tauri::AppHandle, video_path: String) -> Result<Vec<u8>, String> {
    if !Path::new(&video_path).exists() {
        return Err("Video not found".to_string());
    }

    let sidecar_command = app.shell().sidecar("ffmpeg").unwrap();
    let sidecar_command = sidecar_command
        .args([
            "-y",
            "-ss", "00:00:04",
            "-i", &video_path,
            "-frames:v", "1",
            "-f", "image2pipe",
            "-loglevel", "panic",
            "-s", "480x320",
            "-"
        ]);

    let (mut rx, mut _child) = sidecar_command.spawn().expect("failed to spawn");

    let buffer = tauri::async_runtime::spawn(async move {
        let mut buffer: Vec<u8>= Vec::new();

        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                buffer.extend_from_slice(&line_bytes);
            }
        }

        buffer
    })
        .await
        .unwrap();

    Ok(buffer)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new()
            .with_state_flags(
                StateFlags::SIZE
                | StateFlags::POSITION
                | StateFlags::MAXIMIZED
                | StateFlags::DECORATIONS
                | StateFlags::FULLSCREEN
            )
        .build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_thumbnail])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
