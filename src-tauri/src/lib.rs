use std::path::Path;
use tauri::async_runtime::Receiver;
use tauri_plugin_shell::{ShellExt, process::CommandEvent};
use tauri_plugin_window_state::StateFlags;

async fn read_stdout(mut rx: Receiver<CommandEvent>) -> Result<Vec<u8>, String> {
    let mut buffer: Vec<u8> = Vec::with_capacity(18_000);

    let now = std::time::Instant::now();
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line_bytes) = event {
            buffer.extend_from_slice(&line_bytes);
        }
    }

    println!("Time taken: {:?}", now.elapsed());

    Ok(buffer)
}

#[tauri::command]
async fn get_frame(
    app: tauri::AppHandle,
    video_path: String,
    time: String,
    resolution: String,
) -> Result<Vec<u8>, String> {
    if !Path::new(&video_path).exists() {
        return Err("Video not found".to_string());
    }

    let sidecar_command = app.shell().sidecar("ffmpeg").unwrap();
    let sidecar_command = sidecar_command.args([
        "-ss",
        &time,
        "-i",
        &video_path,
        "-frames:v",
        "1",
        "-fflags",
        "nobuffer",
        "-s",
        &resolution,
        "-c:v",
        "webp",
        "-f",
        "image2pipe",
        "-",
    ]);

    let (rx, mut _child) = sidecar_command.spawn().expect("failed to spawn");
    let buffer = read_stdout(rx).await?;

    Ok(buffer)
}

#[tauri::command]
async fn create_thumbnail(app: tauri::AppHandle, video_path: String) -> Result<Vec<u8>, String> {
    if !Path::new(&video_path).exists() {
        return Err("Video not found".to_string());
    }

    let sidecar_command = app.shell().sidecar("ffmpeg").unwrap();
    let sidecar_command = sidecar_command.args([
        "-y",
        "-ss",
        "00:00:04",
        "-i",
        &video_path,
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-loglevel",
        "panic",
        "-s",
        "480x320",
        "-",
    ]);

    let (rx, mut _child) = sidecar_command.spawn().expect("failed to spawn");
    let buffer = read_stdout(rx).await?;

    Ok(buffer)
}

#[tauri::command]
async fn get_audio_graph(app: tauri::AppHandle, video_path: String) -> Result<Vec<u8>, String> {
    if !Path::new(&video_path).exists() {
        return Err("Video not found".to_string());
    }

    let sidecar_command = app.shell().sidecar("ffmpeg").unwrap();
    let sidecar_command = sidecar_command.args([
        "-i",
        &video_path,
        "-ac",
        "1",
        "-filter:a",
        "aresample=4000",
        "-map",
        "0:a",
        "-c:a",
        "pcm_s16le",
        "-loglevel",
        "panic",
        "-f",
        "data",
        "-",
    ]);

    let (rx, mut _child) = sidecar_command.spawn().expect("failed to spawn");
    let buffer = read_stdout(rx).await?;

    Ok(buffer)
}

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
            create_thumbnail,
            get_audio_graph,
            get_frame
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
