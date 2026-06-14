import type {
  BehaviorTemplate,
  ParentPausePrompt,
  RecognitionPhrase,
  RewardType,
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
  t('t45_toys', '4-5', 'Tự cất đồ chơi sau khi chơi', 1, 'routine'),
  t('t45_brush', '4-5', 'Tự đánh răng buổi tối', 2, 'routine'),
  t('t45_thanks', '4-5', 'Nói "cảm ơn" và "xin lỗi"', 1, 'eq'),
  t('t45_dress', '4-5', 'Tự mặc quần áo', 2, 'routine'),
  t('t45_share', '4-5', 'Chia sẻ đồ chơi với bạn', 2, 'eq'),
  t('t45_calm', '4-5', 'Hít thở khi tức giận', 3, 'eq'),
  t('t45_table', '4-5', 'Giúp dọn bàn ăn', 2, 'family'),
  // 6–7
  t('t67_bag', '6-7', 'Tự chuẩn bị cặp sách', 2, 'routine'),
  t('t67_homework', '6-7', 'Làm bài tập về nhà', 2, 'routine'),
  t('t67_brush', '6-7', 'Tự giác đánh răng sáng và tối', 2, 'routine'),
  t('t67_listen', '6-7', 'Lắng nghe khi người khác nói', 2, 'eq'),
  t('t67_feel', '6-7', 'Nói ra cảm xúc của mình', 3, 'eq'),
  t('t67_chore', '6-7', 'Phụ giúp một việc nhà nhỏ', 2, 'family'),
  t('t67_breathe', '6-7', 'Đếm hoặc hít thở khi bực bội', 3, 'eq'),
  // 8–10
  t('t810_time', '8-10', 'Tự quản lý thời gian làm bài', 3, 'routine'),
  t('t810_room', '8-10', 'Dọn dẹp phòng riêng', 2, 'routine'),
  t('t810_help', '8-10', 'Giúp đỡ em hoặc bạn', 2, 'eq'),
  t('t810_resolve', '8-10', 'Bình tĩnh giải quyết bất đồng', 3, 'eq'),
  t('t810_finish', '8-10', 'Hoàn thành việc được giao', 2, 'family'),
  t('t810_greet', '8-10', 'Chủ động chào hỏi mọi người', 1, 'eq'),
  t('t810_money', '8-10', 'Quản lý tiền tiêu vặt', 3, 'routine'),
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

export const RECOGNITION_PHRASES: RecognitionPhrase[] = [
  rp('rp_done_1', null, null, 'completed', 'Con đã tự làm điều đó — bố mẹ thấy con lớn thật rồi!'),
  rp('rp_done_2', null, null, 'completed', 'Một hạt giống tốt vừa được gieo trong vườn của con.'),
  rp('rp_done_3', null, 'routine', 'completed', 'Con nhớ tự làm việc này, giỏi quá đi!'),
  rp('rp_done_4', null, 'eq', 'completed', 'Con đã chọn cách cư xử thật ấm áp. Bố mẹ tự hào lắm.'),
  rp('rp_done_5', null, 'family', 'completed', 'Cảm ơn con đã giúp cả nhà — con là người bạn nhỏ đáng tin.'),
  rp('rp_try_1', null, null, 'tried', 'Con đã cố gắng, và cố gắng đó rất đáng quý.'),
  rp('rp_try_2', null, null, 'tried', 'Chưa xong cũng không sao — con đã dám thử, đó mới là điều quan trọng.'),
  rp('rp_try_3', null, 'eq', 'tried', 'Con đã cố giữ bình tĩnh. Lần sau sẽ dễ hơn một chút nữa.'),
];

function t(
  id: string,
  ageBand: BehaviorTemplate['ageBand'],
  title: string,
  defaultPoints: number,
  category: string,
): BehaviorTemplate {
  return { id, ageBand, title, defaultPoints, category };
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
