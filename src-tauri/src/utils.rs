use std::io::Cursor;

use image::{DynamicImage, RgbaImage};
use tauri::async_runtime::Receiver;
use tauri_plugin_shell::process::CommandEvent;
use windows::{
    Win32::{
        Foundation::SIZE,
        Graphics::Gdi::{
            BI_RGB, BITMAP, BITMAPINFO, BITMAPINFOHEADER, DIB_RGB_COLORS, GetDC, GetDIBits,
            GetObjectW, HBITMAP, ReleaseDC,
        },
        UI::Shell::{
            IShellItem, IShellItemImageFactory, SHCreateItemFromParsingName, SIIGBF_BIGGERSIZEOK,
            SIIGBF_RESIZETOFIT,
        },
    },
    core::{Interface, PCWSTR},
};

pub fn get_thumbnail_bitmap(path: &str, size: i32) -> windows::core::Result<HBITMAP> {
    let wide: Vec<u16> = path.encode_utf16().chain(Some(0)).collect();

    let shell_item: IShellItem =
        unsafe { SHCreateItemFromParsingName(PCWSTR(wide.as_ptr()), None)? };

    let factory: IShellItemImageFactory = shell_item.cast()?;

    let size = SIZE { cx: size, cy: size };

    // Flags:
    // - ResizeToFit: keeps aspect ratio
    // - BiggerSizeOk: allows larger source images
    let flags = SIIGBF_RESIZETOFIT | SIIGBF_BIGGERSIZEOK;

    unsafe { factory.GetImage(size, flags) }
}

pub fn get_bitmap_bytes(hbitmap: HBITMAP) -> Result<Vec<u8>, String> {
    let mut bmp: BITMAP = unsafe { std::mem::zeroed() };

    unsafe {
        GetObjectW(
            hbitmap.into(),
            std::mem::size_of::<BITMAP>() as i32,
            Some(&mut bmp as *mut BITMAP as *mut std::ffi::c_void),
        );
    }

    let width = bmp.bmWidth;
    let height = bmp.bmHeight;

    let mut bmi = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER {
            biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
            biWidth: width,
            biHeight: -height, // top-down bitmap
            biPlanes: 1,
            biBitCount: 32,
            biCompression: BI_RGB.0,
            ..Default::default()
        },
        ..Default::default()
    };

    let mut buffer = vec![0u8; (width * height * 4) as usize];

    let hdc = unsafe { GetDC(None) };

    let res = unsafe {
        GetDIBits(
            hdc,
            hbitmap,
            0,
            height as u32,
            Some(buffer.as_mut_ptr() as _),
            &mut bmi,
            DIB_RGB_COLORS,
        )
    };

    if res == 0 {
        return Err("Failed to get bitmap bytes (GetDIBits)".to_string());
    }

    unsafe { ReleaseDC(None, hdc) };

    for px in buffer.chunks_exact_mut(4) {
        px.swap(0, 2);
    }

    let rgba = RgbaImage::from_raw(width as u32, height as u32, buffer).unwrap();

    let mut png_bytes = Vec::new();

    DynamicImage::ImageRgba8(rgba)
        .write_to(&mut Cursor::new(&mut png_bytes), image::ImageFormat::Png)
        .unwrap();

    Ok(png_bytes)
}

pub async fn read_rx_stdout(mut rx: Receiver<CommandEvent>) -> Result<Vec<u8>, String> {
    let mut buffer: Vec<u8> = Vec::with_capacity(64_000);

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line_bytes) = event {
            buffer.extend_from_slice(&line_bytes);
        }
    }

    Ok(buffer)
}
