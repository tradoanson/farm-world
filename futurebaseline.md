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
