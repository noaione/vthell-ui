import os

from flask import Blueprint, current_app, jsonify
from nthelp.utils import open_json

apirec_bp = Blueprint("api_record", __name__, url_prefix="/api")


@apirec_bp.route("/records")
def fetch_recorded_streams_api():
    try:
        rec_dump = os.path.join(current_app.config["VTHELL_PATH"], "recorded_streams.json")
        recorded_data = open_json(rec_dump)
        return jsonify(recorded_data)
    except Exception:
        return jsonify({"data": [], "last_update": -1, "total_size": -1}), 500
