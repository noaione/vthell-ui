declare global {
    namespace NodeJS {
        interface Global {
            portalNumber?: number;
        }

        interface ProcessEnv {
            NEXT_PUBLIC_WS_URL?: string;
            NEXT_PUBLIC_HTTP_URL?: string;
            NEXT_PUBLIC_ARCHIVE_URL?: string;
            VTHELL_PASSWORD?: string;
        }
    }
}
