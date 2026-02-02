use tauri_plugin_shell::ShellExt;

use crate::utils;
use std::path::Path;

#[tauri::command]
pub async fn get_frame(
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
        "-s",
        &resolution,
        "-c:v",
        "webp",
        "-f",
        "image2pipe",
        "-",
    ]);

    let (rx, mut _child) = sidecar_command.spawn().expect("failed to spawn");
    let buffer = utils::read_rx_stdout(rx).await?;

    Ok(buffer)
}

#[tauri::command]
pub async fn get_file_thumbnail(_app: tauri::AppHandle, path: String) -> Result<Vec<u8>, String> {
    let bitmap = utils::get_thumbnail_bitmap(&path, 480).map_err(|err| err.message())?;
    let bytes = utils::get_bitmap_bytes(bitmap)?;

    Ok(bytes)
}

#[tauri::command]
pub async fn get_audio_graph(app: tauri::AppHandle, video_path: String) -> Result<Vec<u8>, String> {
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
    let buffer = utils::read_rx_stdout(rx).await?;

    Ok(buffer)
}
