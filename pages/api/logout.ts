import { NextApiRequest, NextApiResponse } from "next";

import { withSession } from "../../lib/session";

export default withSession(async (req: NextApiRequest, res: NextApiResponse) => {
    req.session.destroy();
    res.setHeader("cache-control", "no-store, max-age=0");
    res.json({ loggedIn: false });
});
