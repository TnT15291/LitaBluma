import type {
  BehaviorTemplate,
  ParentPausePrompt,
  RecognitionPhrase,
  RewardType,
  Virtue,
} from '@/lib/domain/types';

/**
 * Static app content — never child data. Always present (survives reset):
 * the behavior library, recognition lines, parent micro-pause prompts, the
 * system avatar set, and suggested starter rewards.
 */

export interface SystemAvatar {
  key: string;
  emoji: string;
  label: string;
}

/** No real photos, ever — only friendly system avatars (privacy rule). */
export const SYSTEM_AVATARS: SystemAvatar[] = [
  { key: 'fox', emoji: '🦊', label: 'Cáo' },
  { key: 'bear', emoji: '🐻', label: 'Gấu' },
  { key: 'rabbit', emoji: '🐰', label: 'Thỏ' },
  { key: 'cat', emoji: '🐱', label: 'Mèo' },
  { key: 'owl', emoji: '🦉', label: 'Cú' },
  { key: 'panda', emoji: '🐼', label: 'Gấu trúc' },
  { key: 'frog', emoji: '🐸', label: 'Ếch' },
  { key: 'penguin', emoji: '🐧', label: 'Cánh cụt' },
];

export function avatarEmoji(key: string): string {
  return SYSTEM_AVATARS.find((a) => a.key === key)?.emoji ?? '🦊';
}

export const BEHAVIOR_TEMPLATES: BehaviorTemplate[] = [
  // 4–5
  t('t45_toys', '4-5', 'Tự cất đồ chơi sau khi chơi', 1, 'routine', 'responsibility'),
  t('t45_brush', '4-5', 'Tự đánh răng buổi tối', 2, 'routine', 'independence'),
  t('t45_thanks', '4-5', 'Nói "cảm ơn" và "xin lỗi"', 1, 'eq', 'empathy'),
  t('t45_dress', '4-5', 'Tự mặc quần áo', 2, 'routine', 'independence'),
  t('t45_share', '4-5', 'Chia sẻ đồ chơi với bạn', 2, 'eq', 'empathy'),
  t('t45_calm', '4-5', 'Hít thở khi tức giận', 3, 'eq', 'emotional_regulation'),
  t('t45_table', '4-5', 'Giúp dọn bàn ăn', 2, 'family', 'responsibility'),
  t('t45_retry', '4-5', 'Thử lại khi chưa làm được', 2, 'eq', 'perseverance'),
  t('t45_water', '4-5', 'Tự uống nước, không làm đổ', 1, 'routine', 'independence'),
  t('t45_hello', '4-5', 'Chào hỏi ông bà, người lớn', 1, 'eq', 'empathy'),
  t('t45_shoes', '4-5', 'Cất giày dép đúng chỗ', 1, 'routine', 'responsibility'),
  // 6–7
  t('t67_bag', '6-7', 'Tự chuẩn bị cặp sách', 2, 'routine', 'independence'),
  t('t67_homework', '6-7', 'Làm bài tập về nhà', 2, 'routine', 'responsibility'),
  t('t67_brush', '6-7', 'Tự giác đánh răng sáng và tối', 2, 'routine', 'independence'),
  t('t67_listen', '6-7', 'Lắng nghe khi người khác nói', 2, 'eq', 'empathy'),
  t('t67_feel', '6-7', 'Nói ra cảm xúc của mình', 3, 'eq', 'emotional_regulation'),
  t('t67_chore', '6-7', 'Phụ giúp một việc nhà nhỏ', 2, 'family', 'responsibility'),
  t('t67_breathe', '6-7', 'Đếm hoặc hít thở khi bực bội', 3, 'eq', 'emotional_regulation'),
  t('t67_persist', '6-7', 'Kiên trì làm xong việc đang làm', 2, 'routine', 'perseverance'),
  t('t67_read', '6-7', 'Đọc sách 10 phút', 2, 'routine', 'perseverance'),
  t('t67_sibling', '6-7', 'Nhường nhịn em nhỏ', 2, 'eq', 'empathy'),
  t('t67_desk', '6-7', 'Tự dọn góc học tập', 2, 'routine', 'responsibility'),
  // 8–10
  t('t810_time', '8-10', 'Tự quản lý thời gian làm bài', 3, 'routine', 'independence'),
  t('t810_room', '8-10', 'Dọn dẹp phòng riêng', 2, 'routine', 'responsibility'),
  t('t810_help', '8-10', 'Giúp đỡ em hoặc bạn', 2, 'eq', 'empathy'),
  t('t810_resolve', '8-10', 'Bình tĩnh giải quyết bất đồng', 3, 'eq', 'emotional_regulation'),
  t('t810_finish', '8-10', 'Hoàn thành việc được giao', 2, 'family', 'perseverance'),
  t('t810_greet', '8-10', 'Chủ động chào hỏi mọi người', 1, 'eq', 'empathy'),
  t('t810_money', '8-10', 'Quản lý tiền tiêu vặt', 3, 'routine', 'responsibility'),
  t('t810_plan', '8-10', 'Lập kế hoạch cho ngày mai', 3, 'routine', 'independence'),
  t('t810_apology', '8-10', 'Chủ động xin lỗi khi làm sai', 2, 'eq', 'emotional_regulation'),
  t('t810_chore', '8-10', 'Nhận một việc nhà cố định', 2, 'family', 'responsibility'),
];

export interface RewardSuggestion {
  title: string;
  rewardType: RewardType;
  pointsCost: number;
}

/** Choice/activity-first suggestions (objects stay rare — product rule). */
export const STARTER_REWARD_SUGGESTIONS: RewardSuggestion[] = [
  { title: 'Chọn truyện đọc trước khi ngủ', rewardType: 'choice', pointsCost: 5 },
  { title: '15 phút chơi cùng bố/mẹ', rewardType: 'activity', pointsCost: 8 },
  { title: 'Chọn món ăn tối cuối tuần', rewardType: 'choice', pointsCost: 6 },
  { title: 'Một buổi đi công viên cùng bố mẹ', rewardType: 'activity', pointsCost: 12 },
  { title: 'Cùng làm bánh', rewardType: 'activity', pointsCost: 10 },
];

/** Parent self-regulation micro-pause — shown on `not_yet`. Never to the child. */
export const PARENT_PAUSE_PROMPTS: ParentPausePrompt[] = [
  { id: 'pp1', text: 'Chưa làm được hôm nay là chuyện bình thường. Ngày mai là một khởi đầu mới.' },
  { id: 'pp2', text: 'Hãy hít một hơi thật sâu. Con đang học, và con cần thời gian.' },
  { id: 'pp3', text: 'Thử nghĩ xem việc này có đang hơi khó với con không — có thể chia nhỏ hơn.' },
  { id: 'pp4', text: 'Sự kiên nhẫn của bố mẹ cũng là một món quà cho con.' },
  { id: 'pp5', text: 'Ghi nhận để mình cùng đồng hành, không phải để đánh giá con.' },
  { id: 'pp6', text: 'Đôi khi đổi thời điểm trong ngày sẽ giúp con dễ làm hơn.' },
];

/**
 * Weekly report content (non-AI). The report's parent-side reflection and tip
 * rotate from these static sets — the always-available fallback before any AI
 * layer. Reflection = phản tư cho cha mẹ (no scoring); tip = gợi ý khả thi.
 */
export const WEEKLY_REFLECTION_PROMPTS: string[] = [
  'Tuần này, lúc nào bạn thấy mình giữ được bình tĩnh khi đồng hành cùng con?',
  'Có khoảnh khắc nào bạn phản ứng nhẹ nhàng hơn so với trước không?',
  'Điều gì ở con tuần này khiến bạn thấy ấm lòng nhất?',
  'Khi con "chưa làm được", bạn đã đón nhận điều đó thế nào?',
  'Một điều nhỏ bạn muốn thử khác đi trong tuần tới là gì?',
];

export const WEEKLY_PARENT_TIPS: string[] = [
  'Khi khen, hãy mô tả việc con làm ("con tự cất đồ chơi rồi") thay vì chỉ "giỏi quá" — con hiểu rõ điều gì đáng quý.',
  'Một việc "chưa làm" lặp lại thường là việc đang hơi khó, không phải con lười — thử chia nhỏ hơn.',
  'Công nhận cảm xúc trước khi nhắc việc: "Con đang buồn nhỉ" giúp con hợp tác hơn lời nhắc thẳng.',
  'Cho con một lựa chọn nhỏ ("đánh răng trước hay thay đồ trước?") để con thấy mình được làm chủ.',
  'Ghi nhận nỗ lực, không chỉ kết quả — "con đã cố gắng" nuôi sự kiên trì bền hơn lời khen kết quả.',
];

export const RECOGNITION_PHRASES: RecognitionPhrase[] = [
  // Broad — any band, any category (the most-reused pool, so keep it varied).
  rp('rp_done_1', null, null, 'completed', 'Con đã tự làm điều đó — bố mẹ thấy con lớn thật rồi!'),
  rp('rp_done_2', null, null, 'completed', 'Một hạt giống tốt vừa được gieo trong vườn của con.'),
  rp(
    'rp_done_6',
    null,
    null,
    'completed',
    'Việc nhỏ hôm nay là một bước con lớn lên. Bố mẹ thấy hết đấy!',
  ),
  rp(
    'rp_done_7',
    null,
    null,
    'completed',
    'Khu vườn của con vừa thêm một mầm xanh nhờ điều con vừa làm.',
  ),
  // Broad — by category.
  rp('rp_done_3', null, 'routine', 'completed', 'Con nhớ tự làm việc này, giỏi quá đi!'),
  rp(
    'rp_done_8',
    null,
    'routine',
    'completed',
    'Con tự giác làm rồi — thói quen tốt đang lớn dần trong con.',
  ),
  rp('rp_done_4', null, 'eq', 'completed', 'Con đã chọn cách cư xử thật ấm áp. Bố mẹ tự hào lắm.'),
  rp(
    'rp_done_9',
    null,
    'eq',
    'completed',
    'Cách con cư xử hôm nay thật dễ thương. Trái tim con đang lớn lên mỗi ngày.',
  ),
  rp(
    'rp_done_5',
    null,
    'family',
    'completed',
    'Cảm ơn con đã giúp cả nhà — con là người bạn nhỏ đáng tin.',
  ),
  rp(
    'rp_done_10',
    null,
    'family',
    'completed',
    'Con đã góp một tay cho cả nhà — cảm ơn người bạn nhỏ chu đáo.',
  ),
  // Band-specific warmth (category-agnostic).
  rp('rp_done_45', '4-5', null, 'completed', 'Con của bố mẹ giỏi quá, tự làm được rồi này!'),
  rp('rp_done_67', '6-7', null, 'completed', 'Con đã tự lo được việc của mình — thật đáng nể!'),
  rp(
    'rp_done_810',
    '8-10',
    null,
    'completed',
    'Con càng lớn càng tự lập, bố mẹ tin tưởng con nhiều lắm.',
  ),
  // Tried — effort is the point, never the result.
  rp('rp_try_1', null, null, 'tried', 'Con đã cố gắng, và cố gắng đó rất đáng quý.'),
  rp(
    'rp_try_2',
    null,
    null,
    'tried',
    'Chưa xong cũng không sao — con đã dám thử, đó mới là điều quan trọng.',
  ),
  rp('rp_try_4', null, null, 'tried', 'Con đã thử, và mỗi lần thử là một lần con mạnh mẽ hơn.'),
  rp(
    'rp_try_5',
    null,
    null,
    'tried',
    'Chưa xong không sao cả — điều quan trọng là con đã bắt đầu.',
  ),
  rp('rp_try_3', null, 'eq', 'tried', 'Con đã cố giữ bình tĩnh. Lần sau sẽ dễ hơn một chút nữa.'),
  rp(
    'rp_try_6',
    null,
    'routine',
    'tried',
    'Con đã cố làm việc này. Mai mình thử lại nhẹ nhàng hơn nhé.',
  ),
  rp('rp_try_7', null, 'family', 'tried', 'Con đã muốn giúp — tấm lòng đó quý lắm rồi.'),
  rp('rp_try_45', '4-5', null, 'tried', 'Con đã cố gắng, bố mẹ thương lắm!'),
  rp('rp_try_810', '8-10', null, 'tried', 'Con đã nỗ lực — kiên trì như vậy rồi sẽ làm được.'),
];

function t(
  id: string,
  ageBand: BehaviorTemplate['ageBand'],
  title: string,
  defaultPoints: number,
  category: string,
  virtue: Virtue,
): BehaviorTemplate {
  return { id, ageBand, title, defaultPoints, category, virtue };
}

function rp(
  id: string,
  ageBand: RecognitionPhrase['ageBand'],
  category: string | null,
  outcome: RecognitionPhrase['outcome'],
  text: string,
): RecognitionPhrase {
  return { id, ageBand, category, outcome, text, isActive: true };
}
