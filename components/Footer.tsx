import React from "react";

export default function Footer() {
    const commit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "(Dev Mode)";

    return (
        <footer className="border-t border-gray-700 text-gray-400 text-center py-6">
            <p>Made with ❤ by N4O#8868</p>
            <small>
                Source code are available at{" "}
                <a
                    className="text-green-500 hover:opacity-70 transition-opacity duration-200"
                    href="https://github.com/noaione/vthell-ui/"
                >
                    GitHub
                </a>
            </small>
            <p>
                <small>
                    {commit && (
                        <>
                            Commit:{" "}
                            <a
                                className="text-green-500 hover:opacity-70 transition-opacity duration-200"
                                href={
                                    commit === "(Dev Mode)"
                                        ? "#"
                                        : `https://github.com/noaione/vthell-ui/commit/${commit}`
                                }
                            >
                                {commit === "(Dev Mode)" ? commit : commit.slice(0, 7)}
                            </a>
                        </>
                    )}
                </small>
            </p>
        </footer>
    );
}
