# BỘ PROMPT TEST TOÀN BỘ CHỨC NĂNG — CHUẨN PHÁT ERP

Tài liệu này bao gồm các prompt độc lập phục vụ cho việc kiểm thử (QA) tự động/thủ công hệ thống Chuẩn Phát ERP. Mỗi phần là một prompt độc lập, sẵn sàng để copy và paste trực tiếp vào các mô hình AI (Claude/ChatGPT/Cursor) để sinh test cases chi tiết, hoặc dùng trực tiếp như checklist QA.

---

## 📌 THÔNG TIN HỆ THỐNG CHUNG (Cần đính kèm khi chạy test)
* **Frontend**: `http://localhost:3000`
* **Backend Java (Spring Boot)**: `http://localhost:8080`
* **Backend NestJS (Reports/Deposits)**: `http://localhost:3001`
* **Database**: PostgreSQL (`chuanphat_db`)
* **Tài khoản test**:
  * **Admin**: `admin` / `Admin@123`
  * **Kế toán**: `ketoan01` / `Test@123`
  * **Bán hàng**: `banhang01` / `Test@123`
  * **Kho**: `kho01` / `Test@123`
* **Chi nhánh thử nghiệm**: Chi nhánh Hà Nội (`branchId = 1`)

---

## 🔑 PHẦN 1: AUTHENTICATION & CORE SECURITY

### PROMPT 01 — AUTHENTICATION & SESSION SECURITY
```text
Hãy đóng vai trò là một Chuyên gia Kiểm thử Bảo mật (QA Security Engineer). Tôi cần bạn viết các kịch bản kiểm thử (test cases) chi tiết cho module Xác thực (Authentication) của hệ thống Chuẩn Phát ERP dựa trên các yêu cầu và thông số kỹ thuật sau:

1. THÔNG TIN HỆ THỐNG:
- Endpoint Backend: http://localhost:8080/api/auth
- Tài khoản: admin / Admin@123
- DB: PostgreSQL, lưu số lần đăng nhập sai (failed_attempts) và thời gian khóa (lockout_until).

2. CÁC QUY TẮC CẦN KIỂM TRA:
- Đăng nhập thành công: Phải trả về JWT Access Token và Refresh Token hợp lệ. Lưu thông tin phiên đăng nhập vào lịch sử hệ thống (Audit Log).
- Đăng nhập thất bại: Khi nhập sai mật khẩu, thông báo lỗi phải chung chung (ví dụ: "Tên đăng nhập hoặc mật khẩu không chính xác") để tránh tiết lộ sự tồn tại của tài khoản.
- Chính sách khóa tài khoản: Sau 5 lần đăng nhập sai liên tiếp, tài khoản phải bị khóa trong vòng 15 phút. Trong thời gian khóa, mọi yêu cầu đăng nhập dù đúng mật khẩu vẫn phải bị từ chối với mã lỗi rõ ràng. Sau khi đăng nhập thành công, số lần đăng nhập sai phải được reset về 0.
- Rotate Token: Gọi API refresh token `/api/auth/refresh` bằng Refresh Token cũ để lấy Access Token mới. Yêu cầu hệ thống phải thu hồi (revoke) các token cũ nếu phát hiện dấu hiệu tái sử dụng Refresh Token bất hợp pháp.
- Đăng xuất: Gọi `/api/auth/logout` phải thu hồi hoàn toàn hiệu lực của Refresh Token trên server.
- Môi trường Production: Đảm bảo mock login bị tắt hoàn toàn (biến môi trường NEXT_PUBLIC_ENABLE_MOCK=false và NEXT_PUBLIC_ENABLE_MOCK_LOGIN=false). Không được phép bypass xác thực qua API.

Hãy viết một bộ Test Cases chi tiết bao gồm:
- Mã test case (AUTH-001, AUTH-002...)
- Loại test (Tích cực, Tiêu cực, Bảo mật)
- Các bước thực hiện chi tiết (với dữ liệu test giả định cụ thể)
- Kết quả mong đợi (HTTP Status Code, dữ liệu Response JSON, trạng thái Database).
```

---

### PROMPT 02 — USER, ROLE, AND PERMISSION MATRIX
```text
Hãy đóng vai trò là QA Lead. Tôi cần bạn viết các kịch bản kiểm thử chi tiết để xác minh ma trận phân quyền (Permission Matrix) của Chuẩn Phát ERP. Hệ thống hỗ trợ đa vai trò (multi-role) trên mỗi người dùng và thực thi kiểm tra quyền nghiêm ngặt ở cả Frontend và REST API của Backend Java.

Các vai trò trong hệ thống:
- ADMIN, BRANCH_MANAGER, SALES_STAFF, WAREHOUSE_STAFF, ACCOUNTANT, TECHNICIAN, MARKETING_STAFF, AUDITOR.

Các quy tắc nghiệp vụ cần kiểm tra:
1. Đa vai trò (Multi-role): Một người dùng có nhiều vai trò (ví dụ: vừa là SALES_STAFF vừa là WAREHOUSE_STAFF) phải có quyền hạn là hợp (Union) của tất cả các quyền của các vai trò đó. Không được phát sinh lỗi xung đột quyền.
2. Kiểm soát phân quyền API:
   - Các API quản lý người dùng và vai trò chỉ cho phép người dùng có quyền USER_MANAGE truy cập.
   - Khi thực hiện hành động sửa đổi quyền của vai trò (ví dụ: bỏ quyền SALES_RETURN của vai trò SALES_STAFF), hệ thống phải ghi lại Audit Log hành động "UPDATE_PERMISSION".
3. Thực thi Frontend:
   - Kiểm tra UI: Người dùng không có quyền tương ứng phải không nhìn thấy các nút hành động (nút Xóa, Sửa, Xuất Excel) hoặc các menu bị giới hạn quyền trên thanh điều hướng Sidebar.
   - Thử nghiệm vượt quyền: Nếu người dùng cố tình nhập trực tiếp URL trang bị cấm (ví dụ: /settings hoặc /accounting), Router của Next.js phải chặn lại và redirect về trang 403 (Forbidden).

Hãy lập bảng các Test Cases chi tiết (Mã TC, Mô tả, Vai trò/Quyền kiểm thử, Các bước thực hiện, Kết quả mong đợi cho cả API và UI).
```

---

### PROMPT 03 — BRANCH DATA ISOLATION (CÔ LẬP DỮ LIỆU CHI NHÁNH)
```text
Hãy đóng vai trò là Chuyên gia QA Hệ thống. Tôi cần kiểm thử tính năng "Cô lập dữ liệu chi nhánh" (Branch Data Isolation) - một tính năng bảo mật sống còn của hệ thống Chuẩn Phát ERP. 

Bối cảnh nghiệp vụ:
- Hệ thống hỗ trợ nhiều chi nhánh. Admin có quyền xem tất cả. Người dùng chi nhánh nào (ví dụ: Chi nhánh Hà Nội, branchId = 1) chỉ được phép xem và thao tác dữ liệu thuộc chi nhánh đó.
- Các bảng dữ liệu chính đều có cột `branch_id`.

Yêu cầu viết kịch bản kiểm thử cho các trường hợp sau:
1. Danh sách dữ liệu (List query): Khi một nhân viên bán hàng của Chi nhánh Hà Nội (branchId = 1) gọi API lấy danh sách hóa đơn, khách hàng, tồn kho, hệ thống phải tự động thêm điều kiện lọc `branch_id = 1` ở tầng Database. Kịch bản test phải bao gồm việc kiểm tra xem nhân viên này có thấy bất kỳ dữ liệu nào của Chi nhánh TP.HCM (branchId = 2) hay không.
2. Truy cập trực tiếp (Direct API/ID access): Nhân viên Chi nhánh Hà Nội cố tình gửi HTTP GET hoặc POST đến `/api/sales/orders/{orderId_cua_chi_nhanh_HCM}` hoặc truy cập trực tiếp bằng URL của khách hàng chi nhánh khác. Hệ thống phải trả về lỗi 403 Forbidden hoặc 404 Not Found, không được rò rỉ dữ liệu.
3. Thay đổi tham số Chi nhánh: Kiểm thử xem nếu người dùng cố tình gửi tham số `?branchId=2` when họ chỉ có quyền thao tác trên `branchId=1`, backend có ghi đè tham số này về chi nhánh được phân quyền của họ hay không.
4. Audit Log: Các hành vi truy cập trái phép qua chi nhánh khác phải bị phát hiện và ghi nhận vào Nhật ký bảo mật (Audit Log) dưới dạng cảnh báo an ninh.

Hãy viết chi tiết các bước kiểm thử, tham số API cần giả định, và cách xác minh kết quả.
```

---

## 📦 PHẦN 2: CORE REGISTER (DANH MỤC & HÀNG HÓA KHO)

### PROMPT 04 — PRODUCT REGISTRY & SERIAL NUMBERS
```text
Hãy đóng vai trò là QA Product Specialist. Tôi cần bộ kịch bản kiểm thử cho tính năng quản lý sản phẩm và kiểm soát Số Serial (đặc biệt áp dụng cho sản phẩm Xe máy điện) trong Chuẩn Phát ERP.

Thông số kỹ thuật và quy tắc nghiệp vụ:
1. Đăng ký Sản phẩm (Product CRUD):
   - Mã SKU/Mã sản phẩm phải là duy nhất. Test case cần bao gồm kiểm thử tạo trùng mã.
   - Kiểm tra ràng buộc giá: Giá bán đề xuất phải lớn hơn hoặc bằng Giá nhập trung bình (`sale_price >= import_price`). Giá trị âm hoặc bằng 0 ở số tháng bảo hành phải bị chặn.
2. Kiểm soát Số Serial (Product Serial Numbers):
   - Xe máy điện bắt buộc phải có số khung/số máy dạng số Serial duy nhất khi nhập kho.
   - Trạng thái vòng đời của Serial: `IN_STOCK` (Trong kho) -> `SOLD` (Đã bán) -> `WARRANTY` (Đang bảo hành) -> `INACTIVE` (Không hoạt động).
   - Quy tắc xuất bán: Chỉ số Serial ở trạng thái `IN_STOCK` mới được phép đưa vào Đơn bán hàng (Sales Order). Nếu Serial có trạng thái `SOLD` hoặc `WARRANTY`, hệ thống phải chặn ngay lập tức.
   - Chuyển chi nhánh: Khi thực hiện chuyển kho giữa các chi nhánh, số Serial phải cập nhật đúng `branch_id` tương ứng sau khi phiếu chuyển kho được xác nhận.

Hãy thiết kế các test cases chi tiết để kiểm thử tính đúng đắn của vòng đời Serial, các ràng buộc dữ liệu sản phẩm, kiểm thử tích cực/tiêu cực cho API và UI.
```

---

### PROMPT 05 — WAREHOUSE & STOCK INVENTORY (QUẢN LÝ KHO & TỒN KHO)
```text
Hãy đóng vai trò là Senior Warehouse QA. Tôi cần bạn viết bộ kịch bản kiểm thử toàn diện cho module Quản lý kho, Tồn kho và Tính giá vốn của Chuẩn Phát ERP.

Quy tắc nghiệp vụ kho cần kiểm thử:
1. Khái niệm Số lượng Tồn kho:
   - `on_hand_quantity` (Tồn thực tế): Tổng số lượng vật lý trong kho.
   - `reserved_quantity` (Giữ chỗ): Số lượng hàng đã được đặt giữ chỗ trong các Đơn hàng Confirmed chưa xuất kho.
   - `available_quantity` (Khả dụng): Số lượng thực tế có thể bán (`available = on_hand - reserved`).
   - Kiểm thử xuất kho: Hệ thống phải chặn xuất kho nếu số lượng yêu cầu lớn hơn số lượng khả dụng (`available_quantity`), ngay cả khi số lượng tồn thực tế (`on_hand_quantity`) vẫn đủ.
2. Giá vốn bình quan gia quyền (Weighted Average Cost):
   - Khi nhập kho (Goods Receipt) hoặc kiểm kê ghi tăng, hệ thống phải tính toán lại giá vốn trung bình của sản phẩm đó tại chi nhánh/kho tương ứng: `Giá vốn mới = (Tồn cũ * Giá cũ + Nhập mới * Giá mới) / (Tồn cũ + Nhập mới)`.
   - Viết test case giả định số liệu nhập/xuất để kiểm tra công thức tính giá vốn của Backend.
3. Điều chuyển kho (Inventory Transfer):
   - Quy trình chuyển kho từ Kho A sang Kho B yêu cầu ghi nhận đồng thời 2 giao dịch: `TRANSFER_OUT` tại Kho A (giảm tồn khả dụng) và `TRANSFER_IN` tại Kho B (tăng tồn khả dụng).
4. Kiểm kê kho (Stocktake):
   - Khi số lượng kiểm kê thực tế lệch so với hệ thống: Lệch thừa phải tạo phiếu điều chỉnh tăng (`ADJUSTMENT_IN`), lệch thiếu tạo phiếu điều chỉnh giảm (`ADJUSTMENT_OUT`). Cả hai phải ghi nhận giao dịch tồn kho và hạch toán kế toán giá vốn tương ứng.

Hãy mô tả các bước kiểm thử, số liệu giả định chi tiết để thực hiện QA cho các luồng nghiệp vụ trên.
```

---

## 🛒 PHẦN 3: MODULES NGHIỆP VỤ (SALES, CRM, WARRANTY, ACCOUNTS)

### PROMPT 06 — SALES & POS (BÁN HÀNG & ĐIỂM BÁN HÀNG)
```text
Hãy đóng vai trò là Lead QA Bán hàng. Tôi cần bộ kịch bản kiểm thử tích hợp cho luồng Bán hàng & Điểm bán lẻ (POS) của Chuẩn Phát ERP. Luồng này liên kết chặt chẽ giữa Bán hàng -> Kho -> Kế toán -> Bảo hành.

Các bước nghiệp vụ cần bao phủ trong bộ kịch bản:
1. Báo giá & Đơn hàng (Quotation to Sales Order):
   - Tạo báo giá (Quotation) nháp, chuyển sang trạng thái đã gửi (SENT), được duyệt (ACCEPTED), và tự động chuyển đổi thành Đơn bán hàng (Sales Order) ở trạng thái `DRAFT`.
2. Đơn hàng & Giữ chỗ Serial:
   - Khi Sales Order được xác nhận (CONFIRMED), số Serial xe máy điện chọn trong đơn phải chuyển sang trạng thái giữ chỗ (reserved), và cập nhật `reserved_quantity` của sản phẩm đó.
   - Đơn hàng có thời gian giữ chỗ (`reservationUntil`). Nếu quá thời gian này mà khách hàng chưa thanh toán, hệ thống phải tự động giải phóng (release) số Serial về trạng thái `IN_STOCK`.
3. Thanh toán nhiều đợt & Hỗ trợ trả góp (Payments & Installment):
   - Hỗ trợ thanh toán hỗn hợp (ví dụ: Đơn hàng 50 triệu, thanh toán 20 triệu Tiền mặt, 30 triệu Tiền gửi).
   - Đơn hàng thanh toán một phần phải có trạng thái `PARTIALLY_PAID` và ghi nhận Công nợ phải thu của khách hàng đó.
   - Thử nghiệm trả góp (Installment Application): Đăng ký hồ sơ trả góp -> Chờ duyệt -> Giải ngân (Disbursed). Chỉ khi trạng thái giải ngân thành công thì đơn hàng mới được ghi nhận thanh toán.
4. Áp dụng Mã giảm giá (Voucher):
   - Kiểm tra các điều kiện chặn áp dụng voucher: Hết hạn sử dụng, vượt quá giới hạn lượt dùng, chưa đạt giá trị đơn hàng tối thiểu, hoặc áp dụng sai chi nhánh được chỉ định.
5. Hóa đơn & Tạo bảo hành tự động:
   - Khi đơn hàng được thanh toán đầy đủ (`PAID`) và xuất hóa đơn (`ISSUED`), số Serial phải được đổi sang `SOLD`, kho hàng thực hiện xuất kho thực tế, và hệ thống tự động sinh ra một Bản ghi Bảo hành (Warranty) hoạt động với thời hạn bảo hành khớp với thông số sản phẩm.
6. Đổi trả hàng (Sales Return):
   - Khách hàng trả lại hàng đã mua. Hệ thống phải tính toán số tiền hoàn trả, nhập lại số Serial vào kho (đưa về `IN_STOCK` hoặc `DAMAGED`), điều chỉnh công nợ khách hàng và ghi nhận các bút toán kế toán đảo ngược.

Hãy viết các kịch bản kiểm thử chi tiết từng bước cho luồng tích hợp phức tạp này.
```

---

### PROMPT 07 — CUSTOMER CRM & CUSTOMER 360
```text
Hãy đóng vai trò là CRM QA Engineer. Tôi cần viết các kịch bản kiểm thử cho module Quản lý Quan hệ Khách hàng (CRM) và trang Khách hàng 360 độ (Customer 360 Profile) trên Chuẩn Phát ERP.

Yêu cầu nghiệp vụ cần kiểm thử:
1. Quản lý Lead (Cơ hội kinh doanh):
   - Tạo Lead mới với nguồn khách hàng (ví dụ: Facebook, Hotline) và trạng thái (NEW, CONTACTED, QUALIFIED).
   - Kiểm tra tính năng chuyển đổi Lead thành Khách hàng chính thức (Convert to Customer). Hệ thống phải tự động tạo bản ghi Khách hàng và liên kết lịch sử của Lead cũ.
2. Kiểm tra tính duy nhất (Unique constraints):
   - Không cho phép tạo hai khách hàng có trùng số điện thoại trong cùng một chi nhánh.
3. Hồ sơ Khách hàng 360 độ:
   - Xác minh xem khi mở trang thông tin khách hàng, hệ thống có tổng hợp đầy đủ và chính xác tất cả lịch sử giao dịch hay không, bao gồm: Lịch sử mua hàng, công nợ hiện tại, danh sách số Serial đã mua, các yêu cầu bảo hành/sửa chữa và nhật ký chăm sóc (care notes).
4. Phân quyền chi nhánh đối với CRM:
   - Nhân viên chi nhánh A không được phép tìm kiếm hoặc xem trang Hồ sơ 360 độ của khách hàng thuộc chi nhánh B trừ khi được phân quyền quản lý liên chi nhánh.

Hãy lập danh sách các test cases chi tiết để xác minh các chức năng trên cả phương diện API và giao diện UI.
```

---

### PROMPT 08 — WARRANTY & SERVICE TICKETS (BẢO HÀNH & SỬA CHỮA)
```text
Hãy đóng vai trò là QA Service Specialist. Tôi cần bạn thiết kế bộ kịch bản kiểm thử cho Module Bảo hành và Phiếu dịch vụ sửa chữa (Service Tickets) của Chuẩn Phát ERP.

Quy trình nghiệp vụ cần kiểm thử:
1. Tra cứu Bảo hành:
   - Nhập số Serial để tra cứu thời hạn bảo hành. Kiểm tra 3 trường hợp: Serial còn hạn bảo hành, Serial đã hết hạn bảo hành, và Serial không tồn tại/chưa từng được kích hoạt bảo hành.
2. Tạo Phiếu Dịch vụ (Service Ticket):
   - Khi xe máy điện cần bảo hành/sửa chữa, tạo phiếu dịch vụ liên kết với số Serial xe và Khách hàng.
   - Trạng thái phiếu sửa chữa: `OPEN` (Mới tiếp nhận) -> `ASSIGNED` (Đã giao kỹ thuật viên) -> `IN_PROGRESS` (Đang sửa chữa) -> `COMPLETED` (Đã hoàn thành) -> `CLOSED` (Đã bàn giao xe và thanh toán).
   - Kiểm tra ràng buộc chuyển đổi trạng thái: Ví dụ, không được phép chuyển thẳng từ `OPEN` sang `COMPLETED` mà không qua bước `IN_PROGRESS`.
3. Phân công Kỹ thuật viên (Technician Assignment):
   - Chỉ người dùng có vai trò phù hợp mới được giao việc. Xác minh kỹ thuật viên được giao việc sẽ nhận được thông báo hệ thống và chỉ nhìn thấy danh sách phiếu dịch vụ được giao cho họ.
4. Tính toán chi phí sửa chữa (Repair Costing):
   - Phiếu sửa chữa có phần phụ tùng thay thế (Parts) lấy từ danh mục kho và Tiền công (Labor cost).
   - Phụ tùng bảo hành (trong thời hạn miễn phí) phải có đơn giá bằng 0 đối với khách hàng, nhưng giá vốn vẫn phải được hạch toán cho chi phí bảo hành của chi nhánh. Phụ tùng không bảo hành phải tính tiền bình thường theo bảng giá bán.
   - Tổng chi phí phiếu = `Tổng tiền phụ tùng tính phí + Tiền công`. Hệ thống phải tự động cập nhật tổng chi phí này khi có thay đổi trên dòng chi tiết.

Hãy viết chi tiết các bước thực hiện test, dữ liệu đầu vào và kết quả mong đợi cho từng kịch bản.
```

---

### PROMPT 09 — SUPPLIER & PURCHASE ORDER FLOW (MUA HÀNG & CÔNG NỢ NCC)
```text
Hãy đóng vai trò là QA Purchase Manager. Tôi cần bạn viết các kịch bản kiểm thử cho quy trình Mua hàng từ Nhà cung cấp và quản lý Công nợ Phải trả trong hệ thống Chuẩn Phát ERP.

Các bước nghiệp vụ cần kiểm thử:
1. Đơn mua hàng (Purchase Order - PO):
   - Tạo đơn PO nháp gửi nhà cung cấp. Kiểm tra ràng buộc duyệt: Nhân viên mua hàng tạo đơn, nhưng chỉ Quản lý mua hàng hoặc Admin mới có quyền phê duyệt đơn PO chuyển sang trạng thái APPROVED.
2. Nhập kho mua hàng (Goods Receipt):
   - Sau khi nhà cung cấp giao hàng, tạo Phiếu nhập kho dựa trên đơn PO đã duyệt.
   - Kiểm thử khớp số lượng: Nếu số lượng thực nhập lớn hơn số lượng đặt trên PO, hệ thống phải chặn lại hoặc yêu cầu phê duyệt vượt mức từ Admin.
   - Khi hoàn tất nhập kho, số lượng tồn thực tế (`on_hand_quantity`) của các sản phẩm tương ứng phải tăng lên ngay lập tức, và giá vốn bình quân gia quyền phải được tính toán lại.
3. Ghi nhận Công nợ Phải trả (Accounts Payable):
   - Khi hóa đơn mua hàng được nhập, hệ thống phải tự động tạo khoản Công nợ phải trả cho nhà cung cấp tương ứng.
   - Kiểm tra hạch toán: Nợ tài khoản kho / Có tài khoản phải trả người bán (331).
4. Thanh toán cho Nhà cung cấp:
   - Tạo phiếu chi tiền mặt hoặc ủy nhiệm chi ngân hàng để thanh toán công nợ nhà cung cấp (thanh toán toàn bộ hoặc một phần). Xác minh số dư công nợ phải trả giảm đi tương ứng và không được phép chi tiền vượt quá số tiền nợ thực tế nếu không có lý do hợp lệ.

Hãy thiết kế các test cases chi tiết để kiểm thử tính chính xác của luồng thông tin này.
```

---

### PROMPT 10 — CASH & BANK TRANSACTION ACCOUNTING (KẾ TOÁN THU CHI)
```text
Hãy đóng vai trò là QA Accountant. Tôi cần bộ kịch bản kiểm thử chi tiết cho module Kế toán Thu chi (Tiền mặt & Tiền gửi ngân hàng) của Chuẩn Phát ERP. Module này kết nối trực tiếp với Sổ quỹ chi nhánh và Sao kê ngân hàng.

Quy trình cần kiểm thử:
1. Phiếu Thu / Phiếu Chi Tiền mặt (Cash Receipt / Payment):
   - Thao tác lập Phiếu Thu tiền khách hàng (phải bắt buộc chọn Khách hàng và liên kết với hóa đơn/đơn hàng cần thu nợ).
   - Thao tác lập Phiếu Chi tiền (phải chọn nhà cung cấp hoặc khoản mục chi phí được cấu hình sẵn).
   - Kiểm tra Sổ Quỹ tiền mặt (Cash Book): Số dư quỹ của chi nhánh phải tăng/giảm ngay lập tức theo thời gian thực (real-time) sau khi phiếu được Ghi sổ (Posted). Không cho phép số dư quỹ âm nếu hệ thống cấu hình chặn quỹ âm.
2. Tiền gửi ngân hàng & Đối chiếu sao kê (Bank Deposit & Reconciliation):
   - Lập phiếu Thu/Chi tiền gửi ngân hàng, yêu cầu chọn tài khoản ngân hàng cụ thể.
   - Tính năng Nhập sao kê ngân hàng (Bank Statement Import): Upload file sao kê của ngân hàng (định dạng Excel/CSV giả định) và chạy tính năng đối chiếu tự động với chứng từ trên hệ thống dựa trên Số tiền, Ngày giao dịch, và Nội dung chuyển khoản.
   - Kiểm thử việc khớp giao dịch và đánh dấu đối chiếu thành công (`Reconciled`).
3. Luồng kiểm kê quỹ (Cash Count):
   - Lập biên bản kiểm kê quỹ tiền mặt cuối ngày. Kiểm thử việc xử lý chênh lệch giữa số tiền mặt thực tế kiểm đếm và số dư trên sổ sách kế toán.

Hãy lập tài liệu hướng dẫn kiểm thử chi tiết các chức năng trên kèm mã lỗi/kết quả phản hồi API mong đợi.
```

---

### PROMPT 11 — ACCOUNTS RECEIVABLE & PAYABLE (QUẢN LÝ CÔNG NỢ)
```text
Hãy đóng vai trò là QA Financial Controller. Tôi cần bạn viết các kịch bản kiểm thử để xác minh tính chính xác của các thuật toán và nghiệp vụ quản lý Công nợ Phải thu (khách hàng) và Công nợ Phải trả (nhà cung cấp) trong Chuẩn Phát ERP.

Yêu cầu chi tiết cho các kịch bản test:
1. Ràng buộc thu nợ khách hàng:
   - Khi tạo Phiếu Thu để thu nợ của một khách hàng, số tiền thu không được phép vượt quá tổng nợ hiện tại của khách hàng đó trên hệ thống (`amount_paid <= outstanding_debt`). Kiểm thử nhập số tiền lớn hơn nợ và kiểm tra thông báo chặn của hệ thống.
2. Theo dõi tuổi nợ (Aging Report):
   - Kiểm tra thuật toán phân loại tuổi nợ theo các mốc thời gian: Trong hạn, Nợ quá hạn 1-30 ngày, 31-60 ngày, 61-90 ngày, và trên 90 ngày dựa trên Ngày đáo hạn (Due date) của hóa đơn bán hàng.
   - Thiết lập các hóa đơn thử nghiệm với các ngày hóa đơn khác nhau trong quá khứ để xác minh báo cáo tuổi nợ hiển thị chính xác các nhóm công nợ.
3. Cấn trừ công nợ (Debt Reconciliation/Offset):
   - Thực hiện kiểm thử tính năng cấn trừ công nợ giữa cùng một đối tượng vừa là khách hàng vừa là nhà cung cấp. Giao dịch cấn trừ phải làm giảm đồng thời phải thu và phải trả và tạo chứng từ cấn trừ đối ứng.
4. Đối chiếu số dư công nợ:
   - Đảm bảo rằng số dư công nợ của khách hàng trên Báo cáo công nợ phải khớp hoàn toàn với số dư đầu kỳ cộng doanh số bán hàng phát sinh trừ đi số tiền đã thu trong kỳ.

Hãy cung cấp các kịch bản kiểm thử cụ thể bao gồm dữ liệu số liệu mẫu để QA có thể kiểm thử dễ dàng.
```

---

### PROMPT 12 — EXPENSES & FIXED ASSETS (CHI PHÍ & TÀI SẢN CỐ ĐỊNH)
```text
Hãy đóng vai trò là Kế toán trưởng kiêm QA. Tôi cần bạn viết các kịch bản kiểm thử chi tiết cho hai tính năng vừa được nâng cấp: Quản lý Chi phí (Expenses) và Tài sản cố định (Fixed Assets) trong Chuẩn Phát ERP.

Thông tin nghiệp vụ thực tế:
- Module Chi phí: Đã có màn hình `ExpensePanel` với đầy đủ CRUD chi phí thông qua React Query (`useQuery`/`useMutation`), gọi trực tiếp các API `/api/accounting/expenses`. Có tính năng Ghi sổ (Post) chi phí để kết chuyển vào sổ cái.
- Module Tài sản cố định: Đã có màn hình `FixedAssetPanel` quản lý danh sách TSCĐ, tính năng ghi tăng và chạy khấu hao (Run Depreciation) hàng tháng, gọi các API `/api/accounting/fixed-assets`.

Các trường hợp cần viết kịch bản test:
1. Kiểm thử Chi phí:
   - Tạo mới một khoản chi phí (nhập loại chi phí, số tiền, ngày phát sinh, chi nhánh).
   - Kiểm thử hành động Ghi sổ (Post): Khoản chi phí sau khi ghi sổ phải chuyển trạng thái thành `POSTED`, không cho phép sửa đổi hay xóa nữa. Giao dịch này phải ghi nhận bút toán Nợ TK Chi phí / Có TK Tiền mặt hoặc Phải trả tương ứng.
2. Kiểm thử Tài sản cố định (Asset Lifecycle):
   - Ghi tăng TSCĐ: Nhập nguyên giá, ngày mua, thời gian sử dụng hữu ích (số năm/tháng), phương pháp khấu hao (Đường thẳng), và tài khoản khấu hao lũy kế.
   - Kiểm thử chạy khấu hao tháng: Thực hiện hành động chạy khấu hao cho một tháng cụ thể. Kiểm tra xem hệ thống có tính đúng số tiền khấu hao hàng tháng (`Khấu hao tháng = Nguyên giá / Tổng số tháng sử dụng`) và tự động tạo bút toán khấu hao hay không.
   - Thanh lý TSCĐ (Disposal): Thực hiện thanh lý tài sản trước hạn hoặc đúng hạn, ghi nhận thu nhập từ thanh lý và xóa sổ tài sản cố định đó.

Hãy soạn thảo các kịch bản test có đầy đủ các bước thực hiện trên UI của hai panel này và cách đối chiếu cơ sở dữ liệu sau mỗi thao tác.
```

---

### PROMPT 13 — FINANCIAL JOURNALS, TAX & GENERAL LEDGER (KẾ TOÁN TỔNG HỢP & THUẾ)
```text
Hãy đóng vai trò là Chuyên gia QA Hệ thống Tài chính. Tôi cần bộ kịch bản kiểm thử cho các chức năng Kế toán tổng hợp (General Ledger), Bút toán thủ công (Journal Entries) và Kê khai Thuế (Tax) trong Chuẩn Phát ERP.

Quy tắc kế toán cần tuân thủ và kiểm thử:
1. Bút toán thủ công (Journal Entry - JE):
   - Tạo bút toán nợ có thủ công. Quy tắc bắt buộc: Tổng số tiền phát sinh Nợ (Debit) phải bằng tổng số tiền phát sinh Có (Credit). Hệ thống phải chặn không cho ghi sổ (Post) nếu bút toán không cân bằng (`Total Debit != Total Credit`).
   - Kiểm thử việc ghi sổ bút toán: Sau khi Post thành công, các tài khoản kế toán liên quan phải cập nhật số dư tức thời.
2. Sổ cái & Cân đối tài khoản (Trial Balance):
   - Kiểm tra Báo cáo Bảng Cân đối tài khoản: Tổng số dư Nợ đầu kỳ, Số phát sinh Nợ/Có trong kỳ và Số dư Nợ/Có cuối kỳ của tất cả các tài khoản phải khớp công thức kế toán.
3. Kê khai Thuế VAT (Tax Ledger):
   - Hệ thống tự động tách tiền thuế VAT đầu ra (khi xuất hóa đơn bán hàng) và VAT đầu vào (khi nhập kho mua hàng) dựa trên thuế suất quy định (ví dụ: 8%, 10%).
   - Kiểm tra Báo cáo Thuế GTGT: Phải tổng hợp đầy đủ doanh thu chưa thuế, tiền thuế VAT đầu ra, giá trị hàng mua chưa thuế, thuế VAT đầu vào được khấu trừ để tính ra số thuế GTGT phải nộp trong kỳ.

Hãy viết các kịch bản kiểm thử chi tiết bao gồm cách thiết lập bút toán sai lệch để test tính năng chặn lỗi của hệ thống.
```

---

### PROMPT 14 — DASHBOARDS & SYSTEM AUDIT LOGS (GIÁM SÁT HỆ THỐNG)
```text
Hãy đóng vai trò là QA Auditor. Tôi cần bộ kịch bản kiểm thử cho module Bảng điều khiển (Dashboard) và Nhật ký hệ thống (Audit Log) của Chuẩn Phát ERP.

Yêu cầu chi tiết cần kiểm thử:
1. Dashboard KPIs:
   - Các chỉ số trên Dashboard bao gồm: Doanh thu hôm nay, Đơn hàng mới, Tồn kho thấp, Phiếu bảo hành đang mở.
   - Thử nghiệm độ chính xác của số liệu: Tạo một đơn hàng bán thành công trị giá 10 triệu đồng tại chi nhánh Hà Nội. Kiểm tra xem chỉ số "Doanh thu hôm nay" trên Dashboard của nhân viên chi nhánh Hà Nội và Admin có tăng thêm đúng 10 triệu hay không.
   - Kiểm thử phân quyền: Một nhân viên chi nhánh Hà Nội đăng nhập vào chỉ được xem các KPI của chi nhánh Hà Nội. Admin đăng nhập vào phải nhìn thấy số liệu tổng hợp của tất cả các chi nhánh.
2. Nhật ký hệ thống (Audit Log):
   - Thực hiện các hành động nhạy cảm trên hệ thống: Tạo người dùng mới, đổi mật khẩu, thay đổi ma trận phân quyền, xuất báo cáo tài chính, xóa chứng từ công nợ.
   - Truy cập trang Audit Log (yêu cầu quyền `AUDIT_VIEW`). Xác minh các hành động trên được ghi nhận đầy đủ các thông tin: Người thực hiện (User ID), Hành động (Action Code), Tên Module, Thời gian chi tiết, Địa chỉ IP, và Mô tả thay đổi (dữ liệu cũ và mới).
   - Kiểm tra việc lọc và tìm kiếm nhật ký hệ thống theo thời gian, theo người dùng và theo loại hành động.

Hãy viết các test cases chi tiết để QA xác minh hai module giám sát này hoạt động đúng thiết kế.
```

---

### PROMPT 15 — UTILITY SETTINGS & SYSTEM PROCEDURES (THIẾT LẬP HỆ THỐNG)
```text
Hãy đóng vai trò là System Administrator kiêm QA. Tôi cần bạn viết các kịch bản kiểm thử cho module Thiết lập hệ thống (Settings), các tính năng Tiện ích (Nhắc nhở tự động) và Quy trình Sao lưu/Khôi phục (Backup & Restore) của Chuẩn Phát ERP.

Các trường hợp cần kiểm thử:
1. Thiết lập hệ thống (System Settings):
   - Cấu hình thông tin doanh nghiệp, tải lên logo chi nhánh mới, cập nhật mẫu hóa đơn PDF và chính sách bảo hành mặc định.
   - Cấu hình Ngưỡng cảnh báo tồn kho thấp (`low_stock_threshold`). Xác minh khi tồn kho của sản phẩm giảm xuống dưới ngưỡng này, hệ thống sẽ kích hoạt trạng thái cảnh báo trên Dashboard và gửi thông báo cho thủ kho.
2. Nhắc nhở tự động (Reminders):
   - Hệ thống tự động tạo thông báo nhắc nhở khi: Hóa đơn công nợ sắp đến hạn thanh toán, Phiếu bảo hành sắp hết hạn cam kết xử lý (SLA), hoặc Lịch hẹn chăm sóc khách hàng CRM đến giờ.
   - Viết test case thiết lập một sự kiện sắp đến hạn để kiểm tra xem hệ thống có hiển thị cảnh báo đẩy (Push notification) hoặc Icon chuông báo đỏ trên giao diện người dùng hay không.
3. Quy trình Sao lưu & Khôi phục (Backup & Restore Drill) - Kiểm thử dưới góc độ vận hành:
   - Kiểm tra quy trình chạy script backup cơ sở dữ liệu PostgreSQL (`scripts/backup-postgres.ps1`). Xác minh file backup được tạo ra có dung lượng hợp lý và lưu đúng thư mục quy định.
   - Thử nghiệm khôi phục dữ liệu (Restore) trên môi trường Staging: Chạy script restore, kiểm tra xem hệ thống có yêu cầu nhập chuỗi xác nhận bắt buộc "RESTORE DATABASE" trước khi thực hiện hay không để tránh ghi đè nhầm. Sau khi restore, đăng nhập hệ thống để đối chiếu tính toàn vẹn của dữ liệu bán hàng và kế toán.

Hãy viết chi tiết các kịch bản thử nghiệm vận hành này để đảm bảo tính sẵn sàng cao của hệ thống.
```
