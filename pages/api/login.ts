import { NextApiRequest, NextApiResponse } from "next";

import crypto from "crypto";
import { withSession } from "@/lib/session";

function validatePassword(input: string) {
    if (typeof input !== "string") return false;
    const compareTo = process.env.VTHELL_PASSWORD;
    if (typeof compareTo !== "string") {
        return true;
    }
    if (compareTo.trim().length < 1) {
        return true;
    }

    const hashedInput = crypto
        .pbkdf2Sync(input, process.env.TOKEN_SECRET ?? "1234567890", 1000, 32, "sha512")
        .toString("hex");
    return compareTo === hashedInput;
}

export default withSession(async (req: NextApiRequest, res: NextApiResponse) => {
    const { password } = await req.body;

    if (validatePassword(password)) {
        const user = { isLoggedIn: true, user: "admin" };
        // @ts-ignore
        req.session.user = user;
        await req.session.save();
        res.json(user);
    } else {
        res.status(401).json({ error: "wrong password" });
    }
});
