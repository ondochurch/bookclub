#!/usr/bin/env python3
"""개발용 정적 서버 — 캐시를 끈다.

python3 -m http.server 는 Cache-Control을 아예 안 보내서, 브라우저(특히 Safari)가
Last-Modified 기반으로 알아서 캐시한다. 그래서 styles.css / bookclub-data.js를 고쳐도
새로고침이 옛 파일을 계속 물고 와, 고친 게 반영이 안 된 것처럼 보인다.
프라이빗 창에서만 제대로 보이면 십중팔구 이 문제다.

    python3 serve.py           # http://localhost:8000
    python3 serve.py 8001      # 포트 지정
"""

import sys
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_head(self):
        # send_head()가 If-Modified-Since를 보고 304를 돌려주면 브라우저는 캐시본을 그대로 쓴다.
        # 조건부 요청 헤더를 지워서 항상 본문을 새로 보내게 한다.
        del self.headers['If-Modified-Since']
        del self.headers['If-None-Match']
        return super().send_head()

    # Last-Modified를 안 보내야 브라우저가 heuristic 캐싱을 하지 않는다
    def send_header(self, keyword, value):
        if keyword.lower() == 'last-modified':
            return
        super().send_header(keyword, value)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(NoCacheHandler, directory='docs')
    print(f'http://localhost:{port}  (docs/ 서빙, 캐시 비활성)')
    try:
        ThreadingHTTPServer(("", port), handler).serve_forever()
    except KeyboardInterrupt:
        print()
