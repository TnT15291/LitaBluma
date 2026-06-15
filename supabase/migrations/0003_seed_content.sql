-- LitaBluma — static content seed (app content, never child data).
-- Mirrors src/lib/mock/content.ts so a real DB has parity with the mock layer.
-- Idempotent: re-running updates text in place. This content is still being
-- expanded (docs/current-state.md open item) — extend these inserts as the
-- full age-band template + recognition libraries are finalized.

-- Behavior templates -------------------------------------------------------
insert into behavior_templates (id, age_band, title, default_points, category, virtue) values
  ('t45_toys',  '4-5', 'Tự cất đồ chơi sau khi chơi',      1, 'routine', 'responsibility'),
  ('t45_brush', '4-5', 'Tự đánh răng buổi tối',            2, 'routine', 'independence'),
  ('t45_thanks','4-5', 'Nói "cảm ơn" và "xin lỗi"',        1, 'eq',      'empathy'),
  ('t45_dress', '4-5', 'Tự mặc quần áo',                   2, 'routine', 'independence'),
  ('t45_share', '4-5', 'Chia sẻ đồ chơi với bạn',          2, 'eq',      'empathy'),
  ('t45_calm',  '4-5', 'Hít thở khi tức giận',             3, 'eq',      'emotional_regulation'),
  ('t45_table', '4-5', 'Giúp dọn bàn ăn',                  2, 'family',  'responsibility'),
  ('t45_retry', '4-5', 'Thử lại khi chưa làm được',        2, 'eq',      'perseverance'),
  ('t67_bag',   '6-7', 'Tự chuẩn bị cặp sách',             2, 'routine', 'independence'),
  ('t67_homework','6-7','Làm bài tập về nhà',              2, 'routine', 'responsibility'),
  ('t67_brush', '6-7', 'Tự giác đánh răng sáng và tối',    2, 'routine', 'independence'),
  ('t67_listen','6-7', 'Lắng nghe khi người khác nói',     2, 'eq',      'empathy'),
  ('t67_feel',  '6-7', 'Nói ra cảm xúc của mình',          3, 'eq',      'emotional_regulation'),
  ('t67_chore', '6-7', 'Phụ giúp một việc nhà nhỏ',        2, 'family',  'responsibility'),
  ('t67_breathe','6-7','Đếm hoặc hít thở khi bực bội',     3, 'eq',      'emotional_regulation'),
  ('t67_persist','6-7','Kiên trì làm xong việc đang làm',  2, 'routine', 'perseverance'),
  ('t810_time', '8-10','Tự quản lý thời gian làm bài',     3, 'routine', 'independence'),
  ('t810_room', '8-10','Dọn dẹp phòng riêng',              2, 'routine', 'responsibility'),
  ('t810_help', '8-10','Giúp đỡ em hoặc bạn',              2, 'eq',      'empathy'),
  ('t810_resolve','8-10','Bình tĩnh giải quyết bất đồng',  3, 'eq',      'emotional_regulation'),
  ('t810_finish','8-10','Hoàn thành việc được giao',       2, 'family',  'perseverance'),
  ('t810_greet','8-10','Chủ động chào hỏi mọi người',      1, 'eq',      'empathy'),
  ('t810_money','8-10','Quản lý tiền tiêu vặt',            3, 'routine', 'responsibility'),
  ('t45_water', '4-5', 'Tự uống nước, không làm đổ',       1, 'routine', 'independence'),
  ('t45_hello', '4-5', 'Chào hỏi ông bà, người lớn',       1, 'eq',      'empathy'),
  ('t45_shoes', '4-5', 'Cất giày dép đúng chỗ',            1, 'routine', 'responsibility'),
  ('t67_read',  '6-7', 'Đọc sách 10 phút',                 2, 'routine', 'perseverance'),
  ('t67_sibling','6-7','Nhường nhịn em nhỏ',               2, 'eq',      'empathy'),
  ('t67_desk',  '6-7', 'Tự dọn góc học tập',               2, 'routine', 'responsibility'),
  ('t810_plan', '8-10','Lập kế hoạch cho ngày mai',        3, 'routine', 'independence'),
  ('t810_apology','8-10','Chủ động xin lỗi khi làm sai',   2, 'eq',      'emotional_regulation'),
  ('t810_chore','8-10','Nhận một việc nhà cố định',        2, 'family',  'responsibility')
on conflict (id) do update set
  age_band = excluded.age_band, title = excluded.title,
  default_points = excluded.default_points, category = excluded.category,
  virtue = excluded.virtue, is_active = true;

-- Recognition phrases (positive-only) --------------------------------------
insert into recognition_phrases (id, age_band, category, outcome, text) values
  ('rp_done_1', null, null,      'completed', 'Con đã tự làm điều đó — bố mẹ thấy con lớn thật rồi!'),
  ('rp_done_2', null, null,      'completed', 'Một hạt giống tốt vừa được gieo trong vườn của con.'),
  ('rp_done_3', null, 'routine', 'completed', 'Con nhớ tự làm việc này, giỏi quá đi!'),
  ('rp_done_4', null, 'eq',      'completed', 'Con đã chọn cách cư xử thật ấm áp. Bố mẹ tự hào lắm.'),
  ('rp_done_5', null, 'family',  'completed', 'Cảm ơn con đã giúp cả nhà — con là người bạn nhỏ đáng tin.'),
  ('rp_done_6',  null, null,      'completed', 'Việc nhỏ hôm nay là một bước con lớn lên. Bố mẹ thấy hết đấy!'),
  ('rp_done_7',  null, null,      'completed', 'Khu vườn của con vừa thêm một mầm xanh nhờ điều con vừa làm.'),
  ('rp_done_8',  null, 'routine', 'completed', 'Con tự giác làm rồi — thói quen tốt đang lớn dần trong con.'),
  ('rp_done_9',  null, 'eq',      'completed', 'Cách con cư xử hôm nay thật dễ thương. Trái tim con đang lớn lên mỗi ngày.'),
  ('rp_done_10', null, 'family',  'completed', 'Con đã góp một tay cho cả nhà — cảm ơn người bạn nhỏ chu đáo.'),
  ('rp_done_45', '4-5',  null,    'completed', 'Con của bố mẹ giỏi quá, tự làm được rồi này!'),
  ('rp_done_67', '6-7',  null,    'completed', 'Con đã tự lo được việc của mình — thật đáng nể!'),
  ('rp_done_810','8-10', null,    'completed', 'Con càng lớn càng tự lập, bố mẹ tin tưởng con nhiều lắm.'),
  ('rp_try_1',  null, null,      'tried',     'Con đã cố gắng, và cố gắng đó rất đáng quý.'),
  ('rp_try_2',  null, null,      'tried',     'Chưa xong cũng không sao — con đã dám thử, đó mới là điều quan trọng.'),
  ('rp_try_3',  null, 'eq',      'tried',     'Con đã cố giữ bình tĩnh. Lần sau sẽ dễ hơn một chút nữa.'),
  ('rp_try_4',  null, null,      'tried',     'Con đã thử, và mỗi lần thử là một lần con mạnh mẽ hơn.'),
  ('rp_try_5',  null, null,      'tried',     'Chưa xong không sao cả — điều quan trọng là con đã bắt đầu.'),
  ('rp_try_6',  null, 'routine', 'tried',     'Con đã cố làm việc này. Mai mình thử lại nhẹ nhàng hơn nhé.'),
  ('rp_try_7',  null, 'family',  'tried',     'Con đã muốn giúp — tấm lòng đó quý lắm rồi.'),
  ('rp_try_45', '4-5',  null,    'tried',     'Con đã cố gắng, bố mẹ thương lắm!'),
  ('rp_try_810','8-10', null,    'tried',     'Con đã nỗ lực — kiên trì như vậy rồi sẽ làm được.')
on conflict (id) do update set
  age_band = excluded.age_band, category = excluded.category,
  outcome = excluded.outcome, text = excluded.text, is_active = true;

-- Parent micro-pause prompts (shown on not_yet, parent-side only) -----------
insert into parent_pause_prompts (id, context, text) values
  ('pp1', 'not_yet', 'Chưa làm được hôm nay là chuyện bình thường. Ngày mai là một khởi đầu mới.'),
  ('pp2', 'not_yet', 'Hãy hít một hơi thật sâu. Con đang học, và con cần thời gian.'),
  ('pp3', 'not_yet', 'Thử nghĩ xem việc này có đang hơi khó với con không — có thể chia nhỏ hơn.'),
  ('pp4', 'not_yet', 'Sự kiên nhẫn của bố mẹ cũng là một món quà cho con.'),
  ('pp5', 'not_yet', 'Ghi nhận để mình cùng đồng hành, không phải để đánh giá con.'),
  ('pp6', 'not_yet', 'Đôi khi đổi thời điểm trong ngày sẽ giúp con dễ làm hơn.')
on conflict (id) do update set
  context = excluded.context, text = excluded.text, is_active = true;
