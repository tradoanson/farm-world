# NÔNG TRẠI VUI VẺ – FARM WORLD (PHIÊN BẢN V3.1 EXPANDED)

Một tựa game mô phỏng nông trại hoàn chỉnh, sống động và giàu tính năng, chạy trên nền Web đa nền tảng (Desktop & Mobile Responsive). Cảnh trồng trọt được căn theo vị trí ruộng và cầu câu trên ảnh gốc [Hinh_anh_can_cu.jpg](Hinh_anh_can_cu.jpg). Các cảnh khác sử dụng ảnh rời trong thư mục scene-art.

---

## 🌾 CÁCH KHỞI CHẠY GAME

### Cách 1: Chơi trực tiếp (Zero Configuration)
* Nhấp đúp chuột trực tiếp vào file [index.html](index.html) để mở trên trình duyệt (Chrome, Edge, Safari, Cốc Cốc, Firefox).

### Cách 2: Mở Web Server (Khuyên dùng để chơi trên cả điện thoại)
* Nhấp đúp vào file [run_game.bat](run_game.bat).
* Trình duyệt máy tính tự động mở: `http://localhost:8080`.
* Chạy riêng trên máy tính bằng `python serve_game.py --open`.
* **Chơi trên điện thoại**: Kết nối cùng mạng Wi-Fi với máy tính, mở trình duyệt điện thoại và gõ `http://[IP_Máy_Tính]:8080`.

---

## Nhịp chơi và mã nguồn

- [Thời lượng, vòng chơi và cách giữ bản lưu cũ](docs/GAMEPLAY.md)
- [Chuẩn bị GitHub Pages và Supabase](docs/ONLINE.md)
- Chạy kiểm tra bằng `npm test`. Không cần cài gói phụ thuộc.

## Chơi trên máy tính và điện thoại

- Mỗi tab mở một cảnh riêng. Trồng trọt dùng phần ruộng từ ảnh gốc. Chăn nuôi dùng ảnh rời cho từng chuồng, với nút và đồng hồ đặt bên ngoài vùng ảnh.
- Trên máy tính, chọn cảnh ở thanh trái. Trên điện thoại, dùng thanh dưới. Trên ruộng, chạm ô trống để gieo hoặc vuốt qua các ô chín khi chọn liềm.
- Gieo một ô dùng một hạt giống. Có thể bán thành phẩm trong kho hoặc dùng chúng để giao đơn. Bảng đơn hàng đưa các đơn đủ hàng lên đầu.
- Sản xuất và đếm ngược vẫn chạy khi chuyển cảnh. Tiến độ được lưu riêng trong từng trình duyệt và địa chỉ mở game.

## Hành trình và vòng chơi

- **Chương 1 — Vụ mùa đầu tiên.** Gặt, gieo và tưới để nhận hạt giống và vàng.
- **Chương 2 — Nhịp sống trong chuồng.** Xay thức ăn, cho vật nuôi ăn và thu sản phẩm. Nhận hết thưởng của chương để mở công thức phô mai.
- **Chương 3 — Hàng về thị trấn.** Nướng bánh, bán hàng và giao đơn. Hoàn thành chương mở công thức áo len và thêm một ô xưởng.
- **Chương 4 — Xưởng làng phát triển.** Chế biến phô mai và áo len rồi giao đơn có thành phẩm.
- **Việc mỗi ngày** luân phiên theo ngày trên thiết bị. Nhiệm vụ có nút đi đến đúng cảnh. Nhận thưởng trước khi sang ngày mới.
- Xưởng trừ nguyên liệu khi xếp mẻ. Mỗi lần chạy một mẻ và hàng chờ tiếp tục tính giờ khi đóng game. Mẻ hoàn thành giữ chỗ đến khi chọn **Nhận hàng**.
- Hồ sơ mới bắt đầu ở cấp 1. Hồ sơ cũ giữ cấp, tài nguyên, công thức và nhiệm vụ cũ, đồng thời có thể chơi hành trình mới.

## Cấp độ nông trại

Bấm hồ sơ trên thanh trên cùng để xem EXP đang có, số EXP còn thiếu và các mốc mở khóa. Gieo, tưới, gặt, chăm chuồng, nhận hàng ở xưởng, giao đơn và hoàn thành nhiệm vụ đều có thể cho EXP.

| Cấp | Mở khóa |
| --- | --- |
| 2 | Chuồng gà có 4 chỗ |
| 3 | Mua hạt cà chua |
| 4 | Chuồng bò có 3 chỗ |
| 5 | Mua hạt dâu tây và nâng chuồng gà lên 5 chỗ |
| 6 | Chuồng cừu có 3 chỗ |
| 7 | Chuồng bò có 4 chỗ |
| 8 | Chuồng cừu có 4 chỗ và nhận thêm một ô xưởng |
| 9 | Chuồng gà có 6 chỗ |

Ô xưởng từ cấp 8 cộng dồn với ô nhận từ chương 3, tối đa 4 ô. Hồ sơ cũ giữ cấp, EXP, ngưỡng của cấp hiện tại, hạt giống và vật nuôi đã có. Hạt giống trong kho vẫn gieo được trước mốc mở mua trong cửa hàng.


Tham khảo thiết kế từ [hàng chờ xưởng](https://support.supercell.com/hay-day/en/articles/products.html), [mục tiêu theo ngày](https://support.supercell.com/hay-day/en/articles/goals-and-rewards.html) và [bảng đơn hàng của Hay Day](https://support.supercell.com/hay-day/en/articles/truck-orders-2-2.html), [chuỗi sản xuất của Township](https://playrix.helpshift.com/hc/en/3-township/faq/15993-farming-production/), [thao tác kéo trên ruộng của FarmVille 3](https://zyngasupport.helpshift.com/hc/en/91-farmville-3/section/1074-getting-started/) và [cách Stardew Valley điều chỉnh giao diện cho mobile](https://www.stardewvalley.net/press/).

---

## 🌟 TẬP HỢP CÁC TÍNH NĂNG MỚI ĐÃ MỞ RỘNG (EXPANDED GAMEPLAY)

### 1. 🎣 Mini-Game Câu Cá Tại Cầu Tàu Bến Sông (Fishing Pier)
* Tận dụng cây cầu gỗ và bến sông ở góc dưới bên trái:
* Nhấp vào **"Bến Câu Cá"** trên cầu tàu để mở giao diện câu cá thời gian thực.
* Nhấn **"Quăng Cần Câu"**: Chiếc phao câu lắc lư trên mặt nước gợn sóng.
* Sau vài giây, chuông cảnh báo **"CÁ CẮN CÂU! GIẬT NGAY!"** xuất hiện: Người chơi cần phản xạ giật cần trong 1.8 giây để kéo cá lên bờ!
* Các loài thủy sản phong phú:
  * 🐟 **Cá Chép Vàng** (Bán 80 Vàng)
  * 🐠 **Cá Rô Phi** (Bán 130 Vàng)
  * 🐡 **Cá Hồi Đại Dương** (Bán 240 Vàng)
  * 🦞 **Tôm Càng Xanh Hiếm** (Bán 380 Vàng)
* Có thể bán cá tại **Kho Hàng** lấy tiền vàng dồi dào.

### 2. 🎡 Vòng Quay May Mắn (Wheel of Fortune)
* Nhấp vào biểu tượng **"May mắn"** trong thanh điều hướng hoặc mục **Thêm** trên điện thoại.
* Vòng quay 8 ô phần thưởng rực rỡ: Vàng (500 - 1000), Kim cương (15💎), Thức ăn gia súc, Thể lực, Phân bón thần kỳ, Hạt dâu tây và Rương báu bí ẩn!
* Hiệu ứng âm thanh tick bánh đà cơ khí, kim chỉ và pháo hoa rực rỡ khi trúng thưởng.
* Lượt đầu tiên miễn phí cho mỗi tiến độ chơi. Các lượt sau tốn 10 kim cương.

### 3. 🐕 Thú Cưng Canh Nhà (Chú Chó Vàng)
* Chú chó vàng ngồi canh trước cửa hiên nhà nông trại.
* Nhấp vào chú chó: Chú sủa mừng và có một lượt cơ hội tìm 50 vàng mỗi 30 phút.

### 4. 🧰 Khay Công Cụ Nổi Tương Tác Nhanh (Hay Day Quick Tools Dock)
* Nằm trong bảng dụng cụ ở cảnh Trồng trọt:
  * 🌾 **Liềm Gặt**: Chế độ vuốt thu hoạch nhanh hàng loạt.
  * 💧 **Bình Tưới Nước**: Nhấp vào cây đang lớn để **giảm 25% thời gian còn lại** (hiển thị giọt nước lấp lánh).
  * ✨ **Phân Bón Thần Kỳ**: Kích thích cây trồng hoặc chuồng gia súc **chín NGAY LẬP TỨC**!
  * 🎣 Mở **Bến câu cá** ngay trong khung cảnh nông trại.

### 5. 🌅 Chu Kỳ Ngày / Đêm & Thời Tiết Mưa Nắng Động
* Nhấp vào biểu tượng `🌅` trong **Cài đặt** để chuyển đổi thời gian:
  * ☀️ **Ban ngày**: Ánh nắng trong trẻo, cây cối xanh tươi.
  * 🌅 **Hoàng hôn**: Bầu trời nhuốm sắc cam hồng rực rỡ.
  * 🌙 **Màn đêm**: Khung cảnh nông trại huyền ảo dưới ánh trăng và đom đóm lung linh.
* Nhấp vào biểu tượng `🌧️` để bật thời tiết:
  * Mưa phùn thay đổi khung cảnh. Bình tưới dùng để chăm từng ô cây.

### 6. 🐔 Hệ thống Chăn nuôi V3.1 Cốt lõi
* 3 chuồng trại với thời gian thực: Gà (Trứng) $\rightarrow$ Bò (Sữa) $\rightarrow$ Cừu (Lông cừu).
* Thanh điều khiển chuyên dụng bên phải: Mua vật nuôi, Cho ăn hàng loạt, Thu hoạch toàn bộ.

### 7. 🌱 Hệ thống Nông trại 9 Ô Đất Vuốt Gặt
* Trồng 5 loại hoa màu: Lúa mì, Cà rốt, Bắp ngô, Cà chua, Dâu tây.
* Hỗ trợ gặt lướt (Swipe-to-harvest) liên hoàn bằng chuột hoặc ngón tay cảm ứng trên điện thoại.

### 8. 🏭 Xưởng Chế Biến, Kho Hàng & Đơn Hàng Thị Trấn
* Làm thức ăn chăn nuôi từ lúa mì + bắp; nướng bánh mì; ủ phô mai; dệt áo len.
* Bán nông phẩm tại Kho để kiếm tiền vàng.
* Bảng đơn hàng thị trấn từ các NPC hàng xóm giúp lên cấp nhanh chóng.
