# VTHell WebUI (Backend)

The backend code for VTHell WebUI

## Preparing
1. Make sure you already have VTHell setup
2. Copy the config.json.example file and adjust it to what you have
3. Create a new virtualenv named `venv`
4. Activate/Enter that virtualenv
5. Run `app.py`

It will expose port `35608` to localhost

## Recording list
To use the `/api/records` route, you need to generate a `recorded_streams.json` on the VTHell folder.

It's already made easy with the `fetch_recording.py`, you just need to run every X hour with `cron`.

Make sure you configured the `config.json` properly.

## Config
```json
{
    "vthell": {
        "path": "/path/to/vthell",
        "rclone_path": "rclone",
        "gdrive_path": "drive:VTuberHell"
    },
    "secret": "pleasechangethis",
    "ytapi_key": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

the vthell key contains the some more keys:
- `path` will be where your vthell program located
- `rclone_path` will be where your rclone binary located
- `stream_folder` will be the `Stream Archive` folder of your Google Drive folder.

`secret` will be your password to access add/delete route.<br>
`ytapi_key` will be your Youtube v3 API Key.

A sample completed Config would look like this
```json
{
    "vthell": {
        "path": "/home/n4o/vthell",
        "rclone_path": "rclone",
        "gdrive_path": "naoGDrive:VTuberHell"
    },
    "secret": "mysupersecretauthpassword",
    "ytapi_key": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```
