# Chuẩn bị đưa Nông Trại Vui Vẻ lên mạng

## Giao diện trên GitHub Pages

Trong repository `tradoanson/farm-world`, GitHub Pages dùng nguồn **GitHub Actions**. Workflow **Deploy Nong Trai Vui Ve to GitHub Pages** chạy khi cập nhật `main` hoặc khi được kích hoạt thủ công. Workflow chạy `npm test`, sau đó đóng gói `index.html`, mã JavaScript, CSS và ảnh để phát hành.

URL chơi: [Nông Trại Vui Vẻ trên GitHub Pages](https://tradoanson.github.io/farm-world/).

Khi chuyển mã nguồn sang một repository độc lập, có thể chọn **Settings → Pages → Deploy from a branch**, rồi chọn nhánh chứa mã và thư mục **/(root)**.

[GitHub Docs về nguồn xuất bản Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Đồng bộ online với Supabase

Bản hiện tại lưu trong `localStorage`. Khi chuyển sang đồng bộ theo tài khoản, giao diện tĩnh có thể tiếp tục chạy trên GitHub Pages. Supabase Auth cấp phiên người chơi và một endpoint đã xác thực xử lý các thao tác thay đổi trạng thái.

| Phần | Hợp đồng dành cho bản online |
| --- | --- |
| Giao diện | Gửi hành động và ID mục tiêu, ví dụ `plant_crop` với ô và loại cây, hoặc `collect_batch` với ID mẻ. |
| Endpoint | Xác thực JWT và lấy ID người chơi từ phiên, đọc giờ UTC của server, kiểm tra tài nguyên, trạng thái và thời điểm hoàn thành. |
| Lưu trữ | Mỗi nông trại có một chủ sở hữu, bản trạng thái có phiên bản và số revision tăng dần. Quyền đọc giới hạn theo chủ sở hữu. Thay đổi số dư và thời gian đi qua endpoint. |
| Gửi lại | Mỗi yêu cầu thay đổi có `requestId` và `expectedRevision`. Trong cùng giao dịch, khử trùng lặp theo người chơi và `requestId`, rồi mới trừ nguyên liệu hoặc ghi thưởng. Trả revision mới sau khi lưu. |
| Đồng hồ | Trả `serverNow` và các mốc `readyAt`. Giao diện suy ra đồng hồ hiển thị, còn server quyết định khi nào được gặt hoặc nhận hàng. Không cần một tác vụ định kỳ cho từng cây. |

Có thể chuyển các hằng số thời lượng và hàm mốc thời gian trong [game-rules.js](../game-rules.js) sang lớp xác thực phía server. Các tác vụ thay đổi vàng, vật nuôi, kho, nhiệm vụ và thưởng cần được tách khỏi xử lý DOM khi thêm endpoint. Mô hình khóa giao dịch hoặc kiểm tra revision bảo vệ lần thu hoạch trên hai thiết bị.

Khi cấu hình Supabase, bật RLS và cấp quyền tường minh cho phần dữ liệu cần truy cập. Frontend dùng khóa publishable và JWT phiên. Khóa secret hoặc service role nằm trong môi trường phía server. Kiểm thử bằng hai tài khoản riêng, hai thiết bị dùng cùng một tài khoản và một yêu cầu nhận hàng bị gửi lại.

Bản lưu theo địa chỉ trình duyệt. Khi mở từ một địa chỉ mới, cần có luồng nhập tiến độ riêng nếu muốn mang dữ liệu local sang. Nên dành tiến độ nhập từ thiết bị cho chế độ cá nhân hoặc kiểm tra trước khi cho tham gia kinh tế chung.

- [Supabase Auth cho Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Bảo vệ Data API](https://supabase.com/docs/guides/api/securing-your-api)
