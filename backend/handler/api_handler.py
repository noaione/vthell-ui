import glob
import os
from datetime import datetime, timezone
from urllib.parse import unquote

import ujson
from flask import Blueprint, current_app, jsonify, request
from nthelp.utils import open_json
from nthelp.yt_api import SchedulerError, YoutubeScheduler

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/")
def jobs_home():
    return jsonify({"utc": datetime.now(timezone.utc).timestamp() * 1000})


@api_bp.route("/echo")
def echo_back():
    return "OK"


@api_bp.route("/jobs", methods=["GET"])
def jobs_listing():
    old_data = request.args.get("fetched", "")
    old_data = [dd for dd in old_data.split(",") if dd]
    jobs_path = os.path.join(current_app.config["VTHELL_PATH"], "jobs", "*.json")
    jobs_list = glob.glob(jobs_path)
    if not jobs_list:
        return jsonify({"data": []}), 200
    streamer_data = current_app.streamer_data["yt"]
    streamer_data_bili = current_app.streamer_data["bili"]
    jobsdata = []
    for job in jobs_list:
        jobd = open_json(job)
        title = jobd["filename"]
        title = title[title.find("] ") + 2 :]
        beautf = datetime.fromtimestamp(jobd["startTime"] + 60).strftime("%a, %d %b %Y %H:%M:%S UTC")
        thumb = "https://i.ytimg.com/vi/{}/maxresdefault.jpg".format(jobd["id"])
        streamer_name = streamer_data.get(jobd["streamer"], {}).get("name", jobd["streamer"])
        if jobd["type"] == "bilibili":
            thumb = "https://mizore.ihateani.me/sa/BiliThumbPlaceholder.png"
            streamer_name = streamer_data_bili.get(jobd["streamer"], {}).get("name", jobd["streamer"])
        d = {
            "id": jobd["id"],
            "title": title,
            "url": jobd["streamUrl"],
            "streamer": streamer_name,
            "stats": {
                "recording": jobd["isDownloading"],
                "recorded": jobd["isDownloaded"],
                "paused": jobd["isPaused"],
                "member": jobd["memberOnly"] if "memberOnly" in jobd else False,
            },
            "type": jobd["type"],
            "thumb": thumb,
            "startTime": (jobd["startTime"] + 60) * 1000,
            "startTimeJS": beautf,
        }
        if jobd["id"] not in old_data:
            jobsdata.append(d)
    if jobsdata:
        jobsdata.sort(key=lambda x: x["startTime"])
    return jsonify({"data": jobsdata}), 200


@api_bp.route("/jobs", methods=["POST"])
def add_new_jobs():
    url = request.form.get("url", None)
    if not url:
        return jsonify({"message": "Please provide url", "status_code": 400}), 400

    url = unquote(url)

    password = request.form.get("passkey", None)
    if not password:
        return jsonify({"message": "Please provide password/passkey", "status_code": 403}), 403
    if password.strip() != current_app.config["VTHELL_PASSKEY"]:
        return jsonify({"message": "Unknown passkey/password", "status_code": 401}), 401
    callback_msg = request.form.get("callback", None)

    try:
        ytsc = YoutubeScheduler(url, current_app.config["YOUTUBE_DATA_API_KEY"])
        ytsc.process()
        data_dumps = ytsc.dumps()
    except SchedulerError as e:
        return jsonify({"message": str(e), "status_code": 403}), 403
    if callback_msg:
        data_dumps["discordCallback"] = callback_msg
    jobs_path = os.path.join(current_app.config["VTHELL_PATH"], "jobs", data_dumps["id"] + ".json")
    with open(jobs_path, "w", encoding="utf-8") as fp:
        ujson.dump(data_dumps, fp, indent=4)
    return jsonify({"message": "Jobs added!", "status_code": 200}), 200


@api_bp.route("/jobs", methods=["DELETE"])
def delete_job_data():
    jobs_id = request.form.get("id", None)
    if not jobs_id:
        return jsonify({"message": "Please provide id", "status_code": 400}), 400

    password = request.form.get("passkey", None)
    if not password:
        return jsonify({"message": "Please provide password/passkey", "status_code": 403}), 403
    if password.strip() != current_app.config["VTHELL_PASSKEY"]:
        return jsonify({"message": "Unknown passkey/password", "status_code": 401}), 401

    jobs_path = os.path.join(current_app.config["VTHELL_PATH"], "jobs", jobs_id + ".json")
    try:
        if os.path.isfile(jobs_path):
            os.remove(jobs_path)
    except OSError:
        return jsonify({"message": "jobs not found", "status_code": 404}), 404
    return jsonify({"message": "Deleted from server!", "status_code": 200}), 200


@api_bp.route("/jobs", methods=["PUT"])
def reload_job_data():
    url = request.form.get("url", None)
    if not url:
        return jsonify({"message": "Please provide url", "status_code": 400}), 400

    url = unquote(url)
    ytsc = YoutubeScheduler(url, current_app.config["YOUTUBE_DATA_API_KEY"])
    jobs_path = os.path.join(current_app.config["VTHELL_PATH"], "jobs", ytsc.id + ".json")
    old_data = open_json(jobs_path)
    if not old_data:
        return jsonify({"message": "jobs not found, please use POST request", "status_code": 404}), 404

    if old_data["isDownloading"] or old_data["isDownloaded"]:
        return jsonify(
            {
                "message": "cannot reload jobs, since it's currently being "
                "downloaded or already downloaded",
                "status_code": 403
            }
        ), 403

    try:
        ytsc.process()
        data_dumps = ytsc.dumps()
    except SchedulerError as e:
        return jsonify({"message": str(e), "status_code": 403}), 403
    if "discordCallback" in old_data:
        data_dumps["discordCallback"] = old_data["discordCallback"]
    with open(jobs_path, "w", encoding="utf-8") as fp:
        ujson.dump(data_dumps, fp, indent=4)
    return jsonify({"message": "Jobs reloaded!", "status_code": 200}), 200


@api_bp.route("/stats/<ids>")
def jobs_stats_api(ids=None):
    if not ids:
        return jsonify({"data": {}}), 200

    jobs_list = [dd for dd in ids.split(",") if dd]
    if not jobs_list:
        return jsonify({"data": {}}), 200
    final_data = {}
    for job in jobs_list:
        jbp = os.path.join(current_app.config["VTHELL_PATH"], "jobs", job + ".json")
        jobd = open_json(jbp)
        if not jobd:
            final_data[job] = {}
            continue
        final_data[job] = {
            "recording": jobd["isDownloading"],
            "recorded": jobd["isDownloaded"],
            "paused": jobd["isPaused"],
        }
    return jsonify({"data": final_data}), 200


@api_bp.route("/status/<ids>")
def jobs_status_api(ids=None):
    if not ids:
        return jsonify({"data": {}}), 200

    jobs_list = [dd for dd in ids.split(",") if dd]
    if not jobs_list:
        return jsonify({"data": {}}), 200

    final_data = {}
    streamer_data = current_app.streamer_data["yt"]
    streamer_data_bili = current_app.streamer_data["bili"]
    for job in jobs_list:
        jbp = os.path.join(current_app.config["VTHELL_PATH"], "jobs", job + ".json")
        job_data = open_json(jbp)
        if not job_data:
            final_data[job] = {}
            continue
        title = job_data["filename"]
        title = title[title.find("] ") + 2 :]
        streamer_name = streamer_data.get(job_data["streamer"], {}).get("name", job_data["streamer"])
        thumb = "https://i.ytimg.com/vi/{}/maxresdefault.jpg".format(job_data["id"])
        if job_data["type"] == "bilibili":
            thumb = "https://mizore.ihateani.me/sa/BiliThumbPlaceholder.png"
            streamer_name = streamer_data_bili.get(job_data["streamer"], {}).get("name", job_data["streamer"])
        parsed_data = {
            "id": job_data["id"],
            "title": title,
            "url": job_data["streamUrl"],
            "streamer": streamer_name,
            "streamer_id": job_data["streamer"],
            "stats": {
                "recording": job_data["isDownloading"],
                "recorded": job_data["isDownloaded"],
                "paused": job_data["isPaused"],
                "member": job_data["memberOnly"] if "memberOnly" in job_data else False,
            },
            "type": job_data["type"],
            "thumb": thumb,
            "startTime": job_data["startTime"] + 60,
        }
        if "discordCallback" in job_data:
            parsed_data["discordCallback"] = job_data["discordCallback"]
        final_data[job] = parsed_data

    return jsonify({"data": final_data}), 200
