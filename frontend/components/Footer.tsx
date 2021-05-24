import React from "react";

export default function Footer() {
    return (
        <footer className="border-t border-gray-700 text-gray-400 text-center py-6">
            <p>Made with ❤ by N4O#8868</p>
            <small>
                Source code on{" "}
                <a
                    className="text-green-500 hover:opacity-70 transition-opacity duration-200 "
                    href="https://github.com/noaione/vthell/"
                >
                    GitHub
                </a>
            </small>
        </footer>
    );
}
