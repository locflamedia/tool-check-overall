# Website Audit Options - Checking Status

Dưới đây là trạng thái kiểm tra của các tùy chọn bạn đã cung cấp, dựa trên chức năng hiện có của công cụ:

## ✅ Đã được kiểm tra (Checked)

*   **Domain (Dữ liệu tĩnh)**: Hiện chưa được kiểm tra.
*   **Uptime/Response Time**: Scanner `uptimeResponseTime` kiểm tra thời gian phản hồi của máy chủ và trạng thái hoạt động (tương đương `curl`).
*   **Robots = index**: Scanner `seo` kiểm tra thẻ meta robots, cho biết khả năng lập chỉ mục.
*   **Redirect (Nếu có)**: Scanner `redirects` kiểm tra và hiển thị chuỗi redirect.
*   **Sitemap.xml**: Scanner `sitemap` thu thập các URL sitemap và các URL được liệt kê.
*   **Robots.txt**: Scanner `robotsTxt` phân tích nội dung, sitemaps, các quy tắc disallow và allow.
*   **Link API (Liên kết đến các trang)**: Scanner `linkedPages` phân tích tổng số, liên kết nội bộ và bên ngoài.
*   **Robots.txt Admin (Các link cần show ra FE)**: Dữ liệu từ scanner `robotsTxt` (allow/disallow) có thể được sử dụng để suy ra thông tin này.
*   **Schema**: Scanner `seo` phát hiện và liệt kê các schema markup.
*   **Share social (Các bài chi tiết cần share đúng cover)**: Scanner `shareSocial` kiểm tra các thẻ Open Graph và Twitter Card (title, description, image).
*   **Favicon**: Scanner `favicon` kiểm tra sự tồn tại và URL của favicon từ thẻ link hoặc tại `/favicon.ico`, và hiển thị preview.
*   **SSR**: Scanner `ssr` kiểm tra các dấu hiệu Server-Side Rendering (ví dụ: Next.js, React, Nuxt.js indicators, hydration data, và sự hiện diện của nội dung trong HTML thô).
*   **GA/GTM**: Scanner `thirdPartyScripts` hiện đã kiểm tra sự hiện diện của các tag Google Analytics và Google Tag Manager.
*   **Plausible**: Scanner `thirdPartyScripts` hiện đã kiểm tra sự hiện diện của tag Plausible.

## ❌ Chưa được kiểm tra (Not Checked)

*   **Submit sitemap**: Đây là một hành động, không phải một kiểm tra. Công cụ chỉ phát hiện sitemaps.
*   **Quét Screaming Frog**: Đây là một công cụ của bên thứ 3, không phải chức năng của công cụ hiện tại.
*   **Setup API bên thứ 3**: Đây là một hành động cấu hình, không phải một kiểm tra.
*   **Gửi mail**: Đây là một hành động, không phải một kiểm tra.
*   **Email From (Server)**: Không có chức năng kiểm tra cấu hình email gửi từ server.
*   **Trang 404**: Không có scanner chuyên biệt để kiểm tra trang 404.
