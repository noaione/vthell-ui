from os.path import isfile

import ujson


def open_json(path) -> dict:
    if not isfile(path):
        return {}
    with open(path, "r", encoding="utf-8") as fp:
        return ujson.load(fp)
