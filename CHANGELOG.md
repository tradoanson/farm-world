# CHANGELOG — Farm World

Lịch sử phiên bản được ghi nối tiếp, không xóa hoặc viết lại các mục đã phát hành. Mỗi bản mới thêm mục ở cuối, ghi ngày, thay đổi, tương thích dữ liệu và kết quả CI.

## V0.1A — 2026-11-20
- Prototype nông trại 8×8, 3 cây trồng, gieo/thu hoạch, tiền vàng.
- Thiết lập GitHub Pages static export và GitHub Actions CI.
- Dữ liệu chỉ tồn tại trong bộ nhớ khi chạy.

## V0.1B — 2026-11-20
- Tự lưu trên localStorage với khóa `farm-world-v01b-save`.
- Thời gian sinh trưởng và đếm ngược tự cập nhật; thêm cà chua và dâu tây.
- Thống kê cây đang lớn/đã chín; nút xóa tiến độ có xác nhận.
- Định dạng dữ liệu save: version 1.

## V0.2 — 2026-11-20
- Gieo hàng loạt trên ô trống, thu hoạch tất cả cây đã chín.
- Xuất và nhập bản sao JSON có kiểm tra định dạng, xác nhận ghi đè.
- Tách luật game offline ra `lib/farm-demo.ts`, thêm kiểm thử kinh tế và dữ liệu.
- Giữ nguyên khóa localStorage và định dạng save V0.1B.

## V0.2.1 — 2026-11-20
- Tối ưu giao diện mobile-first: thanh thông tin gọn, bố cục ưu tiên khu đất, thanh chọn hạt giống cuộn ngang, vùng bấm rõ ràng, ô đất và thời gian hiển thị phù hợp màn hình nhỏ.
- Cải thiện safe-area, cuộn ngang không tràn trang, giao diện ở chế độ ngang/dọc, hỗ trợ giảm chuyển động.
- Hiển thị số phiên bản và đường dẫn CHANGELOG / futurebaseline trên giao diện.
- Không thay đổi quy tắc kinh tế, dữ liệu lưu hoặc backend.
- Nghiệm thu CI/Pages: xem GitHub Actions của commit V0.2.1.

## V0.3A — 2026-11-20
- Thêm cảnh nông trại isometric CSS (các ô đất dạng hình thoi, cảnh quan trang trí nguyên bản bằng emoji/CSS), chuyển đổi Isometric/Cổ điển.
- Giữ nguyên logic gieo trồng, thu hoạch, đếm ngược, sao lưu và khóa lưu dữ liệu version 1; không thay đổi database.
- Responsive cho điện thoại, có chế độ cổ điển dự phòng để thao tác chính xác.
- Giới hạn: đây là bản isometric CSS đầu tiên, chưa phải scene Phaser/sprite chuyên nghiệp; chưa hỗ trợ kéo/zoom bản đồ. Kiểm thử thiết bị thật còn là gate thủ công.
- CI/Deploy: kiểm tra GitHub Actions tại commit V0.3A.

## V0.3B — 2026-11-20
- Điều khiển camera isometric: kéo bằng chuột hoặc một ngón tay, chụm hai ngón để phóng to/thu nhỏ; Ctrl + cuộn chuột để zoom.
- Thêm nút +/−, mức zoom 65–200%, nút đưa camera về giữa; chế độ Cổ điển giữ nguyên để dự phòng.
- Chặn thao tác gieo/thu hoạch khi đang kéo/chụm, không thay đổi logic kinh tế hoặc save version 1.
- Cải thiện CSS mobile và trang trí CSS/emoji nhẹ, không tải thêm asset bên ngoài.
- Gate: typecheck, lint, tests, static build, Pages; thử thao tác trên iOS Safari/Android Chrome thủ công.

## V0.3C — 2026-11-20
- Tăng độ an toàn khi kéo/chụm trên mobile: chặn click phát sinh sau gesture, tránh gieo/thu hoạch nhầm.
- Tách clamp zoom, pinch ratio và ngưỡng kéo vào `lib/farm-camera.ts`, bổ sung kiểm thử hồi quy tự động.
- Tối ưu CSS cho màn hình nhỏ, focus bàn phím, reduced-motion và bố cục camera; tăng độ tin cậy xuất file sao lưu trên mobile.
- Giữ nguyên save key và cấu trúc save version 1; không thêm backend, không reset dữ liệu.
- Gate: CI/Pages theo commit cuối V0.3C; Safari iOS/Chrome Android thực tế vẫn cần xác nhận thủ công.
