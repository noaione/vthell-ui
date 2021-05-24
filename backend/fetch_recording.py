import copy
import json
import logging
import os
import pathlib
import random
import string
import subprocess as sp
import sys
from datetime import datetime, timezone

from nthelp.utils import open_json


def convert_time(modtime: str) -> int:
    dts = datetime.strptime(modtime, "%Y-%m-%dT%H:%M:%S.%fZ")
    return round(dts.timestamp())


BASE_PATH = str(pathlib.Path(__file__).parent.absolute())
CONFIG_PATH = os.path.join(BASE_PATH, "config.json")
if not os.path.isfile(CONFIG_PATH):
    print("==> No config.json detected!")
    sys.exit(1)
CONFIG = open_json(CONFIG_PATH)

RCLONE_BASE_FOLDER = CONFIG["vthell"]["gdrive_path"]
RCLONE_BINARY = CONFIG["vthell"]["rclone_path"]
BASE_VTHELL_PATH = CONFIG["vthell"]["path"]

# You can modify this
INCLUDED_SUBFOLDER = [
    "Stream Archive",
    "Member-Only Stream Archive",
    "Archival",
    "Cover Songs",
    "Stream Chat Archive"
]

logging.basicConfig(
    level=logging.DEBUG,
    handlers=[
        logging.FileHandler(
            os.path.join(BASE_VTHELL_PATH, "nvthell.log"), "a", "utf-8"
        )
    ],
    format="%(asctime)s %(name)-1s -- [%(levelname)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
vtlog = logging.getLogger("vtrecorded")
console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.INFO)

formatter1 = logging.Formatter("[%(levelname)s]: %(message)s")
console.setFormatter(formatter1)
vtlog.addHandler(console)

vtlog.info("==> Fetching Recording from Google Drive...")
json_data = []
for subfolder in INCLUDED_SUBFOLDER:
    MAIN_FOLDER = RCLONE_BASE_FOLDER
    if RCLONE_BASE_FOLDER.endswith("/"):
        MAIN_FOLDER += subfolder
    else:
        MAIN_FOLDER += "/" + subfolder
    vtlog.info(f"=> Fetching path: {MAIN_FOLDER}")
    process = sp.Popen(
        [RCLONE_BINARY, "lsjson", "-R", MAIN_FOLDER], stdout=sp.PIPE
    )
    stdout = process.communicate()[0]
    vtlog.info("=> Reading data...")
    stdout = stdout.decode("utf-8").rstrip("\n")
    subfolder_data = json.loads(stdout, encoding="utf-8")
    for files in subfolder_data:
        copy_files = copy.deepcopy(files)
        copy_files["Path"] = subfolder + "/" + copy_files["Path"]
        json_data.append(copy_files)

print("==> Sorting everything...")
json_data.sort(key=lambda x: x["Path"])


def find_node(dataset, name):
    for idx, data in enumerate(dataset):
        if name == data["name"]:
            return idx
    return -1


def rng_string(length: int = 8):
    letters = string.ascii_letters + string.digits
    return "".join(random.choice(letters) for _ in range(length))


def hash_id(ids):
    first_4 = ids[0:4]
    randomized = rng_string()
    return first_4 + randomized


file_base = {
    "id": "vthell",
    "name": "VTuberHell",
    "type": "folder",
    "toggled": True,
    "children": [],
}
print(f"==> Parsing raw data into a tree format, total {len(json_data)}")
total_size = 0
for data in json_data:
    folders = data["Path"].split("/")
    if data["IsDir"] and len(folders) == 1:
        file_base["children"].append({
            "id": hash_id(data["ID"]),
            "name": data["Path"],
            "type": "folder",
            "toggled": True,
            "children": []
        })
        continue
    folders, files = folders[:-1], folders[-1]
    use_ = file_base
    for folder in folders:
        node_idx = find_node(use_["children"], folder)
        if node_idx == -1:
            use_["children"].append({
                "id": hash_id(data["ID"]),
                "name": folder,
                "type": "folder",
                "children": []
            })
            node_idx = find_node(use_["children"], folder)
            use_ = use_["children"][node_idx]
            continue
        use_ = use_["children"][node_idx]
    if data["IsDir"]:
        use_["children"].append({
            "id": hash_id(data["ID"]),
            "name": files,
            "type": "folder",
            "children": []
        })
    else:
        total_size += data["Size"]
        sub_data = {
            "id": hash_id(data["ID"]),
            "name": files,
            "type": "file",
            "size": data["Size"],
            "mimetype": data["MimeType"],
            "modtime": convert_time(data["ModTime"])
        }
        use_["children"].append(sub_data)


current_time = int(round(datetime.now(timezone.utc).timestamp()))
proper_format = {
    "data": file_base,
    "last_updated": current_time,
    "total_size": total_size,
}
vtlog.info("==> Saving to json file...")
with open(os.path.join(BASE_VTHELL_PATH, "recorded_streams.json"), "w", encoding="utf-8") as fp:
    json.dump(proper_format, fp, indent=4, ensure_ascii=False)
