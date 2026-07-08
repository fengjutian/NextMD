#[tauri::command]
fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn maximize_window(window: tauri::Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      minimize_window,
      maximize_window,
      close_window,
    ])
    .setup(|app| {
      // Set window icon from embedded PNG
      let icon_bytes = include_bytes!("../icons/icon.png");
      if let Ok(img) = image::load_from_memory(icon_bytes) {
        let rgba = img.into_rgba8();
        let icon = tauri::image::Image::new_owned(
          rgba.into_raw(),
          rgba.width(),
          rgba.height(),
        );
        if let Some(window) = app.get_webview_window("main") {
          let _ = window.set_icon(icon);
        }
      }
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
