import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from "next";

export interface SimpleUser {
    username: string;
}

export const ironOptions = {
    password: process.env.TOKEN_SECRET ?? "f15f51da3ec3253393126a69c14fc297092d41c02a0f53404b27d3e5550acf25",
    cookieName: "vthell/session",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
    },
};

export function withSession(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, ironOptions);
}

export function withSessionSSR<
    P extends {
        [key: string]: unknown;
    } = {
        [key: string]: unknown;
    }
>(handler: (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>>) {
    return withIronSessionSsr(handler, ironOptions);
}
