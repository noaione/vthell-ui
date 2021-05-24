import re
from datetime import datetime

import requests


class SchedulerError(Exception):
    def __init__(self, error):
        super().__init__(error)


class YoutubeScheduler:

    BASE_API = "https://www.googleapis.com/youtube/v3/"
    BASE_API += "videos?id={}&key={}"
    BASE_API += "&part=snippet%2Cstatus%2CliveStreamingDetails%2CcontentDetails"
    BASE_YT_WATCH = "https://www.youtube.com/watch?v="

    def __init__(self, url, api_key):
        self.id = None
        self.rgx1 = re.compile(r"http(?:s|)\:\/\/(?:www.|)youtu(?:.be|be\.com)\/")
        self.rgx2 = re.compile(r"watch\?v\=")
        self.streamweb = "YouTube"
        self.member_stream = False
        self.API_KEY = api_key
        self.__fetch_id(url)
        self.__check_apikey()

    def __fetch_id(self, url):
        if "ms." in url:
            url = url.replace("ms.", "")
            self.member_stream = True
        self.id = re.sub(self.rgx1, "", url)
        self.id = re.sub(self.rgx2, "", self.id)

    def __secure_filename(self):
        replacement = {
            "/": "／",
            ":": "：",
            "<": "＜",
            ">": "＞",
            '"': "”",
            "'": "’",
            "\\": "＼",
            "?": "？",
            "*": "⋆",
            "|": "｜",
            "#": "",
        }
        for k, v in replacement.items():
            self.filename = self.filename.replace(k, v)

    def __to_utc9(self, t: datetime) -> datetime:
        utc = t.timestamp() + (9 * 60 * 60)
        dtn = datetime.fromtimestamp(utc)
        return dtn

    def __check_apikey(self):
        if not self.API_KEY:
            raise SchedulerError("Owner hasn't setup YouTube Data API Key properly, please contact them.")

    def process(self):
        print("Requsting to API...")
        s = requests.get(self.BASE_API.format(self.id, self.API_KEY))
        if s.status_code != 200:
            SchedulerError("Failed fetching to the YouTube API, please try again later.")

        print("Processing...")
        res = s.json()

        snippets = res["items"][0]["snippet"]
        livedetails = res["items"][0]["liveStreamingDetails"]

        if "actualStartTime" in livedetails:
            start_time = livedetails["actualStartTime"]
        else:
            start_time = livedetails["scheduledStartTime"]
        title = snippets["title"]
        self.streamer = snippets["channelId"]

        try:
            dts = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            dts = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%SZ")
        self.start_time = dts.timestamp()
        dtymd = self.__to_utc9(dts).strftime("[%Y.%m.%d]")
        dtymd = dtymd[:-1] + ".{}]".format(self.id)
        self.filename = "{} {}".format(dtymd, title)
        self.__secure_filename()

    def dumps(self) -> dict:
        return {
            "id": self.id,
            "filename": self.filename,
            "startTime": self.start_time - 60,
            "streamer": self.streamer,
            "streamUrl": self.BASE_YT_WATCH + self.id,
            "type": "youtube",
            "memberOnly": self.member_stream,
            "isDownloading": False,
            "isDownloaded": False,
            "isPaused": False,
            "firstRun": True,
        }
