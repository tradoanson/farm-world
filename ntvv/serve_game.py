"""Serve the game without exposing local references, logs or saves."""
import argparse
import re
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
GAME_FILES = frozenset({
    "/index.html", "/style.css", "/audio.js", "/game.js",
    "/game-rules.js", "/Hinh_anh_can_cu.jpg",
})
ART_PATH = re.compile(r"/scene-art/[a-zA-Z0-9-]+\.png")


class GameHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.allow():
            super().do_GET()

    def do_HEAD(self):
        if self.allow():
            super().do_HEAD()

    def allow(self):
        path = unquote(urlsplit(self.path).path)
        if path == "/":
            self.path = "/index.html"
            return True
        if path in GAME_FILES or ART_PATH.fullmatch(path):
            return True
        self.send_error(404)
        return False


def main():
    parser = argparse.ArgumentParser(description="Serve Nông Trại Vui Vẻ")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--lan", action="store_true", help="Allow access on your local network")
    parser.add_argument("--open", action="store_true", help="Open the game in a browser")
    args = parser.parse_args()
    address = "0.0.0.0" if args.lan else "127.0.0.1"
    with ThreadingHTTPServer((address, args.port), GameHandler) as server:
        url = f"http://localhost:{server.server_port}/"
        print(f"Nông Trại Vui Vẻ: {url}", flush=True)
        if args.lan:
            print(f"Điện thoại cùng Wi-Fi: http://<IP-máy-tính>:{server.server_port}/", flush=True)
        if args.open:
            threading.Thread(target=webbrowser.open, args=(url,), daemon=True).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
