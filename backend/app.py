import os
import sys
import pathlib

from flask import Flask, request, Response

from handler.api_handler import api_bp
from handler.recorded_list import apirec_bp
from nthelp.utils import open_json


BASE_PATH = str(pathlib.Path(__file__).parent.absolute())
CONFIG_PATH = os.path.join(BASE_PATH, "config.json")
if not os.path.isfile(CONFIG_PATH):
    print("==> No config.json detected!")
    sys.exit(1)
CONFIG = open_json(CONFIG_PATH)

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = True
app.config["JSON_SORT_KEYS"] = False
app.config["VTHELL_PASSKEY"] = CONFIG["secret"]
app.config["VTHELL_PATH"] = CONFIG["vthell"]["path"]
app.config["YOUTUBE_DATA_API_KEY"] = CONFIG["ytapi_key"]

print("Preloading json data...")
streamer_data = open_json(app.config["VTHELL_PATH"] + "/dataset/_youtube_mapping.json")
streamer_data_bili = open_json(app.config["VTHELL_PATH"] + "/dataset/_bilibili_mapping.json")
app.streamer_data = {"yt": streamer_data, "bili": streamer_data_bili}


@app.after_request
def add_extra_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    if request.method == "OPTIONS":
        response.headers["Access-Control-Allow-Methods"] = "DELETE, GET, POST, PUT"
        headers = request.headers.get("Access-Control-Request-Headers")
        if headers:
            response.headers["Access-Control-Allow-Headers"] = headers
    return response


app.register_blueprint(api_bp)
app.register_blueprint(apirec_bp)


@app.route("/ping", methods=["GET", "HEAD"])
def ping_web():
    resp = Response()
    resp.headers.add("Content-Length", len("OK"))
    resp.headers.set("Content-Type", "text/plain; charset=utf-8")
    resp.status_code = 200
    if request.method == "HEAD":
        return resp
    resp.set_data("OK")
    return resp


if __name__ == "__main__":
    debug = False
    args = sys.argv[1:]
    if args:
        if args[0].strip() in ["--debug", "-D"]:
            debug = True
    app.run(host="0.0.0.0", debug=debug, port=35608)
