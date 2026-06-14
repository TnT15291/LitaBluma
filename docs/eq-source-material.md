# Chất liệu EQ & giao tiếp (nguồn cho AI & nội dung)

File này lưu **chất liệu gốc** rút từ 2 cuốn sách, dùng làm nền cho phần AI và nội dung của LitaBluma.
Ý tưởng tính năng đã chuyển thành backlog ở [feature-ideas-eq.md](feature-ideas-eq.md). File này giữ lại
**chi tiết tái sử dụng được**: kỹ thuật, công thức, prompt template, cấu trúc thư viện tình huống.

Hai cuốn:
- **Faber & Mazlish — *Nói sao cho trẻ chịu nghe & Nghe sao cho trẻ chịu nói*** → cách AI sinh câu khuyến khích.
- **Phan Hồ Điệp — *8 tuần đánh thức trí thông minh cảm xúc*** → thư viện tình huống + AI Parenting Coach.

Khung lý thuyết đầy đủ: Nelsen (Positive Discipline) + Kohn (Punished by Rewards) → Faber & Mazlish → Phan Hồ Điệp → LitaBluma.

---

## 1. Faber & Mazlish — 5 kỹ thuật giao tiếp

1. **Công nhận cảm xúc, không phủ nhận.** ❌ "Đừng buồn, không có gì đâu" → ✅ "Con buồn vì bạn không chơi cùng. Điều đó có thể khiến con thấy tổn thương."
2. **Ghi nhận cảm xúc rồi giới hạn hành động.** ❌ "Bỏ đồ chơi đi!" → ✅ "Con thích chơi lắm. Nhưng giờ là giờ ăn. Con muốn mang nó lên bàn hay để xuống?"
3. **Mô tả vấn đề thay vì chỉ trích nhân cách.** ❌ "Con hay quên, vô trách nhiệm" → ✅ "Mẹ thấy đôi giày chưa cất, áo chưa gập. Mình cần sắp xếp trước khi đi học."
4. **Hỏi câu hỏi thay vì đưa lời khuyên.** ❌ "Con nên xin lỗi bạn" → ✅ "Con thấy bạn thế nào lúc này? Con nghĩ con nên làm gì?"
5. **Tìm giải pháp cùng con, không áp đặt.** ❌ "Con phải ngủ đúng giờ!" → ✅ "Con muốn ngủ mấy giờ? Mình lên thời gian biểu cùng nhau."

### Công thức diễn đạt
```
1. Công nhận cảm xúc: "Con cảm thấy..."
2. Mô tả vấn đề: "Khi... thì..."
3. Trao quyền/Hỏi: "Con nghĩ con nên làm gì?"
4. Tìm giải pháp: "Chúng ta thử... được không?"
```

### Đối chiếu cho AI khuyến khích
| Sai | Đúng (kiểu Faber & Mazlish) |
|---|---|
| "Giỏi lắm!" | "Con dọn bàn ăn gọn, mẹ thấy con chịu trách nhiệm." |
| "Sao con hay quên?" | "Con quên cất giày hôm nay. Lần sau con chú ý cất đúng chỗ nhé?" |
| "Con tự kỷ quá!" | "Con đang giận, con cần thời gian bình tĩnh. Con muốn ngồi một mình hay muốn bố ở bên?" |

---

## 2. Phan Hồ Điệp — khung EQ

### Cảm xúc nền tảng theo tuổi
- **4–5 (cơ bản):** vui, buồn, giận, sợ. Chỉ cần tên gọi + cách bình tĩnh.
- **6–7 (xã hội):** xấu hổ, tự hào, yêu thương, ghen tị. Bắt đầu liên hệ cảm xúc với hành động người khác.
- **8–10 (phức tạp):** vừa giận vừa sợ, mâu thuẫn nội tâm. Có thể tự phân tích cảm xúc.

### 4 kỹ năng EQ cốt lõi
1. **Nhận diện cảm xúc** — học từ vựng ("buồn", "sợ", "chán", "tức"), dùng khuôn mặt để liên tưởng.
2. **Bình tĩnh (hạ nhiệt)** — hít thở, đếm số, tìm góc yên tĩnh. Con **tự chọn** cách, không bị bắt.
3. **Thấu cảm người khác** — "Bạn buồn rồi. Con có thể làm gì để bạn thấy tốt hơn?"
4. **Giải quyết vấn đề** — xin lỗi, giải thích, hay đề xuất chơi lại.

### Lộ trình 8 tuần
| Tuần | Kỹ năng | Hoạt động |
|---|---|---|
| 1–2 | Gọi tên cảm xúc | Chỉ tên cảm xúc mỗi ngày |
| 3–4 | Nhận diện nguyên nhân | "Con giận vì sao?" |
| 5–6 | Bình tĩnh | Tìm cách hạ nhiệt con thích |
| 7–8 | Hành động | Xin lỗi, nói chuyện, chơi lại |

---

## 3. Prompt template — AI khuyến khích (MVP+)

```
Con vừa hoàn thành việc: [tên việc]
Tuổi con: [tháng tuổi]

Viết 1 câu khuyến khích theo cách Faber & Mazlish:
- Mô tả hành động cụ thể (không khen chung chung)
- Công nhận cảm xúc hoặc nỗ lực
- Trao quyền hoặc hỏi câu mở
- Giọng: ấm, tự nhiên, như một phụ huynh thân thiện

Tránh:
- Khen: "Giỏi", "Tuyệt vời"
- So sánh: "Hơn bạn"
- Phán xét: "Con tốt bụng"
```

Ví dụ:
- *Con 5 tuổi vừa tự đánh răng* → "Con đã tự đánh răng sạch sẽ! Mẹ thấy con chịu trách nhiệm với việc của mình."
- *Con 8 tuổi giúp em làm bài* → "Con giúp em mà em thấy vui. Con thấy thế nào khi thấy em vui vì con?"

---

## 4. Cấu trúc thư viện tình huống (post-MVP)

```
Tình huống: [mô tả vấn đề]
Dải tuổi: [nào]
Cảm xúc: [con cảm xúc gì]
Nguyên nhân: [tại sao]
Bước 1 - Công nhận: [cách phụ huynh nêu cảm xúc]
Bước 2 - Bình tĩnh: [cách giúp con hạ nhiệt]
Bước 3 - Thấu cảm: [cách giúp con hiểu người khác]
Bước 4 - Giải quyết: [cách con tự chọn hành động]
Tránh: [sai lầm phổ biến]
```

Ví dụ:
```
Tình huống: Con 6 tuổi nói dối đã làm bài tập (nhưng chưa)
Dải tuổi: 6–7   Cảm xúc: Sợ mắng / xấu hổ   Nguyên nhân: Sợ bị phạt nếu nói thật
Bước 1 - Công nhận: "Con sợ mẹ giận nếu nói chưa làm. Điều đó là bình thường."
Bước 2 - Bình tĩnh: "Mình ngồi một lúc rồi nói chuyện nhé?"
Bước 3 - Thấu cảm: "Mẹ cũng từng sợ nói thật. Nhưng sự thật giúp mẹ tin con hơn."
Bước 4 - Giải quyết: "Bây giờ con nói thật được không? Con và mẹ cùng làm bài?"
Tránh: "Con nói dối! Con là em bé tệ!" → dán nhãn, con càng sợ.
```

---

## 5. Prompt template — AI Parenting Coach (post-MVP)

```
Phụ huynh hỏi: [mô tả tình huống]

Phân tích theo khung EQ Phan Hồ Điệp:
1. Cảm xúc con đang cảm: [gì]
2. Nguyên nhân: [tại sao]
3. Kỹ năng EQ cần rèn: [cái nào]
4. Cách phụ huynh xử lý: [4 bước Faber & Mazlish]
Câu hỏi để phụ huynh suy nghĩ thêm: [gợi ý]
```

Ví dụ:
```
Hỏi: "Con 7 tuổi không chịu đi học, nói sợ bạn cười nhạo."
1. Cảm xúc: Sợ hãi + xấu hổ
2. Nguyên nhân: Có sự kiện khiến con bị cười (có thể con phóng đại)
3. Kỹ năng EQ: Thấu cảm + giải quyết xung đột
4. Xử lý:
   - Công nhận: "Con sợ bạn cười. Điều đó khiến con tổn thương."
   - Bình tĩnh: "Hôm nay mình không vội, ngồi nói chuyện."
   - Thấu cảm: "Có lần nào con thấy bạn khác bị cười không? Lúc đó con nghĩ gì?"
   - Giải quyết: "Mình sẽ làm gì? Con muốn nói chuyện với bạn, hay rủ bạn chơi cùng?"
Câu hỏi: "Có lần nào con bị cười mà lần sau vẫn mạnh dạn đối mặt? Con học gì từ đó?"
```

---

## 6. Checklist khi build phần AI

- [ ] **Nelsen**: AI khuyến khích *tiến bộ*, không chỉ khen kết quả?
- [ ] **Kohn**: thưởng vật chất giảm dần theo `habit_stage`?
- [ ] **Faber & Mazlish**: câu AI có công nhận cảm xúc + trao quyền/hỏi mở?
- [ ] **Phan Hồ Điệp**: tình huống có phân tích cảm xúc + kỹ năng EQ?
