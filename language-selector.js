(function () {
  const languages = [
    { code: 'en', shortLabel: 'EN', label: '영어', flag: '🇺🇸' },
    { code: 'ja', shortLabel: 'JP', label: '일본어', flag: '🇯🇵' },
    { code: 'zh', shortLabel: 'CN', label: '중국어', flag: '🇨🇳' },
    { code: 'tl', shortLabel: 'PH', label: '필리핀어', flag: '🇵🇭' },
    { code: 'ko', shortLabel: 'KO', label: '한국어', flag: '🇰🇷' },
  ];

  const storageKey = 'jmcLanguage';
  const originalTitle = document.title;
  const originalText = new WeakMap();
  const originalAttr = new WeakMap();
  const attrs = ['placeholder', 'title', 'aria-label', 'alt'];

  const i18n = {
    en: {
      '홈': 'Home',
      '초청의 글': 'Invitation',
      'CI소개': 'CI',
      '조직': 'Organization',
      '강사 소개': 'Speakers',
      '일정': 'Schedule',
      '게시판': 'Board',
      '공지사항': 'Notices',
      '문의/답변': 'Q&A',
      '스탭자료실': 'Staff Resources',
      '스탭라운지': 'Staff Lounge',
      'STAFF 라운지': 'Staff Lounge',
      '오시는 길': 'Directions',
      '로그인': 'Login',
      '등록하기': 'Register',
      '지금 등록하기': 'Register Now',
      '홍보 영상 보기': 'Watch Promo Video',
      '언어 선택': 'Language',
      '영어': 'English',
      '일본어': 'Japanese',
      '중국어': 'Chinese',
      '필리핀어': 'Filipino',
      '한국어': 'Korean',
      '지저스 미션 컨퍼런스': 'Jesus Mission Conference',
      '지저스 미션 컨퍼런스 2026': 'Jesus Mission Conference 2026',
      '지저스 미션 컨퍼런스 ㅣ 스탭라운지': 'Jesus Mission Conference | Staff Lounge',
      '복음은 멈추지 않는다': 'The Gospel Never Stops',
      '복음은': 'The Gospel',
      '멈추지 않는다': 'Never Stops',
      '"흔들리는 시대, 계속되는 하나님의 선교"': '"In a Shaking Age, God’s Mission Continues"',
      '"흔들리는 시대,': '"In a Shaking Age,',
      '계속되는 하나님의 선교"': 'God’s Mission Continues"',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을 새롭게 붙들기 원하는 모든 세대의 성도들': 'For every generation of believers who desire to renew their missionary life and calling with the next generation.',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을': 'For believers of every generation who desire to renew',
      '새롭게 붙들기 원하는 모든 세대의 성도들': 'their missionary life and calling with the next generation',
      '등록비 무료 · 숙소 별도': 'Free registration · Lodging separate',
      '성서침례대학원대학교 패트릭 채플관': 'Patrick Chapel, Korea Baptist Theological Seminary',
      '주최': 'Host',
      '성서침례대학원대학교, 선교위원회': 'Korea Baptist Theological Seminary, Mission Committee',
      '주관': 'Organizer',
      '성침진흥위원회, 조이플 미션': 'Bible Baptist Promotion Committee, Joyful Mission',
      '해외 참석자들과 이주민 성도들의 참석을 위해 AI를 통한 다국어 통역이 실시간 제공됩니다.': 'AI-powered multilingual interpretation is provided in real time for overseas participants and migrant believers.',
      '숙소신청': 'Accommodation',
      'ACCOMMODATION': 'ACCOMMODATION',
      '컨퍼런스 참석자 숙소 안내': 'Accommodation Guide for Conference Participants',
      '숙소는 별도 신청 및 비용 부담으로 안내됩니다.': 'Accommodation requires a separate request and fee.',
      '원거리 참석자와 단체 참가자를 위해 숙소 신청 정보를 별도로 안내드립니다. 신청 가능 객실, 이용 기간, 비용 및 입실 안내는 확정되는 대로 순차적으로 공지됩니다.': 'Accommodation information for long-distance and group participants will be announced separately. Available rooms, dates, fees, and check-in details will be posted as they are confirmed.',
      '숙소 신청 안내 보기': 'View Accommodation Guide',
      '주최측에 숙소 신청시, 채플관 주변에 캐노피 텐트(6~8인용)가 숙소로 제공 됩니다.(단체신청시 별도배정 가능)': 'When accommodation is requested through the organizers, canopy tents near the chapel hall for 6 to 8 people will be provided as lodging. Separate assignment is available for group applications.',
      'MORE': 'MORE',
      '답변완료': 'Answered',
      '접수중': 'Received',
      '공지사항을 불러오는 중입니다.': 'Loading notices.',
      '등록비 무료 안내': 'Free Registration Notice',
      "숙소요청시 교회별로 '캐노피 텐트'가 제공 됩니다.": 'Canopy tents will be provided by church when accommodation is requested.',
      '캐노피 텐트': 'Canopy Tent',
      '구분': 'Type',
      '제목': 'Title',
      '작성일': 'Date',
      '중요': 'Important',
      '공지': 'Notice',
      '등록은 무료로 참여할 수 있나요?': 'Can I attend for free?',
      '숙소 신청과 비용은 어떻게 안내되나요?': 'How are accommodation requests and fees handled?',
      '단체 등록 문의는 어디로 하면 되나요?': 'Where can I ask about group registration?',
      '현장 주차와 셔틀 안내가 있나요?': 'Is there parking or shuttle information?',
      '현장 등록 및 안내': 'On-site Registration & Information',
      '2026년 10월 9일(금) – 10일(토)': 'October 9 (Fri) – 10 (Sat), 2026',
      '컨퍼런스 당일 오후 3시에 패트릭 채플관 2층 접수처에서 명찰 및 웰컴 키트 수령이 가능합니다. 쾌적한 입장을 위해 가급적 사전 등록을 권장드립니다.': 'On the conference day, name tags and welcome kits will be available from 3 PM at the registration desk on the 2nd floor of Patrick Chapel. Advance registration is recommended for a smoother check-in.',
      '자주 묻는 질문 보러가기': 'View FAQ',
      '실시간 알림': 'Real-time Alerts',
      '실시간 문의': 'Live Inquiry',
      'JMC 실시간 문의': 'JMC Live Inquiry',
      '운영팀에 문의를 남길 수 있어요': 'Leave a message for the operations team',
      '컨퍼런스 전용 앱을 다운로드하시면 일정 변경 및 중요 공지사항을 즉시 받아보실 수 있습니다.': 'Download the conference app to receive schedule changes and important notices immediately.',
      '협력 및 후원 기관': 'Partners & Sponsors',
      '협력': 'Partner',
      '후원': 'Sponsor',
      '성침트리뷴': 'Bible Baptist Tribune',
      '크리스천 심리상담센터': 'Christian Counseling Center',
      '꿈을심는교회': 'Dream Planting Church',
      '주사랑교회': 'Lord’s Love Church',
      '서울성서침례교회': 'Seoul Bible Baptist Church',
      '© 2026 지저스 미션 컨퍼런스. All rights reserved.': '© 2026 Jesus Mission Conference. All rights reserved.',
      '지저스 미션 컨퍼런스. All rights reserved.': 'Jesus Mission Conference. All rights reserved.',
      '이용약관': 'Terms',
      '개인정보처리방침': 'Privacy Policy',
      '문의하기': 'Contact',
      '컨퍼런스 조직': 'Conference Organization',
      '초청의 글 페이지': 'Invitation',
      '강사 소개 페이지': 'Speakers',
      '일정 안내': 'Schedule',
      '공지사항 게시판': 'Notices',
      '문의/답변 게시판': 'Q&A Board',
      '목록으로': 'Back to List',
      '이전': 'Previous',
      '다음': 'Next',
      '닫기': 'Close',
      '회원 로그인': 'Member Login',
      '회원가입': 'Sign Up',
      '이름': 'Name',
      '이메일': 'Email',
      '비밀번호': 'Password',
      'Google 계정으로 계속하기': 'Continue with Google',
    },
    ja: {
      '홈': 'ホーム',
      '초청의 글': '招待の言葉',
      'CI소개': 'CI紹介',
      '조직': '組織',
      '강사 소개': '講師紹介',
      '일정': '日程',
      '게시판': '掲示板',
      '공지사항': 'お知らせ',
      '문의/답변': 'お問い合わせ/回答',
      '스탭자료실': 'スタッフ資料室',
      '스탭라운지': 'スタッフラウンジ',
      'STAFF 라운지': 'スタッフラウンジ',
      '오시는 길': 'アクセス',
      '로그인': 'ログイン',
      '등록하기': '登録する',
      '지금 등록하기': '今すぐ登録',
      '홍보 영상 보기': '紹介映像を見る',
      '언어 선택': '言語選択',
      '영어': '英語',
      '일본어': '日本語',
      '중국어': '中国語',
      '필리핀어': 'フィリピン語',
      '한국어': '韓国語',
      '지저스 미션 컨퍼런스': 'ジーザス・ミッション・カンファレンス',
      '지저스 미션 컨퍼런스 2026': 'ジーザス・ミッション・カンファレンス 2026',
      '지저스 미션 컨퍼런스 ㅣ 스탭라운지': 'ジーザス・ミッション・カンファレンス | スタッフラウンジ',
      '복음은 멈추지 않는다': '福音は止まらない',
      '복음은': '福音は',
      '멈추지 않는다': '止まらない',
      '"흔들리는 시대, 계속되는 하나님의 선교"': '「揺れ動く時代、続いていく神の宣教」',
      '"흔들리는 시대,': '「揺れ動く時代、',
      '계속되는 하나님의 선교"': '続いていく神の宣教」',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을 새롭게 붙들기 원하는 모든 세대의 성도들': '次世代と共に宣教的な生き方と召しを新たに受け止めたいすべての世代の信徒が対象です。',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을': '次世代と共に宣教的な生き方と召しを',
      '새롭게 붙들기 원하는 모든 세대의 성도들': '新たに受け止めたいすべての世代の信徒',
      '등록비 무료 · 숙소 별도': '登録無料・宿泊別途',
      '성서침례대학원대학교 패트릭 채플관': '聖書バプテスト大学院大学 パトリック・チャペル館',
      '주최': '主催',
      '성서침례대학원대학교, 선교위원회': '聖書バプテスト大学院大学、宣教委員会',
      '주관': '主管',
      '성침진흥위원회, 조이플 미션': '聖浸振興委員会、ジョイフルミッション',
      '해외 참석자들과 이주민 성도들의 참석을 위해 AI를 통한 다국어 통역이 실시간 제공됩니다.': '海外参加者と移住者信徒のために、AIによる多言語通訳がリアルタイムで提供されます。',
      '숙소신청': '宿泊申請',
      '컨퍼런스 참석자 숙소 안내': 'カンファレンス参加者の宿泊案内',
      '숙소는 별도 신청 및 비용 부담으로 안내됩니다.': '宿泊は別途申請および費用負担で案内されます。',
      '원거리 참석자와 단체 참가자를 위해 숙소 신청 정보를 별도로 안내드립니다. 신청 가능 객실, 이용 기간, 비용 및 입실 안내는 확정되는 대로 순차적으로 공지됩니다.': '遠方からの参加者と団体参加者のために、宿泊申請情報を別途ご案内します。利用可能な客室、期間、費用、入室案内は確定次第順次お知らせします。',
      '숙소 신청 안내 보기': '宿泊申請案内を見る',
      '주최측에 숙소 신청시, 채플관 주변에 캐노피 텐트(6~8인용)가 숙소로 제공 됩니다.(단체신청시 별도배정 가능)': '主催側に宿泊を申請すると、チャペル館周辺のキャノピーテント（6〜8人用）が宿泊場所として提供されます。（団体申請時は別途割り当て可能）',
      '답변완료': '回答完了',
      '접수중': '受付中',
      '공지사항을 불러오는 중입니다.': 'お知らせを読み込み中です。',
      '등록비 무료 안내': '登録無料のご案内',
      "숙소요청시 교회별로 '캐노피 텐트'가 제공 됩니다.": '宿泊申請時、教会別にキャノピーテントが提供されます。',
      '캐노피 텐트': 'キャノピーテント',
      '구분': '区分',
      '제목': 'タイトル',
      '작성일': '作成日',
      '중요': '重要',
      '공지': 'お知らせ',
      '등록은 무료로 참여할 수 있나요?': '登録は無料で参加できますか？',
      '숙소 신청과 비용은 어떻게 안내되나요?': '宿泊申請と費用はどのように案内されますか？',
      '단체 등록 문의는 어디로 하면 되나요?': '団体登録の問い合わせはどこにすればよいですか？',
      '현장 주차와 셔틀 안내가 있나요?': '現地駐車場とシャトル案内はありますか？',
      '현장 등록 및 안내': '現地登録と案内',
      '2026년 10월 9일(금) – 10일(토)': '2026年10月9日（金）〜10日（土）',
      '컨퍼런스 당일 오후 3시에 패트릭 채플관 2층 접수처에서 명찰 및 웰컴 키트 수령이 가능합니다. 쾌적한 입장을 위해 가급적 사전 등록을 권장드립니다.': 'カンファレンス当日午後3時から、パトリック・チャペル館2階受付で名札とウェルカムキットを受け取れます。円滑な入場のため、できるだけ事前登録をおすすめします。',
      '자주 묻는 질문 보러가기': 'よくある質問を見る',
      '실시간 알림': 'リアルタイム通知',
      '실시간 문의': 'リアルタイムお問い合わせ',
      'JMC 실시간 문의': 'JMC リアルタイムお問い合わせ',
      '운영팀에 문의를 남길 수 있어요': '運営チームにお問い合わせを残せます',
      '컨퍼런스 전용 앱을 다운로드하시면 일정 변경 및 중요 공지사항을 즉시 받아보실 수 있습니다.': 'カンファレンス専用アプリをダウンロードすると、日程変更や重要なお知らせをすぐに確認できます。',
      '협력 및 후원 기관': '協力・後援機関',
      '협력': '協力',
      '후원': '後援',
      '성침트리뷴': '聖浸トリビューン',
      '크리스천 심리상담센터': 'クリスチャン心理相談センター',
      '꿈을심는교회': '夢を植える教会',
      '주사랑교회': '主愛教会',
      '서울성서침례교회': 'ソウル聖書バプテスト教会',
      '© 2026 지저스 미션 컨퍼런스. All rights reserved.': '© 2026 ジーザス・ミッション・カンファレンス. All rights reserved.',
      '이용약관': '利用規約',
      '개인정보처리방침': '個人情報処理方針',
      '문의하기': 'お問い合わせ',
      '컨퍼런스 조직': 'カンファレンス組織',
      '목록으로': '一覧へ',
      '닫기': '閉じる',
      '회원 로그인': '会員ログイン',
      '회원가입': '会員登録',
      '이름': '名前',
      '이메일': 'メール',
      '비밀번호': 'パスワード',
    },
    zh: {
      '홈': '首页',
      '초청의 글': '邀请函',
      'CI소개': 'CI介绍',
      '조직': '组织',
      '강사 소개': '讲员介绍',
      '일정': '日程',
      '게시판': '公告板',
      '공지사항': '公告',
      '문의/답변': '问答',
      '스탭자료실': '工作人员资料室',
      '스탭라운지': '工作人员休息室',
      'STAFF 라운지': '工作人员休息室',
      '오시는 길': '交通指南',
      '로그인': '登录',
      '등록하기': '报名',
      '지금 등록하기': '立即报名',
      '홍보 영상 보기': '观看宣传视频',
      '언어 선택': '选择语言',
      '영어': '英语',
      '일본어': '日语',
      '중국어': '中文',
      '필리핀어': '菲律宾语',
      '한국어': '韩语',
      '지저스 미션 컨퍼런스': '耶稣宣教大会',
      '지저스 미션 컨퍼런스 2026': '耶稣宣教大会 2026',
      '지저스 미션 컨퍼런스 ㅣ 스탭라운지': '耶稣宣教大会 | 工作人员休息室',
      '복음은 멈추지 않는다': '福音永不停息',
      '복음은': '福音',
      '멈추지 않는다': '永不停息',
      '"흔들리는 시대, 계속되는 하나님의 선교"': '“动荡时代中，神的宣教仍在继续”',
      '"흔들리는 시대,': '“动荡时代中，',
      '계속되는 하나님의 선교"': '神的宣教仍在继续”',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을 새롭게 붙들기 원하는 모든 세대의 성도들': '面向所有愿与下一代一起重新持守宣教生命与呼召的信徒。',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을': '面向愿与下一代一起重新持守',
      '새롭게 붙들기 원하는 모든 세대의 성도들': '宣教生命与呼召的所有世代信徒',
      '등록비 무료 · 숙소 별도': '报名免费 · 住宿另行安排',
      '성서침례대학원대학교 패트릭 채플관': '圣书浸礼研究生大学 帕特里克礼拜堂',
      '주최': '主办',
      '성서침례대학원대학교, 선교위원회': '圣书浸礼研究生大学、宣教委员会',
      '주관': '承办',
      '성침진흥위원회, 조이플 미션': '圣浸振兴委员会、Joyful Mission',
      '해외 참석자들과 이주민 성도들의 참석을 위해 AI를 통한 다국어 통역이 실시간 제공됩니다.': '为海外参加者和移民信徒，现场提供AI实时多语言翻译。',
      '숙소신청': '住宿申请',
      '컨퍼런스 참석자 숙소 안내': '大会参加者住宿指南',
      '숙소는 별도 신청 및 비용 부담으로 안내됩니다.': '住宿需另行申请并承担费用。',
      '원거리 참석자와 단체 참가자를 위해 숙소 신청 정보를 별도로 안내드립니다. 신청 가능 객실, 이용 기간, 비용 및 입실 안내는 확정되는 대로 순차적으로 공지됩니다.': '将为远道参加者和团体参加者另行提供住宿申请信息。可申请房间、使用期间、费用和入住指南将在确认后陆续公布。',
      '숙소 신청 안내 보기': '查看住宿申请指南',
      '주최측에 숙소 신청시, 채플관 주변에 캐노피 텐트(6~8인용)가 숙소로 제공 됩니다.(단체신청시 별도배정 가능)': '向主办方申请住宿时，礼拜堂周边的6至8人用天幕帐篷将作为住宿提供。（团体申请可另行分配）',
      '답변완료': '已答复',
      '접수중': '受理中',
      '공지사항을 불러오는 중입니다.': '正在加载公告。',
      '등록비 무료 안내': '免费报名通知',
      "숙소요청시 교회별로 '캐노피 텐트'가 제공 됩니다.": '申请住宿时，将按教会提供天幕帐篷。',
      '캐노피 텐트': '天幕帐篷',
      '구분': '类别',
      '제목': '标题',
      '작성일': '日期',
      '중요': '重要',
      '공지': '公告',
      '등록은 무료로 참여할 수 있나요?': '可以免费报名参加吗？',
      '숙소 신청과 비용은 어떻게 안내되나요?': '住宿申请和费用如何说明？',
      '단체 등록 문의는 어디로 하면 되나요?': '团体报名应向哪里咨询？',
      '현장 주차와 셔틀 안내가 있나요?': '有现场停车和接驳车说明吗？',
      '현장 등록 및 안내': '现场报名与说明',
      '2026년 10월 9일(금) – 10일(토)': '2026年10月9日（周五）–10日（周六）',
      '컨퍼런스 당일 오후 3시에 패트릭 채플관 2층 접수처에서 명찰 및 웰컴 키트 수령이 가능합니다. 쾌적한 입장을 위해 가급적 사전 등록을 권장드립니다.': '大会当天下午3点起，可在帕特里克礼拜堂2楼接待处领取名牌和欢迎礼包。为顺利入场，建议尽量提前报名。',
      '자주 묻는 질문 보러가기': '查看常见问题',
      '실시간 알림': '实时通知',
      '실시간 문의': '实时咨询',
      'JMC 실시간 문의': 'JMC 实时咨询',
      '운영팀에 문의를 남길 수 있어요': '可以给运营团队留言',
      '컨퍼런스 전용 앱을 다운로드하시면 일정 변경 및 중요 공지사항을 즉시 받아보실 수 있습니다.': '下载大会专用App后，可立即查看日程变更和重要公告。',
      '협력 및 후원 기관': '合作与赞助机构',
      '협력': '合作',
      '후원': '赞助',
      '성침트리뷴': '圣浸论坛',
      '크리스천 심리상담센터': '基督教心理咨询中心',
      '꿈을심는교회': '植梦教会',
      '주사랑교회': '主爱教会',
      '서울성서침례교회': '首尔圣书浸礼教会',
      '© 2026 지저스 미션 컨퍼런스. All rights reserved.': '© 2026 耶稣宣教大会. All rights reserved.',
      '이용약관': '使用条款',
      '개인정보처리방침': '隐私政策',
      '문의하기': '联系我们',
      '컨퍼런스 조직': '大会组织',
      '목록으로': '返回列表',
      '닫기': '关闭',
      '회원 로그인': '会员登录',
      '회원가입': '注册',
      '이름': '姓名',
      '이메일': '电子邮件',
      '비밀번호': '密码',
    },
    tl: {
      '홈': 'Home',
      '초청의 글': 'Paanyaya',
      'CI소개': 'CI',
      '조직': 'Organisasyon',
      '강사 소개': 'Mga Tagapagsalita',
      '일정': 'Iskedyul',
      '게시판': 'Board',
      '공지사항': 'Mga Paunawa',
      '문의/답변': 'Tanong/Sagot',
      '스탭자료실': 'Staff Resources',
      '스탭라운지': 'Staff Lounge',
      'STAFF 라운지': 'Staff Lounge',
      '오시는 길': 'Direksyon',
      '로그인': 'Login',
      '등록하기': 'Magparehistro',
      '지금 등록하기': 'Magparehistro Ngayon',
      '홍보 영상 보기': 'Panoorin ang Video',
      '언어 선택': 'Piliin ang Wika',
      '영어': 'English',
      '일본어': 'Japanese',
      '중국어': 'Chinese',
      '필리핀어': 'Filipino',
      '한국어': 'Korean',
      '지저스 미션 컨퍼런스': 'Jesus Mission Conference',
      '지저스 미션 컨퍼런스 2026': 'Jesus Mission Conference 2026',
      '지저스 미션 컨퍼런스 ㅣ 스탭라운지': 'Jesus Mission Conference | Staff Lounge',
      '복음은 멈추지 않는다': 'Hindi Humihinto ang Ebanghelyo',
      '복음은': 'Ang Ebanghelyo',
      '멈추지 않는다': 'ay Hindi Humihinto',
      '"흔들리는 시대, 계속되는 하나님의 선교"': '"Sa Panahong Nayanig, Nagpapatuloy ang Misyon ng Diyos"',
      '"흔들리는 시대,': '"Sa Panahong Nayanig,',
      '계속되는 하나님의 선교"': 'Nagpapatuloy ang Misyon ng Diyos"',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을 새롭게 붙들기 원하는 모든 세대의 성도들': 'Para sa lahat ng henerasyon ng mananampalataya na nagnanais sariwain ang buhay at tawag sa misyon kasama ang susunod na henerasyon.',
      '참여대상: 다음세대와 함께 선교적 삶과 부르심을': 'Para sa lahat ng henerasyon na nagnanais sariwain',
      '새롭게 붙들기 원하는 모든 세대의 성도들': 'ang buhay at tawag sa misyon kasama ang susunod na henerasyon',
      '등록비 무료 · 숙소 별도': 'Libreng rehistro · hiwalay ang tuluyan',
      '성서침례대학원대학교 패트릭 채플관': 'Patrick Chapel, Korea Baptist Theological Seminary',
      '주최': 'Host',
      '성서침례대학원대학교, 선교위원회': 'Korea Baptist Theological Seminary, Mission Committee',
      '주관': 'Organizer',
      '성침진흥위원회, 조이플 미션': 'Bible Baptist Promotion Committee, Joyful Mission',
      '해외 참석자들과 이주민 성도들의 참석을 위해 AI를 통한 다국어 통역이 실시간 제공됩니다.': 'May real-time AI multilingual interpretation para sa mga overseas participant at migrant believers.',
      '숙소신청': 'Accommodation',
      '컨퍼런스 참석자 숙소 안내': 'Accommodation Guide for Conference Participants',
      '숙소는 별도 신청 및 비용 부담으로 안내됩니다.': 'Ang tuluyan ay hiwalay na ina-apply at may hiwalay na bayad.',
      '원거리 참석자와 단체 참가자를 위해 숙소 신청 정보를 별도로 안내드립니다. 신청 가능 객실, 이용 기간, 비용 및 입실 안내는 확정되는 대로 순차적으로 공지됩니다.': 'Magbibigay ng hiwalay na impormasyon para sa malalayong dadalo at group participants. Iaanunsyo ang available rooms, dates, fees, at check-in details kapag nakumpirma na.',
      '숙소 신청 안내 보기': 'Tingnan ang Accommodation Guide',
      '주최측에 숙소 신청시, 채플관 주변에 캐노피 텐트(6~8인용)가 숙소로 제공 됩니다.(단체신청시 별도배정 가능)': 'Kapag nag-apply ng tuluyan sa organizers, canopy tents malapit sa chapel hall para sa 6 hanggang 8 tao ang ibibigay bilang accommodation. May hiwalay na assignment para sa group applications.',
      '답변완료': 'Nasagot',
      '접수중': 'Natanggap',
      '공지사항을 불러오는 중입니다.': 'Naglo-load ng mga paunawa.',
      '등록비 무료 안내': 'Free Registration Notice',
      "숙소요청시 교회별로 '캐노피 텐트'가 제공 됩니다.": 'Canopy tents will be provided by church when accommodation is requested.',
      '캐노피 텐트': 'Canopy Tent',
      '구분': 'Uri',
      '제목': 'Pamagat',
      '작성일': 'Petsa',
      '중요': 'Mahalaga',
      '공지': 'Paunawa',
      '등록은 무료로 참여할 수 있나요?': 'Libre bang makilahok?',
      '숙소 신청과 비용은 어떻게 안내되나요?': 'Paano malalaman ang accommodation request at fees?',
      '단체 등록 문의는 어디로 하면 되나요?': 'Saan magtatanong tungkol sa group registration?',
      '현장 주차와 셔틀 안내가 있나요?': 'May parking o shuttle information ba?',
      '현장 등록 및 안내': 'On-site Registration & Information',
      '2026년 10월 9일(금) – 10일(토)': 'October 9 (Fri) – 10 (Sat), 2026',
      '컨퍼런스 당일 오후 3시에 패트릭 채플관 2층 접수처에서 명찰 및 웰컴 키트 수령이 가능합니다. 쾌적한 입장을 위해 가급적 사전 등록을 권장드립니다.': 'Sa araw ng conference, makukuha ang name tag at welcome kit mula 3 PM sa registration desk sa 2nd floor ng Patrick Chapel. Mas mainam ang advance registration para mas maayos ang pagpasok.',
      '자주 묻는 질문 보러가기': 'Tingnan ang FAQ',
      '실시간 알림': 'Real-time Alerts',
      '실시간 문의': 'Live Inquiry',
      'JMC 실시간 문의': 'JMC Live Inquiry',
      '운영팀에 문의를 남길 수 있어요': 'Mag-iwan ng mensahe sa operations team',
      '컨퍼런스 전용 앱을 다운로드하시면 일정 변경 및 중요 공지사항을 즉시 받아보실 수 있습니다.': 'Download the conference app to receive schedule changes and important notices immediately.',
      '협력 및 후원 기관': 'Partners & Sponsors',
      '협력': 'Partner',
      '후원': 'Sponsor',
      '성침트리뷴': 'Bible Baptist Tribune',
      '크리스천 심리상담센터': 'Christian Counseling Center',
      '꿈을심는교회': 'Dream Planting Church',
      '주사랑교회': 'Lord’s Love Church',
      '서울성서침례교회': 'Seoul Bible Baptist Church',
      '© 2026 지저스 미션 컨퍼런스. All rights reserved.': '© 2026 Jesus Mission Conference. All rights reserved.',
      '이용약관': 'Terms',
      '개인정보처리방침': 'Privacy Policy',
      '문의하기': 'Contact',
      '컨퍼런스 조직': 'Conference Organization',
      '목록으로': 'Back to List',
      '닫기': 'Isara',
      '회원 로그인': 'Member Login',
      '회원가입': 'Sign Up',
      '이름': 'Pangalan',
      '이메일': 'Email',
      '비밀번호': 'Password',
    },
  };

  function clearGoogleTranslate() {
    const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const host = window.location.hostname;
    document.cookie = `googtrans=;expires=${expired};path=/`;
    if (host) {
      document.cookie = `googtrans=;expires=${expired};path=/;domain=${host}`;
      document.cookie = `googtrans=;expires=${expired};path=/;domain=.${host}`;
    }
    document.documentElement.style.top = '0px';
    document.body.style.top = '0px';
    document.body.style.marginTop = '0px';
    document.querySelectorAll('iframe.goog-te-banner-frame, iframe.skiptranslate, body > .skiptranslate, #google_translate_element').forEach((element) => {
      element.remove();
    });
  }

  function getCurrentLanguage() {
    const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
    if (languages.some((language) => language.code === requestedLanguage)) {
      return requestedLanguage;
    }
    return localStorage.getItem(storageKey) || 'ko';
  }

  function getButtonLanguage() {
    const current = getCurrentLanguage();
    return languages.find((language) => language.code === current && current !== 'ko') || languages[0];
  }

  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  function translatedText(text, lang) {
    if (lang === 'ko') return text;
    const key = normalize(text);
    if (!key) return text;
    const dict = i18n[lang] || {};
    return dict[key] || i18n.en[key] || text;
  }

  function shouldSkipElement(element) {
    if (!element) return false;
    return Boolean(element.closest?.('script, style, noscript, textarea, select, option, [data-language-selector], [data-mobile-language-selector], .notranslate'));
  }

  function applyTextNode(node, lang) {
    if (!node.nodeValue || shouldSkipElement(node.parentElement)) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const translated = translatedText(source, lang);
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const nextValue = lang === 'ko' ? source : leading + translated + trailing;
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
  }

  function applyAttributes(element, lang) {
    if (shouldSkipElement(element)) return;
    attrs.forEach((attr) => {
      if (!element.hasAttribute?.(attr)) return;
      let map = originalAttr.get(element);
      if (!map) {
        map = {};
        originalAttr.set(element, map);
      }
      if (!map[attr]) map[attr] = element.getAttribute(attr);
      const source = map[attr];
      const nextValue = lang === 'ko' ? source : translatedText(source, lang);
      if (element.getAttribute(attr) !== nextValue) element.setAttribute(attr, nextValue);
    });
  }

  function walk(root, lang) {
    if (!root || shouldSkipElement(root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement)) return;
    if (root.nodeType === Node.TEXT_NODE) {
      applyTextNode(root, lang);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return;
    if (root.nodeType === Node.ELEMENT_NODE) applyAttributes(root, lang);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE && shouldSkipElement(node)) return NodeFilter.FILTER_REJECT;
        if (node.nodeType === Node.TEXT_NODE && shouldSkipElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) applyTextNode(node, lang);
      else applyAttributes(node, lang);
    }
  }

  function updateSelectorLabels() {
    const current = getButtonLanguage();
    document.querySelectorAll('[data-language-current]').forEach((element) => {
      element.textContent = current.shortLabel;
    });
    document.querySelectorAll('[data-language-current-flag]').forEach((element) => {
      element.textContent = current.flag;
    });
  }

  function fitHeaderNavigation() {
    const header = document.querySelector('header');
    const row = header?.querySelector('.max-w-7xl');
    const nav = header?.querySelector('nav.hidden.lg\\:flex');
    if (!header || !row || !nav || window.getComputedStyle(nav).display === 'none') return;

    const navItems = nav.querySelectorAll('a, button');
    const brandText = header.querySelector('a span.font-extrabold');
    const actionArea = row.querySelector('.flex.items-center.gap-4');
    const actionControls = [];
    if (actionArea) {
      Array.from(actionArea.children).forEach((child) => {
        if (child.matches('[data-language-selector]')) {
          const languageButton = child.querySelector(':scope > button');
          if (languageButton) actionControls.push({ button: languageButton, type: 'language' });
        } else if (child.matches('button') && child.id !== 'mobile-menu-btn') {
          actionControls.push({ button: child, type: child.hasAttribute('data-auth-open') ? 'auth' : 'register' });
        }
      });
    }
    const candidates = [
      { navFont: 20, navGap: 20, brandFont: 20, brandMax: 210, actionFont: 13, registerFont: 13, actionGap: 16, actionPx: 12, registerPx: 12 },
      { navFont: 19, navGap: 16, brandFont: 19, brandMax: 190, actionFont: 13, registerFont: 13, actionGap: 14, actionPx: 12, registerPx: 12 },
      { navFont: 18, navGap: 14, brandFont: 18, brandMax: 174, actionFont: 13, registerFont: 13, actionGap: 12, actionPx: 12, registerPx: 12 },
      { navFont: 17, navGap: 12, brandFont: 17, brandMax: 158, actionFont: 13, registerFont: 13, actionGap: 10, actionPx: 12, registerPx: 12 },
      { navFont: 16, navGap: 10, brandFont: 16, brandMax: 144, actionFont: 13, registerFont: 13, actionGap: 8, actionPx: 12, registerPx: 12 },
      { navFont: 15, navGap: 8, brandFont: 15, brandMax: 132, actionFont: 13, registerFont: 13, actionGap: 8, actionPx: 12, registerPx: 12 },
      { navFont: 14, navGap: 6, brandFont: 14, brandMax: 118, actionFont: 13, registerFont: 13, actionGap: 6, actionPx: 12, registerPx: 12 },
    ];

    function applyCandidate(candidate) {
      nav.style.flexShrink = '1';
      nav.style.minWidth = '0';
      nav.style.gap = `${candidate.navGap}px`;
      navItems.forEach((item) => {
        item.style.fontSize = `${candidate.navFont}px`;
        item.style.whiteSpace = 'nowrap';
      });
      if (brandText) {
        brandText.style.fontSize = `${candidate.brandFont}px`;
        brandText.style.whiteSpace = 'nowrap';
        brandText.style.maxWidth = `${candidate.brandMax}px`;
        brandText.style.overflow = 'hidden';
        brandText.style.textOverflow = 'ellipsis';
        brandText.parentElement.style.minWidth = '0';
        brandText.parentElement.style.flexShrink = '1';
      }
      if (actionArea) actionArea.style.gap = `${candidate.actionGap}px`;
      actionControls.forEach(({ button, type }) => {
        const isRegister = type === 'register';
        const isLanguage = type === 'language';
        const px = isLanguage ? 8 : (isRegister ? candidate.registerPx : candidate.actionPx);
        button.style.fontSize = `${isLanguage ? 12 : (isRegister ? candidate.registerFont : candidate.actionFont)}px`;
        button.style.paddingLeft = `${px}px`;
        button.style.paddingRight = `${px}px`;
        button.style.whiteSpace = 'nowrap';
      });
    }

    for (const candidate of candidates) {
      applyCandidate(candidate);
      const brandRect = brandText?.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const hasCollision = brandRect ? brandRect.right + 12 > navRect.left : false;
      if (!hasCollision && row.scrollWidth <= row.clientWidth + 1) return;
    }

    if (brandText) {
      brandText.style.maxWidth = '7rem';
      brandText.style.overflow = 'hidden';
      brandText.style.textOverflow = 'ellipsis';
    }
  }

  function scheduleHeaderFit() {
    window.requestAnimationFrame(() => {
      fitHeaderNavigation();
      window.setTimeout(fitHeaderNavigation, 80);
      window.setTimeout(fitHeaderNavigation, 250);
    });
  }

  function applyLanguage(code) {
    clearGoogleTranslate();
    localStorage.setItem(storageKey, code);
    document.documentElement.lang = code === 'ko' ? 'ko' : code;
    document.title = code === 'ko' ? originalTitle : translatedText(originalTitle, code);
    walk(document.body, code);
    updateSelectorLabels();
    scheduleHeaderFit();
  }

  function createSelector() {
    if (document.querySelector('[data-language-selector]')) return null;
    const current = getButtonLanguage();
    const wrapper = document.createElement('div');
    wrapper.className = 'relative hidden lg:block notranslate';
    wrapper.setAttribute('data-language-selector', '');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'flex h-7 min-w-[58px] items-center justify-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 text-[12px] font-extrabold leading-none text-white transition hover:bg-white/15';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `<span data-language-current-flag aria-hidden="true">${current.flag}</span><span data-language-current>${current.shortLabel}</span><span class="material-symbols-outlined text-[12px] leading-none">expand_more</span>`;

    const menu = document.createElement('div');
    menu.className = 'invisible absolute right-0 top-full z-[80] mt-3 w-44 rounded-2xl border border-white/10 bg-[#071226] p-2 opacity-0 shadow-2xl transition';
    menu.setAttribute('role', 'menu');

    languages.forEach((language) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-extrabold text-white/80 transition hover:bg-white/10 hover:text-amber-200';
      option.setAttribute('role', 'menuitem');
      option.innerHTML = `<span class="text-lg" aria-hidden="true">${language.flag}</span><span>${language.label}</span>`;
      option.addEventListener('click', () => applyLanguage(language.code));
      menu.appendChild(option);
    });

    function setOpen(isOpen) {
      button.setAttribute('aria-expanded', String(isOpen));
      menu.classList.toggle('invisible', !isOpen);
      menu.classList.toggle('opacity-0', !isOpen);
      menu.classList.toggle('opacity-100', isOpen);
    }

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', () => setOpen(false));
    wrapper.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });

    wrapper.append(button, menu);
    return wrapper;
  }

  function createMobileSelector() {
    if (document.querySelector('[data-mobile-language-selector]')) return null;
    const group = document.createElement('div');
    group.className = 'border-b border-white/10 py-3 notranslate';
    group.setAttribute('data-mobile-language-selector', '');
    group.innerHTML = '<div class="mb-3 text-white/80 font-bold text-[20px]">언어 선택</div>';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-2';

    languages.forEach((language) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'rounded-xl bg-white/10 px-4 py-3 text-center text-base font-extrabold text-white/80 hover:text-amber-200';
      option.innerHTML = `<span aria-hidden="true">${language.flag}</span> ${language.label}`;
      option.addEventListener('click', () => applyLanguage(language.code));
      grid.appendChild(option);
    });

    group.appendChild(grid);
    return group;
  }

  function mountSelector() {
    const selector = createSelector();
    if (selector) {
      const authButton = document.querySelector('header [data-auth-open][data-auth-variant="desktop"]') || document.querySelector('header [data-auth-open].hidden.lg\\:block');
      const actionArea = authButton?.parentElement || document.querySelector('header .flex.items-center.gap-4');
      const registerButton = actionArea?.querySelector('button.hidden.lg\\:block');
      if (authButton) actionArea.insertBefore(selector, authButton);
      else if (registerButton) actionArea.insertBefore(selector, registerButton);
      else if (actionArea) actionArea.prepend(selector);
    }

    const mobileSelector = createMobileSelector();
    const mobileMenuInner = document.querySelector('#mobile-menu > div');
    const mobileActions = mobileMenuInner?.querySelector('.pt-3');
    if (mobileSelector && mobileMenuInner) {
      mobileMenuInner.insertBefore(mobileSelector, mobileActions || null);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    clearGoogleTranslate();
    mountSelector();
    applyLanguage(getCurrentLanguage());
    window.addEventListener('resize', scheduleHeaderFit);
    const observer = new MutationObserver((mutations) => {
      const lang = getCurrentLanguage();
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => walk(node, lang));
        if (mutation.type === 'characterData') applyTextNode(mutation.target, lang);
        if (mutation.type === 'attributes') applyAttributes(mutation.target, lang);
      });
      scheduleHeaderFit();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attrs });
    window.setInterval(clearGoogleTranslate, 800);
  });
})();
