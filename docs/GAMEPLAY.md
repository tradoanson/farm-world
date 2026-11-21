# Nhịp chơi của Nông Trại Vui Vẻ

## Cơ chế tham khảo

Hay Day dùng nông sản cho nhiều mục đích cùng lúc: gieo lại, nuôi vật nuôi, chế biến, giao đơn hoặc bán. Chu kỳ ngắn giúp có việc để làm khi vừa mở game. Công việc dài hơn tạo lý do quay lại. Mỗi máy chỉ làm một mẻ tại một thời điểm, còn các mẻ khác chờ trong những ô đã mở. Các đơn đủ hàng có thể giao ngay và đơn bị bỏ được thay sau một khoảng chờ.

- [Mô tả gameplay của Supercell](https://play.google.com/store/apps/details?id=com.supercell.hayday)
- [Hàng chờ xưởng của Hay Day](https://support.supercell.com/hay-day/en/articles/products.html)
- [Đơn xe tải của Hay Day](https://support.supercell.com/hay-day/en/articles/truck-orders-2-2.html)
- [Kho nông sản và kho thành phẩm của Hay Day](https://support.supercell.com/hay-day/en/articles/expanding-storage.html)

## Thời lượng áp dụng

Đây là thời lượng riêng của Nông Trại Vui Vẻ, được cấu hình trong [game-rules.js](../game-rules.js). Lúa mì cho một vòng thu hoạch trong vài phút, trong khi cà chua, dâu, chuồng cừu và các mẻ dài phù hợp với một lượt chơi sau.

| Công việc | Thời gian cơ bản | Vai trò |
| --- | --- | --- |
| Lúa mì | 2 phút | Gieo lại, làm thức ăn hoặc nướng bánh |
| Bắp | 5 phút | Nguyên liệu thức ăn, nguyên liệu giao đơn |
| Cà rốt | 10 phút | Bán hàng hoặc giao đơn |
| Cà chua | 30 phút | Cây giá trị cao hơn, mở mua ở cấp 3 |
| Dâu tây | 1 giờ 30 phút | Cây dài hạn, mở mua ở cấp 5 |
| Gà cho trứng | 15 phút | Nguyên liệu bánh mì và đơn cơ bản |
| Bò cho sữa | 35 phút | Nguyên liệu phô mai và đơn từ sữa |
| Cừu cho lông | 1 giờ 30 phút | Nguyên liệu áo len |
| Thức ăn gia súc | 6 phút | Trả 2 lúa mì và 1 bắp, nhận 5 bao |
| Bánh mì | 12 phút | Thành phẩm đầu tiên |
| Phô mai | 45 phút | Thành phẩm sau chương 2 |
| Áo len | 1 giờ | Thành phẩm sau chương 3 |
| Thay đơn bị bỏ | 3 phút | Thay yêu cầu khi người chơi cần giữ hàng hoặc thiếu nguyên liệu |

Hồ sơ mới có bốn ô chín, hai ô trồng sẵn còn 45 giây và 3 phút, một chuồng gà có thể thu ngay và bốn bao thức ăn. Người chơi có thể gặt, gieo, tưới và xếp mẻ thức ăn ngay lượt đầu. Sau 6–15 phút có thể nhận thức ăn và bắt đầu thu sản phẩm ngắn hạn. Sữa, lông và thành phẩm cao hơn trở thành mục tiêu cho lượt quay lại.

Tưới một lần giảm 25% thời gian còn lại. Khi hết hạt, một nông sản cùng loại có thể dùng để gieo, nên bán hết nông sản cũng làm mất vật liệu gieo lại. Mỗi mẻ xưởng giữ nguyên thứ tự và chỉ vào kho sau thao tác nhận hàng. Bỏ đơn không trừ hàng hoặc trả thưởng. Ô trống hiện thời gian chờ đơn mới.

## Lưu tiến độ và kiểm thử

Những việc đang chờ dùng mốc hoàn thành UTC theo mili giây. Bản chạy qua tệp giữ địa chỉ cũ, còn nút chạy LAN vẫn mở localhost:8080 trên máy tính. Khi quay lại, game đọc mốc đã lưu và so với giờ thiết bị. Game không cần chạy bộ đếm nền để cây, chuồng hay xưởng hoàn thành.

Bản lưu trước dùng bộ đếm giây. Lần mở đầu sau cập nhật, cây và chuồng đang chạy được chuyển sang mốc tuyệt đối từ thời điểm lưu cũ và số giây còn lại. Xưởng giữ mốc cũ. Việc mới bắt đầu theo bảng trên. Các mốc nhận thành phẩm, chương, EXP và tài nguyên vẫn nằm trong bản lưu.

Ở bản trình duyệt hiện tại, giờ của thiết bị quyết định thời điểm hoàn thành. Thiết kế đồng hồ server cho bản online nằm trong [ONLINE.md](ONLINE.md).
