# Ý tưởng tính năng từ 2 cuốn sách EQ & Giao tiếp

Nguồn: [eq-source-material.md](eq-source-material.md)
(Faber & Mazlish — *Nói sao cho trẻ chịu nghe*; Phan Hồ Điệp — *8 tuần đánh thức trí thông minh cảm xúc*).

Đây là **backlog ý tưởng**, không phải lệnh build. Mỗi mục ghi rõ phạm vi (MVP Core / MVP+ / post-MVP),
entity dữ liệu liên quan, và ràng buộc theo [docs/rules.md](rules.md). Không kéo MVP+ / post-MVP vào MVP Core
trừ khi được yêu cầu rõ ràng.

---

## 1. Nhóm hành vi EQ trong checklist (MVP Core — chỉ là nội dung seed)

Khung 4 kỹ năng EQ của Phan Hồ Điệp dịch thẳng thành **hành vi tích cực** để ghi nhận, không phải bài kiểm tra.

| Dải tuổi | Hành vi mẫu (positive framing) |
|---|---|
| 4–5 | "Hôm nay con gọi tên được cảm xúc của mình", "Con tự tìm cách bình tĩnh lại" |
| 6–7 | "Con nhận ra vì sao mình giận", "Con hỏi thăm khi bạn buồn" |
| 8–10 | "Con nói ra cảm xúc khó (vừa giận vừa buồn)", "Con tự đề xuất cách làm hòa" |

- **Entity**: thêm `category = 'eq'` cho `behavior_templates`; phân theo `age_band` sẵn có.
- **Guardrail**: đây là hành vi để **công nhận**, ghi `completed` / `tried` / `not_yet`. `not_yet` là theo dõi
  trung tính, không phải "con thiếu EQ". Không bao giờ trừ điểm. Không dán nhãn ("con vô cảm", "con tự kỷ").
- **Phạm vi**: chỉ là nội dung template seed (Phase 5 / Phase 1 mock) — không cần code mới.

## 2. Prompt AI khuyến khích theo công thức Faber & Mazlish (MVP+)

Nâng chất câu khuyến khích AI: thay vì "Giỏi lắm!" → mô tả hành động cụ thể + công nhận nỗ lực + câu hỏi mở.

- **Công thức**: (1) mô tả hành vi cụ thể → (2) công nhận cảm xúc/nỗ lực → (3) trao quyền hoặc hỏi câu mở.
  Tránh khen chung chung ("giỏi", "tuyệt"), so sánh ("hơn bạn"), phán xét nhân cách ("con ngoan").
- **Entity**: `ai_suggestions` (`suggestion_type = 'encouragement'`); chạy qua backend proxy / Edge Function.
- **Guardrail**: gửi tối thiểu dữ liệu trẻ (tên việc + tháng tuổi, không gửi tên/ảnh/chi tiết thừa). Phụ huynh
  duyệt/sửa trước khi dùng (`status`: generated → edited/used/dismissed). Lỗi AI → fallback về template an toàn.
  Giữ giới hạn free-tier (3 lần/ngày) ở server qua `ai_usage_counters`.

## 3. "Góc bình tĩnh" cho child mode (MVP+ hoặc post-MVP)

Từ kỹ năng EQ #2 (hạ nhiệt): trẻ **tự chọn** cách bình tĩnh, không bị bắt.

- Một góc nhỏ trong child mode: hít thở theo bông hoa nở/khép, đếm số, "tìm góc yên tĩnh". Trẻ chọn cách mình thích.
- Hợp metaphor khu vườn: "tưới nước cho mình một chút" trước khi quay lại.
- **Guardrail**: hoàn toàn tích cực, low-text, không màu đỏ báo lỗi, không gắn với điểm hay hành vi. Không phải
  hình phạt time-out. AI **không** nhắn trực tiếp cho trẻ — đây là công cụ tĩnh, parent-mediated.
- **Phạm vi**: làm được không cần AI → ưu tiên bản tĩnh trước.

## 4. Thư viện tình huống cho phụ huynh (post-MVP)

Nội dung biên tập sẵn (không phải AI), theo cấu trúc 4 bước Phan Hồ Điệp: Công nhận → Bình tĩnh → Thấu cảm → Giải quyết.

- **Cấu trúc mỗi tình huống**: mô tả vấn đề · dải tuổi · cảm xúc · nguyên nhân · 4 bước xử lý · "tránh điều này".
- Ví dụ: con 6 tuổi nói dối đã làm bài tập; con 5 tuổi khóc vì bị giành đồ chơi (xem file nguồn mục 4.2).
- **Entity**: bảng nội dung tĩnh mới (vd `situation_library`), lọc theo `age_band`. Không đụng dữ liệu trẻ.
- **Guardrail**: nội dung do người viết kiểm duyệt, không chẩn đoán y khoa/tâm lý. An toàn vì không gọi AI.

## 5. AI Parenting Coach theo khung EQ (post-MVP)

Phụ huynh nêu tình huống → AI phân tích theo khung Phan Hồ Điệp + đề xuất lời nói kiểu Faber & Mazlish.

- **Output AI**: (1) cảm xúc con đang cảm → (2) nguyên nhân → (3) kỹ năng EQ cần rèn → (4) 4 bước gợi ý lời nói
  → (5) một câu hỏi để phụ huynh tự suy ngẫm.
- **Entity**: `ai_suggestions` (`suggestion_type = 'coach'`), đếm qua `ai_usage_counters` (`feature = 'coach'`),
  gate sau `plan = premium`.
- **Guardrail (quan trọng)**: tư vấn **cho phụ huynh**, không nhắn trẻ. Tuyệt đối không chẩn đoán ADHD/tự kỷ/rối
  loạn nào. Không tư vấn y khoa/pháp lý/can thiệp chuyên môn. Không so sánh con với anh em/bạn bè. Khi không chắc
  → fallback template an toàn + gợi ý gặp chuyên gia thật.

## 6. "Gọi tên cảm xúc" — micro-moment nuôi khu vườn (MVP+)

Từ kỹ năng EQ #1 (nhận diện cảm xúc): một thao tác nhẹ hằng ngày trẻ chọn khuôn mặt cảm xúc.

- Trẻ chạm vào khuôn mặt (vui/buồn/giận/sợ…) → ghi nhận tích cực, góp vào tăng trưởng khu vườn.
- Phụ huynh thấy xu hướng cảm xúc theo thời gian ở parent mode (không phải bảng giám sát — chỉ là gợi mở).
- **Entity**: dùng `behavior_logs` với một checklist item EQ "gọi tên cảm xúc", hoặc một loại log nhẹ riêng.
- **Guardrail**: không có cảm xúc "sai". Không hiện điểm thô cho trẻ. Parent mode không biến thành dashboard theo dõi.

## 7. Giọng văn "Lá thư Chủ nhật" theo Faber & Mazlish (MVP+)

Bản tóm tắt tuần (`weekly_summaries`) viết theo giọng mô tả-cụ-thể + công nhận nỗ lực, tránh khen chung chung và
tránh xếp hạng "tuần này tốt/tệ hơn". Nhấn vào tiến bộ và nỗ lực (đúng tinh thần Nelsen + Kohn).

## 8. Đồng hành & điều tiết cảm xúc cho PHỤ HUYNH (post-MVP — có thể là trụ cột thứ 2)

**Insight:** cả Nelsen, Faber & Mazlish và Phan Hồ Điệp đều cho rằng người cần đổi cách *trước tiên là cha mẹ*.
App hiện chỉ ghi nhận con → vô tình ngụ ý "con là người cần sửa". Thêm phần cho phụ huynh để cân bằng lại.

- **Nhắc tự điều tiết (micro-pause):** lúc con "khó" hoặc trước khi ghi `not_yet`, nhắc nhẹ "hít thở — mô tả việc
  thay vì trách con". Bản tĩnh, không cần AI.
- **Lá thư phản tư cho phụ huynh:** vài câu hỏi mỗi tuần ("Lúc nào tuần này mình giữ được bình tĩnh? Lúc nào khó?").
  Ghi nhận chính cha mẹ cũng đang tiến bộ.
- **Mẹo hạ nhiệt cho người lớn** theo tình huống (nội dung tĩnh biên tập sẵn).
- **Liên kết nhân–quả tích cực:** khi con tiến bộ, gợi nhắc "con làm được phần vì cách anh/chị phản ứng tuần này".

- **Guardrail (RẤT quan trọng):** nguyên tắc *không phạt, không xấu hổ, không so sánh* áp dụng cho **cả phụ huynh**.
  KHÔNG làm bảng chấm điểm "cha mẹ tốt/tệ", KHÔNG tạo cảm giác tội lỗi. Đây là **phản tư + ghi nhận tiến bộ**, không
  phải tự đánh giá có điểm số. Không chẩn đoán tâm lý phụ huynh (nóng giận, trầm cảm…). AI đồng hành, không phán xét.
- **Entity gợi ý:** bảng phản tư riêng của caregiver (vd `caregiver_reflections`) — KHÔNG dùng `point_ledger`, không
  có khái niệm điểm cho phụ huynh. Mẹo hạ nhiệt dùng chung kho nội dung tĩnh với thư viện tình huống (mục 4).
- **Phạm vi (cập nhật 2026-06-14):** bản **tối giản** của micro-pause — MỘT câu tĩnh, không-AI, không chấm điểm, hiện lúc ghi `not_yet` — đã được đưa vào **MVP Core** (entity `parent_pause_prompts`), để trụ cột phụ huynh có mặt từ bản đầu. Bản đầy đủ hơn (nhiều prompt theo tình huống + mẹo tĩnh) ở MVP+; lá thư phản tư post-MVP.
- **Quyết định (2026-06-14): ĐÃ CHỐT là trụ cột thứ 2 — nhưng KHÔNG chia 50/50 màn hình.**
  Định vị "app nuôi con cho cả nhà: con lớn lên, cha mẹ cũng lớn lên". Khung chuẩn để không hiểu nhầm:
  - **Ngang hàng về triết lý / messaging (50/50):** đây là điểm khác biệt với mọi app sticker-chart; nói ngang hàng.
  - **Đan xen về giao diện (~70/30), KHÔNG phải khu riêng cùng cỡ:** con là trung tâm của vòng lặp ngày & UI chính;
    phần phụ huynh dệt *vào trong* luồng của con — micro-pause hiện đúng khoảnh khắc ghi `not_yet` (không phải một tab
    riêng); lá thư tuần phản tư cả con lẫn cha mẹ trong cùng một chỗ; mỗi tiến bộ của con gắn câu nhắc "một phần nhờ
    cách anh/chị phản ứng".
  - **Khác nhịp:** con = *hằng ngày*; phụ huynh = *theo khoảnh khắc + hằng tuần*. Không ép phụ huynh "làm bài" mỗi
    ngày (đi ngược cam kết không tạo áp lực).
  - **Cảnh báo thiết kế:** chia đôi UI 50/50 sẽ tạo ra "app self-help nửa vời ghép app thói quen nửa vời" — tránh.
  - *Định vị* là trụ cột chính. *Thời điểm build* (cập nhật 2026-06-14): bản **tối giản** (một câu micro-pause tĩnh
    lúc `not_yet`) vào **MVP Core** để trụ cột có mặt từ đầu; bản đầy đủ hơn (nhiều prompt + mẹo tĩnh) ở MVP+;
    lá thư phản tư post-MVP. Vẫn giữ kỷ luật MVP — chỉ phần tối giản, không-AI, không chấm điểm mới vào Core.
  - Hệ quả: đã ghi vào [product-spec.md](product-spec.md) §4; còn cần cập nhật messaging/onboarding để phản ánh 2 trụ cột.

## 9. Trục đức tính xuyên suốt (seed nội dung được phép ở MVP Core; hệ đầy đủ post-MVP)

5 đức tính làm **trục** tổ chức hành vi, theo con từ nhỏ tới lớn với task khó dần theo nhóm tuổi:
**tự lập · trách nhiệm · kiểm soát cảm xúc · đồng cảm · kiên trì.**

- **Khung đúng:** đây là *trục phân loại* hành vi để **ghi nhận**, KHÔNG phải giáo trình có cấp độ phải vượt qua.
  Ghi nhận hành vi con *đã* làm, không phải bài con *phải* đạt. (Tránh hiểu thành skill-tree/level.)
- **Cấu trúc dữ liệu (gần như sẵn):** thêm `virtue` cho `behavior_templates` (đã có `category`, `age_band`).
  "Khó tăng dần theo tuổi" = dùng `age_band` sẵn có; **nâng độ khó = một proposal** (app gợi ý, cha mẹ xác nhận —
  tái dùng hệ proposals đã build ở `src/lib/domain/proposals.ts`), KHÔNG tự leo thang theo tuổi.
- **Trẻ thấy:** sự đa dạng trong **vườn** — mỗi đức tính là một loại cây / khu vực, lớn lên khi con thực hành.
  KHÔNG level, KHÔNG số, KHÔNG bảng xếp hạng đức tính.
- **Cha mẹ thấy:** checklist nhóm theo đức tính + gợi ý hành vi theo tuổi (cha mẹ bật/tắt); "vòng cung" dài hạn
  thể hiện qua *tăng trưởng*, không phải điểm.
- **Guardrail (rất quan trọng):** KHÔNG chấm điểm con theo từng đức tính (→ vi phạm no-surveillance / no-label).
  `not_yet` vẫn trung tính, không ngụ ý "con thiếu đức tính X". Không chẩn đoán. Nâng độ khó luôn parent-confirmed.
- **Phạm vi:** *seed* (gắn nhãn `virtue` cho template + nhóm checklist/onboarding theo đức tính) — **MVP Core**,
  thuần nội dung, không cơ chế mới. Hệ đầy đủ (ladder theo tuổi qua proposal, vòng cung cha mẹ, garden theo đức
  tính) — **post-MVP**.

## 10. Báo cáo theo chu kỳ (tuần / tháng / năm) + Phân tích AI hai chiều (con & phụ huynh) + Lời khuyên

Ba nhịp báo cáo, đi cùng nguyên tắc "khác cadence" của 2 trụ cột (con = hằng ngày; cha mẹ = khoảnh khắc + tổng kết).
Xây trên giọng "Lá thư Chủ nhật" (#7) và phần phản tư cha mẹ (#8).

| Nhịp | Nội dung | AI? | Phạm vi |
|---|---|---|---|
| **Tuần** ("Lá thư Chủ nhật") | điểm sáng tuần của con (mô tả-cụ-thể, không xếp hạng) + 1 phản tư cho cha mẹ + 1 lời khuyên nhỏ | có (fallback template tĩnh) | MVP+ |
| **Tháng** | gộp 4 tuần → xu hướng nhẹ theo đức tính (tăng trưởng, không điểm) + 1–2 gợi ý điều chỉnh checklist (qua proposal) | có | post-MVP |
| **Năm** ("Câu chuyện lớn lên") | hồi tưởng celebratory + vòng cung đức tính cả năm + xuất PDF | có | post-MVP (PDF vốn đã post-MVP) |

**Phân tích AI hai chiều — đây là điểm khác biệt, không chỉ là "report của con":**
- **Về con:** mô tả tiến bộ theo hành vi/đức tính, *strength-based* (Nelsen: nhấn **tiến bộ & nỗ lực**, không chỉ
  kết quả). KHÔNG chẩn đoán, KHÔNG so sánh với trẻ khác/anh chị em, KHÔNG dán nhãn nhân cách.
- **Về phụ huynh:** phản tư riêng tư về tự điều tiết ("tuần này lúc nào mình giữ được bình tĩnh? lúc nào khó?")
  — **ghi nhận tiến bộ của chính cha mẹ**, KHÔNG chấm điểm "cha mẹ tốt/tệ", KHÔNG gây tội lỗi, KHÔNG chẩn đoán
  tâm lý cha mẹ. Nguyên tắc no-shame/no-compare áp dụng cho **cả cha mẹ**.
- **Lời khuyên:** cụ thể, khả thi, *parent-mediated* — gợi ý lời nói/cách tiếp cận theo Faber & Mazlish
  (mô tả hành vi + công nhận cảm xúc + trao quyền/hỏi mở). Khi AI không chắc → fallback template an toàn +
  gợi ý gặp chuyên gia thật.

- **Entity:** mở rộng `weekly_summaries` thành `periodic_reports` với `period = 'week' | 'month' | 'year'`
  (hoặc giữ `weekly_summaries` + bảng rollup). Phản tư cha mẹ dùng `caregiver_reflections` (#8) — KHÔNG
  `point_ledger`, không có điểm cho cha mẹ.
- **Guardrail dữ liệu/AI:** chạy qua backend proxy / Edge Function, gửi **tối thiểu** dữ liệu trẻ; AI **không**
  nhắn trực tiếp con; cha mẹ duyệt trước khi (nếu) chia sẻ. Giữ giới hạn free-tier qua `ai_usage_counters`;
  báo cáo sâu gate sau `plan = premium`. Bản **không-AI** của báo cáo tuần (template mô tả) là fallback luôn có.
- **Phạm vi:** tuần — **MVP+**; tháng/năm — **post-MVP**.

## 11. Vòng đời tới 16 tuổi — child mode tắt ở dậy thì, chỉ còn trụ cột cha mẹ (post-MVP — định hướng 2026-06-16)

App đi theo cả tuổi thơ của con, không chỉ 4–10. Xem [product-spec.md](product-spec.md) §16.3.

- **4–10 (dual mode, đang làm):** vòng lặp vườn/điểm/thưởng của con + trụ cột cha mẹ đan xen.
- **~11+ (dậy thì → parent-only):** vườn/điểm/thưởng **không hợp** tuổi teen → **gỡ bỏ** child mode; app thành **bạn đồng hành coaching cho cha mẹ** (kịch bản giao tiếp, xử lý xung đột, EQ tuổi teen). Trụ cột cha mẹ trở thành *toàn bộ* sản phẩm.
- **Dữ liệu:** thêm `age_band` `11-13`, `14-16`; chuyển dual → parent-only **derive từ ngày sinh** (như band hiện có). Một cờ chế độ ở runtime, không lưu.
- **Open decision:** mốc cắt child mode chính xác (đề xuất **11**) + cách truyền đạt chuyển đổi (ấm, "con đang lớn lên" — không bao giờ "bạn để vườn chết").
- **Guardrail:** dữ liệu teen nhạy cảm hơn; mọi rule child-privacy vẫn áp dụng; review COPPA/tương đương trước khi phát hành. Vẫn không chẩn đoán, AI vẫn parent-mediated.
- **Phạm vi:** post-MVP. Phần lớn là **nội dung + mode-switch, không cần AI** → làm được không phụ thuộc backend; lớp AI coach cho teen đi sau.

## 12. Chống lặp — đời sống hằng ngày ngoài checklist (post-MVP — định hướng 2026-06-16)

Checklist cố định *bản chất là lặp* (habit hình thành nhờ lặp) — không churn list. Cái cần giải là **app có quá ít thứ ngoài list**. Xem [product-spec.md](product-spec.md) §16.1. Gom các mảnh đã có thành một nguyên tắc:

- **Gọi tên cảm xúc** (#6) làm *touch hằng ngày* đổi mới, nuôi vườn.
- **"Việc của tuần"** — nổi bật 1–2 hành vi/tuần thay vì list phẳng.
- **Góc bình tĩnh** (#3) — tương tác, đổi vị.
- **Vườn sống động** (#9) — cây theo đức tính, sự kiện bất ngờ/theo mùa.
- **Guardrail:** tất cả tích cực, không áp lực/streak, không điểm thô cho trẻ — đúng tinh thần child mode. Tất cả **không cần AI**.

---

## Checklist khi build phần AI (từ file nguồn mục 5)

- [ ] **Nelsen**: AI khuyến khích *tiến bộ*, không chỉ khen kết quả?
- [ ] **Kohn**: thưởng vật chất giảm dần theo `habit_stage`, tránh "nghiện" phần thưởng?
- [ ] **Faber & Mazlish**: câu AI có công nhận cảm xúc + trao quyền/hỏi mở?
- [ ] **Phan Hồ Điệp**: tình huống có phân tích cảm xúc + kỹ năng EQ?

## Thứ tự ưu tiên đề xuất

*(Re-prioritized 2026-06-16: product-owner muốn app sâu hơn checklist và xem lớp coaching là lý do trả tiền. Các phần **không-AI, không phụ thuộc backend** được kéo lên — chúng đứng độc lập trong khi store swap Supabase đang chờ.)*

1. (MVP Core seed — done) Nhóm hành vi EQ + nhãn **trục đức tính** cho template — mục 1, 9 (seed).
2. (post-MVP, **không cần AI** — kéo lên) **Thư viện tình huống tĩnh** (4 bước Phan Hồ Điệp) — mục 4. Đây là thứ biến app từ tracker thành coach và là seed của AI Coach.
3. (post-MVP, **không cần AI** — kéo lên) **Chống lặp / đời sống hằng ngày**: gọi tên cảm xúc, việc của tuần, góc bình tĩnh — mục 12, 6, 3.
4. (MVP+) Prompt khuyến khích Faber & Mazlish + **báo cáo tuần** (lá thư + phân tích AI hai chiều) — mục 2, 7, 10 (tuần). *(cần backend proxy)*
5. (post-MVP) **AI Parenting Coach** — mục 5. *(premium, cần backend proxy — reason to pay)*
6. (post-MVP) **Vòng đời tới 16 + parent-only mode** — mục 11. *(nội dung + mode-switch, phần lớn không cần AI)*
7. (post-MVP) Hệ **trục đức tính** đầy đủ + **báo cáo tháng/năm** (vòng cung + PDF) — mục 9 (đầy đủ), 10 (tháng/năm).
