# FUTURE BASELINE — FARM WORLD

Tên tệp chuẩn: `futurebaseline.md`. Đây là nhật ký kế hoạch **append-only**: mỗi lần phát triển PHẢI đọc toàn bộ nội dung hiện có, bổ sung một mục mới ở cuối, không xóa, không ghi đè mục cũ. Mục đã hoàn thành chỉ được đánh dấu qua mục cập nhật mới ở cuối; không tự ý thay đổi baseline đã chốt.

## Baseline 001 — 2026-11-20 — Đã chốt
- Mục tiêu dài hạn: webgame nông trại nhiều tài khoản, mỗi tài khoản có nông trại riêng, gameplay có thể mở rộng.
- Demo tĩnh chạy GitHub Pages; không ép triển khai Vercel, không yêu cầu máy chủ luôn bật.
- Stack định hướng: Next.js/React/TypeScript; PostgreSQL/Drizzle/Auth ở giai đoạn online; Phaser/isometric có thể triển khai sau khi kiểm chứng.
- Dữ liệu nhiều người chơi phải cô lập theo farm_id; hành động kinh tế do server xác nhận, idempotent, dùng giờ server và giao dịch an toàn.
- Không đưa bí mật vào client, không kết nối/xóa/reset DB production; giữ backward compatibility.
- Mỗi bản phát hành PHẢI cập nhật CHANGELOG.md, cập nhật phiên bản giao diện và package, có CI PASS và Pages PASS trước khi bàn giao.
- Mọi thay đổi baseline: thêm mục Baseline XXX mới ở cuối tệp này; ghi quyết định, lý do, tiêu chí nghiệm thu, tác động tương thích.

## Baseline 002 — 2026-11-20 — Tiếp nối V0.2.1
- Hoàn thiện responsive mobile: màn hình dọc 320–430px, ngang 568–932px, tablet và desktop; không tràn ngang; thao tác chạm đủ lớn; thông tin cây dễ đọc.
- Giữ nguyên save key `farm-world-v01b-save`, định dạng save version 1 và toàn bộ tiến độ V0.1B/V0.2.
- Trình tự phát triển tiếp theo (chưa tự động coi là đã triển khai):
  1. V0.3: nông trại isometric nguyên bản, chuyển đổi hiển thị không phá dữ liệu cũ; thêm tài sản đồ họa tự tạo, kiểm thử mobile.
  2. V0.4: inventory, cấp độ, nhiệm vụ và cân bằng kinh tế offline; migration save có version rõ ràng và test.
  3. V0.5: thiết kế tài khoản, xác thực, quyền farm_id, chống gian lận; chỉ triển khai online khi có backend phù hợp (GitHub Pages không chạy API).
  4. V0.6: cơ sở dữ liệu/migrations an toàn, server-authoritative actions, backup/restore, logging và thử nghiệm đa tài khoản.
- Gate nghiệm thu mỗi phiên bản: typecheck, lint, unit tests, production build, GitHub Pages deployment, thử trên iOS Safari và Android Chrome (thử tay nếu CI không có browser device).
- Quy tắc: không ghi đè kế hoạch; khi thay đổi ưu tiên hãy ghi Baseline 003 trở đi cùng lý do và hạng mục thay thế.

## Baseline 003 — 2026-11-20 — Chuẩn hóa tên tài liệu
- Tên tài liệu chính thức là `futurebaseline.md` (Markdown), thay cho phần mở rộng `.mb` nhập nhầm trước đây.
- Giữ nguyên toàn bộ Baseline 001 và 002, tiếp tục bổ sung mục mới ở cuối; không ghi đè lịch sử.
- File `.mb` cũ được giữ làm dấu vết lịch sử, không sử dụng để cập nhật kế hoạch mới.

## Baseline 004 — 2026-11-20 — Thực hiện V0.3A
- Quyết định: ưu tiên cảnh isometric CSS nhẹ và chuyển đổi về chế độ cổ điển; chưa đưa Phaser vào runtime nhằm giữ GitHub Pages nhẹ, tránh phá gameplay hiện có.
- Phạm vi V0.3A: hình thoi isometric, trang trí cảnh quan, hỗ trợ mobile, giữ nguyên logic và save V0.2.1.
- Tiêu chí nghiệm thu: typecheck, lint, tests, static Pages build/deploy PASS; chọn ô chính xác, không mất save; iOS Safari/Android Chrome cần kiểm thử tay.
- Tồn đọng tiếp nối V0.3B: hỗ trợ pan/zoom bằng cảm ứng và chuột, nâng cấp asset đồ họa nguyên bản, thử nghiệm thao tác trên thiết bị thật; V0.3C: tối ưu hiệu năng, accessibility và kiểm thử hồi quy.
- V0.4–V0.6 tiếp tục theo Baseline 002; không thay đổi hoặc ghi đè mục cũ.

## Baseline 005 — 2026-11-20 — Triển khai V0.3B
- Thực hiện camera pan/zoom ở lớp giao diện, không sửa luật nông trại hay định dạng save; giữ lựa chọn hiển thị Cổ điển.
- Điều khiển: một pointer kéo; hai pointer pinch; Ctrl + wheel; nút zoom và reset. Giới hạn zoom 0.65–2.0.
- Chống thao tác ngoài ý muốn: khi kéo/chụm không gieo hoặc thu hoạch.
- Gate bắt buộc: CI + Pages PASS; kiểm thử thực tế iOS Safari và Android Chrome là công việc nghiệm thu còn mở.
- Tiếp nối V0.3C: thử nhiều kích cỡ màn hình, kiểm tra chạm/drag/zoom, tối ưu accessibility, hiệu năng, cải thiện đồ họa tự tạo và regression tests. V0.4–V0.6 tiếp tục theo Baseline 002.

## Baseline 006 — 2026-11-20 — Hoàn thiện mã nguồn V0.3C
- Mục tiêu: hoàn thiện thao tác mobile, khả năng truy cập, hiệu năng và hồi quy sau V0.3B mà không thay đổi gameplay hoặc dữ liệu lưu.
- Đã triển khai: chặn click ngoài ý muốn sau gesture; hàm camera có unit test; responsive màn hình nhỏ; cải thiện xuất backup và focus.
- Nghiệm thu bắt buộc: CI typecheck/lint/tests/build và Pages PASS; thử thực tế iOS Safari/Android Chrome (pan, pinch, tap, reload, export/import) vẫn phải xác nhận bằng thiết bị thật.
- Giới hạn: isometric vẫn là CSS/emoji prototype, chưa phải sprite asset chất lượng thương mại; chưa có tài khoản hoặc cloud.
- Mục tiêu kế tiếp V0.4: kho vật phẩm, kinh nghiệm/cấp độ, nhiệm vụ, cân bằng kinh tế và save migration an toàn. Giữ Baseline 001–005, không ghi đè.

## Baseline 007 — 2026-11-20 — Triển khai V0.4 offline economy
- Thêm kho nông sản, XP/cấp độ, nhiệm vụ một lần và bán sản phẩm; không thay đổi dữ liệu V1 nông trại, bổ sung progression version 2 ở key riêng.
- Chính sách tương thích: giữ vàng, ô đất, tiến độ cũ; JSON backup V2 chứa cả farm/progression và nhập được JSON V1. Không reset DB hay đụng hệ thống online.
- Kiểm thử: migration, giá bán, chống nhận thưởng lặp, CI typecheck/lint/tests/build, GitHub Pages và iOS Safari/Android Chrome thực tế.
- Quyết định tiếp theo V0.5: thiết kế đăng nhập, cô lập nông trại theo tài khoản và quyền truy cập; GitHub Pages chỉ demo offline, không giả lập bảo mật backend.

## Baseline 008 — 2026-11-20 — V0.5 nền tảng tài khoản an toàn
- Chọn hướng V0.5 là hợp đồng bảo mật + kiến trúc + kiểm thử và minh bạch chế độ Khách offline, không triển khai login giả trên GitHub Pages.
- Bắt buộc xác thực bằng backend và kiểm tra owner_id/farm_id trên mọi API; session bảo mật, chống CSRF/rate limit, idempotent requestId, giao dịch kinh tế và thời gian server.
- Không đổi save V1/progression V2; dữ liệu hiện tại không bị reset hoặc tự động đẩy lên mạng.
- Gate: typecheck/lint/tests/build/Pages PASS và thử mobile; chưa được tuyên bố online multiplayer cho đến khi có backend V0.6.
- V0.6: chọn hosting API/identity/PostgreSQL, additive migrations, kiểm thử hai tài khoản cô lập, backup/rollback, server-authoritative actions và audit.

## Baseline 009 — 2026-11-20 — V0.6 backend foundation
- Migration additive và API đọc theo owner đã viết nhưng chưa triển khai backend/DB; API mutation fail-closed 501.
- Không tuyên bố có multiplayer hoặc đồng bộ thật. Không reset DB hoặc thay đổi save offline.
- Gate online: identity provider, staging DB, backend host, giao dịch kinh tế server-authoritative, idempotency, test cô lập 2 tài khoản, backup/rollback.
- CI/Pages chỉ xác minh demo offline. Tiếp tục append-only.
