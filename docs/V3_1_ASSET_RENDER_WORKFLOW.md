# Farm World V3.1 — quy trình render asset độc lập

## Mục tiêu
127 asset trong `assets/v3.1/manifest.json`, theo thứ tự ENV → BLD → CROP → ANI → PEN → UI → ICO → FX. **Mỗi lần chỉ render đúng một asset**, không xuất cả scene/spritesheet tổng rồi cắt. Không dùng screenshot làm ảnh nền gameplay. Mỗi ảnh được duyệt riêng trước khi bắt đầu ảnh kế tiếp.

## Các bước bắt buộc cho MỖI asset
1. Đọc đúng ID, tên, đường dẫn và thứ tự trong manifest. Chỉ bắt đầu nếu mọi ID trước đã được đánh dấu `approved`.
2. Tạo một ảnh mới **chỉ một đối tượng/chi tiết**, góc nhìn 2.5D thống nhất, hướng sáng trên-trái, không chữ/khung nền/đối tượng khác, không bóng đổ bị cắt. Với animation, mỗi hành động được xuất riêng, các frame có cùng kích thước và tâm neo.
3. Xuất **PNG RGBA thực sự trong suốt**, không nền trắng, nền caro giả, không flatten JPG. Giữ lề trống >= 8% khung ở bước render; gate máy kiểm tối thiểu 4%.
4. Kiểm tra thủ công ở nền trắng, đen, xanh lá và nền nông trại: không viền trắng/halo, không mất bộ phận, không trùng bóng, không răng cưa quá mức. Nếu sai, render lại **chính ID đó**, không chuyển ID khác.
5. Đặt file vào đường dẫn duy nhất trong manifest. Chạy workflow `V3.1 Asset Render Gate` với `asset_id` hiện tại. Gate kiểm PNG, alpha, vùng an toàn, thứ tự phê duyệt. Không thể tự đánh giá thẩm mỹ bằng gate.
6. Tích hợp thử đúng vị trí trong webgame với một thẻ asset riêng; kiểm tra desktop và Safari/Chrome mobile, các nút và ô đất vẫn bấm được. Đánh giá z-index, pointer-events, object-fit:contain, anchor, clipping, responsive và occlusion. Ảnh trang trí dùng `pointer-events:none`; đối tượng tương tác có hitbox riêng, không phụ thuộc pixel alpha.
7. Chỉ khi review hình và kiểm tra hiển thị đều PASS mới đổi `status` của đúng ID thành `approved`, ghi commit, người duyệt, bằng chứng ảnh chụp. Sau đó mới sang ID kế tiếp.

## Chống mất/ẩn/che asset
- Asset nền cảnh quan nằm dưới công trình; công trình dưới vật nuôi/cây theo vị trí chân; HUD nằm lớp trên cùng. Không dùng `overflow:hidden` trên container có thể cắt mái nhà hoặc bóng.
- Tất cả sprite dùng hệ tọa độ neo đáy-giữa (`transform-origin: 50% 100%`) hoặc metadata anchor riêng. Không đổi kích thước file làm lệch tọa độ.
- 9 ô trồng trọt là 9 thành phần độc lập, tọa độ cố định; không render cả cụm thành một bitmap.
- Chuồng, hàng rào, vật nuôi, máng ăn tách lớp; tuyệt đối không lấy nguyên một cảnh chuồng rồi cắt ra.
- Dùng `<img>` hoặc `next/image` với kích thước khai báo; tránh CSS `background-size:cover` cho sprite vì sẽ cắt ảnh; dùng `contain`.
- Kiểm tra mạng 404, case-sensitive file paths, asset loading, viewport, pointer hitbox và độ tương phản.
- PNG có alpha vẫn có thể bị che bởi lớp khác hoặc `z-index` sai: kiểm thử scene là bắt buộc.

## Phạm vi workflow
Workflow này **kiểm tra asset đã render và commit**, không tự gọi AI render: GitHub Actions hiện chưa có dịch vụ render được cấu hình. Chưa có asset nào được coi là hoàn tất chỉ vì có manifest. Cần tích hợp bộ sinh ảnh riêng nếu muốn tự động tạo từng ảnh; không đặt API key vào repository. Gate không tự merge/deploy. Chỉ phát hành bản web sau CI, review, smoke test và release gates.

## Quy tắc phát hành
Không ghi `approved` khi thiếu file hoặc bằng chứng. Không xóa/reset Supabase; đây là thay đổi tĩnh về asset và giao diện. V3.1 chỉ bàn giao khi toàn bộ asset trong phạm vi được chốt có bằng chứng PASS, gameplay không hồi quy, CI xanh và web thực tế đã được kiểm tra.
