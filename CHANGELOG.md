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
