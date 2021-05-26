import axios, { AxiosResponse, Method } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import config from "../../package.json";
import { isNone } from "../../lib/utils";

const StatusCodeMessage = {
    400: "API received bad request, please fix your dumb request.",
    401: "You're unauthorized to access this API route.",
    403: "You're forbidden to access this API route.",
    404: "API route cannot be found.",
    405: "Method not allowed.",
    410: "API gone, *boooooo*",
    500: "An internal server occured occured",
    501: "API routes not implemented",
    502: "Gateway server can't established good connection with the Backend API",
    503: "API is most likely down, please make sure it's up",
    504: "Gateway server connection timeout, uh oh",
};

export default async function JobsAPI(req: NextApiRequest, res: NextApiResponse) {
    const { NEXT_PUBLIC_BACKEND_API_URL } = process.env;
    const bodyBag = await req.body;
    const { method } = req;
    try {
        const resp = await axios({
            url: `${NEXT_PUBLIC_BACKEND_API_URL}/api/jobs`,
            method: method as Method,
            data: JSON.stringify(bodyBag),
            responseType: "json",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": `VTHell-WebUI/${config.version} (https://github.com/noaione/vthell-ui)`,
            },
        });
        res.setHeader("X-API-Version", config.version);
        res.status(resp.status).json({ ...resp.data });
    } catch (err) {
        if (err.response) {
            const { data, status, headers } = err.response as AxiosResponse;
            const contentType = headers["content-type"] as string;
            if (contentType.startsWith("application/json")) {
                res.status(status || 500).json({
                    message: data.message || "Unknown API error occured.",
                    status_code: status || 500,
                });
            } else {
                const otherJsonMessage = StatusCodeMessage[status];
                if (isNone(otherJsonMessage)) {
                    res.status(status || 500).json({
                        message: "Unknown error occured, what the fuck did you do dood?",
                        status_code: status || 500,
                    });
                } else {
                    res.status(status || 500).json({ message: otherJsonMessage, status_code: status || 500 });
                }
            }
        } else {
            res.status(500).json({ message: err.toString(), success: false, status_code: 500 });
        }
    }
}
