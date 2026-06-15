import type { SituationGuide } from '@/lib/domain/types';

/**
 * Static situation library (non-AI). Parent coaching content built on the
 * Phan Hồ Điệp 4-step (Công nhận → Bình tĩnh → Thấu cảm → Giải quyết) and the
 * Faber & Mazlish communication style (see docs/eq-source-material.md). App
 * content, never child data; no diagnosis, parent-mediated.
 *
 * This is a seed set — extend per age band as the library grows; it maps 1:1 to
 * a future `situation_library` table.
 */
export const SITUATIONS: SituationGuide[] = [
  {
    id: 'sit_anger_tantrum',
    title: 'Con nóng giận, ăn vạ hoặc ném đồ',
    ageBands: ['4-5', '6-7'],
    emotion: 'Giận dữ, mất kiểm soát',
    cause:
      'Cảm xúc quá lớn so với khả năng tự điều tiết ở tuổi này — thường vì bị từ chối hoặc hụt hẫng.',
    virtue: 'emotional_regulation',
    steps: {
      acknowledge:
        'Gọi tên cảm xúc thay vì cấm: "Con đang rất giận. Con muốn cái đó mà chưa được."',
      calm: 'Hạ giọng, ngồi ngang tầm mắt con: "Mình hít thở cùng nhau nhé." Đừng giảng giải khi con đang ở đỉnh điểm.',
      empathize: 'Cho con thấy bạn hiểu: "Giận thì khó chịu lắm. Bố/mẹ cũng từng như vậy."',
      resolve:
        'Khi con dịu lại, cùng tìm cách: "Lần sau khi giận, con muốn ôm gối hay hít thở cùng bố/mẹ?"',
    },
    avoid:
      '"Nín ngay!" hay phạt úp mặt vào tường — phủ nhận cảm xúc dạy con giấu cảm xúc, không học cách điều tiết.',
  },
  {
    id: 'sit_lying_homework',
    title: 'Con nói dối đã làm xong bài',
    ageBands: ['6-7', '8-10'],
    emotion: 'Sợ bị mắng, xấu hổ',
    cause: 'Sợ bị phạt nếu nói thật — nói dối để tránh hậu quả, không phải bản tính xấu.',
    virtue: 'responsibility',
    steps: {
      acknowledge: '"Con sợ bố/mẹ giận nếu nói chưa làm xong. Cảm giác đó là bình thường."',
      calm: '"Mình ngồi xuống một lúc rồi nói chuyện, không vội đâu."',
      empathize: '"Bố/mẹ cũng từng ngại nói thật. Nhưng sự thật làm bố/mẹ tin con hơn."',
      resolve: '"Giờ con nói thật được không? Mình cùng làm cho xong nhé."',
    },
    avoid: '"Con dám nói dối! Hư quá!" — dán nhãn khiến con càng sợ và càng giấu kỹ hơn lần sau.',
  },
  {
    id: 'sit_school_fear',
    title: 'Con sợ đi học, sợ bạn cười nhạo',
    ageBands: ['6-7', '8-10'],
    emotion: 'Sợ hãi, xấu hổ',
    cause: 'Có thể có sự kiện khiến con thấy bị cười (đôi khi con phóng đại nỗi sợ trong đầu).',
    virtue: 'emotional_regulation',
    steps: {
      acknowledge: '"Con sợ các bạn cười. Điều đó làm con thấy tổn thương."',
      calm: '"Hôm nay mình không vội. Ngồi kể cho bố/mẹ nghe chuyện gì đã xảy ra nhé."',
      empathize: '"Con có nhớ lần nào thấy một bạn khác bị cười không? Lúc đó con nghĩ gì?"',
      resolve:
        '"Mình làm gì bây giờ nhỉ? Con muốn nói chuyện với bạn đó, hay rủ một bạn thân đi cùng?"',
    },
    avoid:
      '"Có gì đâu mà sợ, đi học đi!" — gạt nỗi sợ khiến con thấy không được hiểu và càng đóng kín.',
  },
  {
    id: 'sit_toy_grabbed',
    title: 'Con khóc vì bị giành mất đồ chơi',
    ageBands: ['4-5'],
    emotion: 'Buồn, tức, bất lực',
    cause: 'Tuổi này chưa có kỹ năng thương lượng — mất đồ chơi là một mất mát thật với con.',
    virtue: 'empathy',
    steps: {
      acknowledge: '"Con buồn vì bạn lấy mất đồ chơi. Con đang chơi vui mà."',
      calm: 'Ôm con một chút cho con ổn định trước khi nói tiếp.',
      empathize: '"Bạn cũng đang thích món đó. Hai bạn cùng muốn chơi nhỉ."',
      resolve: '"Mình thử thay phiên nhau nhé — con chơi một lúc rồi đến bạn, được không?"',
    },
    avoid:
      '"Có cái đồ chơi mà cũng khóc!" — xem nhẹ cảm xúc dạy con rằng cảm xúc của mình không quan trọng.',
  },
  {
    id: 'sit_stop_playing',
    title: 'Con không chịu dừng chơi để ăn/ngủ',
    ageBands: ['4-5', '6-7'],
    emotion: 'Hụt hẫng, phản kháng',
    cause: 'Chuyển từ việc đang thích sang việc phải làm là điều khó với trẻ nhỏ.',
    virtue: 'emotional_regulation',
    steps: {
      acknowledge: '"Con đang chơi vui lắm, dừng lại thật khó."',
      calm: 'Báo trước thay vì cắt ngang: "Còn 5 phút nữa rồi mình ăn tối nhé."',
      empathize: '"Bố/mẹ cũng ghét phải dừng giữa chừng khi đang vui."',
      resolve: 'Trao một lựa chọn nhỏ: "Con muốn mang bạn gấu lên bàn, hay cất vào giỏ trước?"',
    },
    avoid: '"Bỏ xuống ngay, ăn cơm!" — ra lệnh đột ngột thường đổi lấy một cuộc giằng co.',
  },
  {
    id: 'sit_lose_game',
    title: 'Con bực bội hoặc khóc khi thua',
    ageBands: ['6-7', '8-10'],
    emotion: 'Thất vọng, xấu hổ vì thua',
    cause: 'Con đang gắn giá trị bản thân với thắng/thua, chưa quen với hụt hẫng.',
    virtue: 'perseverance',
    steps: {
      acknowledge: '"Thua lúc gần thắng, ấm ức thật đấy."',
      calm: '"Mình nghỉ một chút rồi chơi lại nhé."',
      empathize: '"Bố/mẹ cũng không thích thua. Ai cũng vậy mà."',
      resolve:
        '"Con nghĩ lần sau thử cách nào khác không? Quan trọng là mình chơi vui và cố hết sức."',
    },
    avoid: '"Có thua một ván mà cũng dỗi!" — chế giễu khiến con sợ thử thách và sợ thất bại.',
  },
  {
    id: 'sit_i_hate_you',
    title: 'Con cãi lại, nói "con ghét bố/mẹ"',
    ageBands: ['8-10'],
    emotion: 'Giận dữ, cảm thấy bị đối xử bất công',
    cause: 'Câu nói là cách con xả cơn giận, không phải sự thật về tình cảm của con.',
    virtue: 'emotional_regulation',
    steps: {
      acknowledge: '"Con đang giận đến mức nói vậy. Chắc con thấy rất bất công."',
      calm: 'Giữ bình tĩnh, không đáp trả bằng giận: "Bố/mẹ sẽ ở đây khi con sẵn sàng nói chuyện."',
      empathize: '"Ai cũng có lúc giận người mình thương. Bố/mẹ vẫn thương con."',
      resolve:
        'Khi đã dịu: "Giờ mình nói về điều làm con giận nhé — chuyện gì khiến con thấy bất công?"',
    },
    avoid: '"Mày dám nói thế à!" — leo thang khiến con học cách dùng lời tổn thương mỗi khi giận.',
  },
  {
    id: 'sit_sibling_fight',
    title: 'Con tranh giành hoặc đánh em',
    ageBands: ['4-5', '6-7', '8-10'],
    emotion: 'Ghen tị, tức giận',
    cause: 'Cảm giác bị so sánh hoặc thiếu chú ý; con chưa biết cách diễn đạt nhu cầu của mình.',
    virtue: 'empathy',
    steps: {
      acknowledge: '"Con đang giận em. Có chuyện gì khiến con khó chịu vậy?"',
      calm: 'Tách hai bé một chút cho cả hai hạ nhiệt, đừng phân xử ngay.',
      empathize: '"Đôi khi có em cùng chơi cũng khó chịu nhỉ — phải chia sẻ nhiều thứ."',
      resolve: '"Mình thử thỏa thuận: đồ của ai thì người đó quyết định cho mượn. Con thấy sao?"',
    },
    avoid: 'Luôn bắt anh/chị nhường vì "lớn hơn" — tạo ấm ức và so sánh ngầm giữa các con.',
  },
];
