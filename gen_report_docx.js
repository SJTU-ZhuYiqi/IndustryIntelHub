const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, LevelFormat } = require('docx');
const fs = require('fs');

// ── helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, color: '0f1f3d', font: '宋体' })],
    spacing: { before: 560, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1a2f52', space: 4 } },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, color: '1a2f52', font: '宋体' })],
    spacing: { before: 400, after: 100 },
  });
}

// 一级 bullet：结论句
function b1(text) {
  return new Paragraph({
    numbering: { reference: 'b1', level: 0 },
    children: [new TextRun({ text, size: 22, font: '宋体', color: '0f172a' })],
    spacing: { before: 120, after: 40, line: 340, lineRule: 'auto' },
  });
}

// 二级 bullet：追问/推导
function b2(text) {
  return new Paragraph({
    numbering: { reference: 'b2', level: 0 },
    children: [new TextRun({ text, size: 21, font: '宋体', color: '334155' })],
    spacing: { before: 60, after: 40, line: 320, lineRule: 'auto' },
  });
}

// 带加粗前缀的二级 bullet
function b2b(bold, rest) {
  return new Paragraph({
    numbering: { reference: 'b2', level: 0 },
    children: [
      new TextRun({ text: bold, bold: true, size: 21, font: '宋体', color: '1e3a6a' }),
      new TextRun({ text: rest, size: 21, font: '宋体', color: '334155' }),
    ],
    spacing: { before: 60, after: 40, line: 320, lineRule: 'auto' },
  });
}

function div() {
  return new Paragraph({
    children: [new TextRun('')],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0' } },
    spacing: { before: 160, after: 160 },
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun('')], spacing: { before: 80, after: 80 } });
}

// ── numbering config ─────────────────────────────────────────────────────────

const numbering = {
  config: [
    {
      reference: 'b1',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u25CF', // ●
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 280 } } },
      }],
    },
    {
      reference: 'b2',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u25E6', // ○
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 880, hanging: 280 } } },
      }],
    },
  ],
};

// ── content ──────────────────────────────────────────────────────────────────

const children = [
  // 封面
  new Paragraph({
    children: [new TextRun({ text: 'W16 内容消费行业资讯周报', bold: true, size: 56, color: '0f1f3d', font: '宋体' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 1440, after: 240 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '2026 年第 16 周（4 月 20 日 ~ 4 月 26 日）', size: 26, color: '475569', font: '宋体' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '资讯快评 · 对业务意味着什么 | 内容消费研究组内部参考', size: 22, color: '94a3b8', font: '宋体' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 2400 },
  }),

  // ────────────────────────────────────────────────────────────────────────────
  // PART 1 — 游戏行业
  // ────────────────────────────────────────────────────────────────────────────
  h1('一、游戏行业 | 资讯快评——对业务意味着什么'),

  // G1
  h2('异环/王者世界/洛克王国三款大作同周哑火'),
  b1('手游开放世界的付费转化悖论正在集中暴露，广告主的短期扩量意愿会系统性下降'),
  b2('异环3500万预约量对应首日畅销榜第13位，说明高预约不等于高付费意愿；买量侧需重新评估"预约量"这一先行指标的可靠性，它对手游端IAP的预测力可能远低于直播试玩热度和首日评分走势'),
  b2('完美世界跌停 → 短期内主动扩量概率极低；销售侧是否还在跟进完美世界的预算，需要明确一个等待节点：4月29日异环海外上线数据，而非无限期观望'),
  b2('王者荣耀世界移动端持续下行，但PC端相对稳健；腾讯的实际买量策略会不会把预算向PC平台和跨端场景迁移？如果是，快手手游买量的腾讯系份额会进一步压缩，需提前布局替代广告主管线'),
  spacer(),

  // G2
  h2('2026 Q1游戏市场同比+13.38%，但移动端仅+6.28%'),
  b1('大盘增长看起来健康，但对快手买量业务没有直接利好，增量几乎不在移动买量生态里'),
  b2('三角洲行动的增量来自运营活动（刘涛联动），洛克王国世界靠情怀，明日方舟终末地靠核心用户集中付费——三种模式都是"品牌/IP自带流量"，买量平台是锦上添花而非主要驱动，外溢到快手的预算比例有限'),
  b2('移动端+6.28% vs 总市场+13.38%，差值来自PC/主机的高增速；快手用户几乎全为手机端，这意味着快手能受益的市场增速远低于行业标题数字，向广告主汇报时不要用+13.38%作为行业机会的论据'),
  b2b('真正的确定性赛道只有两条：', 'SLG（世纪华通/点点互动体系，无尽冬日71532组素材仍是全市场第一）和小游戏（掌上谈兵刚入局，买量信号明确）。数据侧是否可以拉一下快手平台这两个品类的消耗趋势，验证确定性假设？'),
  spacer(),

  // G3
  h2('掌上谈兵5天登顶微信小游戏畅销榜'),
  b1('大作哑火时下沉流量会向小游戏迁移，这是快手的结构性窗口，而不只是一个偶发事件'),
  b2('掌上谈兵登顶的时机刚好在异环/王者世界口碑争议期，这种"大作失利 → 小游戏黑马"的规律是否在快手平台上有对应的数据佐证？可以拉一下历史上类似时间点（如原神争议期、某大作跌停后），快手小游戏品类的CTR和消耗是否有可观测的反弹'),
  b2('海南聚力网络上线后迅速入买量榜前十，说明这个发行商对流量窗口嗅觉灵敏；运营侧是否已经建联，在下一款产品起量时能第一时间拿到快手的预算份额'),
  b2b('快手的结构性优势：', '下沉用户与小游戏目标人群高度重叠，且平台买量竞争密度低于抖音。这是可以对外讲的差异化，但内部需要一个数据来支撑——快手小游戏品类的CPM/CPA vs 抖音同品类，差距有多大，能不能量化？'),
  spacer(),

  // G4
  h2('五一档：崩铁三周年 + 鸣潮二周年 + 腾讯多线出击'),
  b1('五一档是上半年买量竞争最激烈的窗口，但对快手而言是逆风期而非机会期'),
  b2('二游端崩铁/鸣潮/明日方舟周年庆叠加，核心用户付费高度集中在这几款产品，外部平台的买量在这个时间点拉新效率会下降，广告主会把更多预算压向自有渠道和内容营销，快手的二游买量份额五一期间可能承压'),
  b2('线下展会（崩铁LAND/CP32杭州/元界春日芳菲境）会把核心用户从线上拉走，进一步压缩线上买量的触达效率；五一期间对二游品类的GMV预期要主动下修，避免目标设置偏高'),
  b2b('真正的机会在五一之后：', '如果异环/王者世界持续没有起色，头部大作失利的失落感会形成消费反弹，SLG和小游戏往往在这时出现买量小高峰。节后第一周（5月6日起）的SLG/小游戏买量反弹是否值得提前与世纪华通、掌上谈兵发行商沟通增加预算档期？'),
  div(),

  // ────────────────────────────────────────────────────────────────────────────
  // PART 2 — 短剧漫剧
  // ────────────────────────────────────────────────────────────────────────────
  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),
  h1('二、短剧漫剧 | 资讯快评——对业务意味着什么'),

  // D1
  h2('HappyHorse登顶测评，腾讯挖走Seedance核心团队'),
  b1('AI视频工具进入三足鼎立，可灵的技术领先优势正在被压缩，快手的差异化必须从"工具力"转向"内容生态力"'),
  b2('HappyHorse API 4月30日开放，会有一批中小CP转向试用，可能分流可灵的轻度用户；但HappyHorse当前仅支持5–10秒、复杂动作处理差，短剧制作中的连续场景对它来说是硬伤，重度制作方短期内不会完全迁移'),
  b2b('真正的风险是腾讯混元5月上线：', '腾讯有视频号的内容分发生态，如果混元视频与视频号短剧形成闭环，会不会从供给端把部分CP吸引到腾讯体系？快手现在的快手号/磁力引擎对CP的绑定有多深？运营侧需要评估头部CP被竞争对手生态吸走的风险敞口'),
  b2('可灵降价（限时8折+部分免费）短期会降低AI漫剧制作成本，有利于扩大快手短剧广告库存——这是对销售侧的直接利好。能不能量化：可灵降价后，使用可灵制作的漫剧CP在快手的月均上新集数有没有在过去几个月里显著上升？用这个数据来验证"工具降价 → 供给增加 → 广告库存扩大"的传导链'),
  spacer(),

  // D2
  h2('《短剧漫剧版权保护实操指引》4月22日发布，红果下架3522部违规漫剧'),
  b1('合规门槛提升是双刃剑：低质供给收缩，头部合规CP受益，但这个受益会不会流向快手取决于快手现在绑定了多少头部CP'),
  b2('红果下架3522部的操作说明平台侧的供给治理在加速；快手短剧侧是否也有类似的主动治理动作？如果没有，大量低质漫剧留在快手平台，会不会在广告主品牌安全敏感度上升的背景下形成投放顾虑'),
  b2b('版权指引带来的实操负担（保留提示词记录/AI标识/版本证据链）：', '对小CP是成本，对头部CP是护城河。销售侧是否有"已完成合规备案"的CP白名单可以向广告主推荐？品牌广告主对合规性的要求在提高，这个白名单本身就是一个销售工具'),
  b2('七猫、书旗等小说版权方入局漫剧改编的空间值得关注——这些版权方目前与红果绑定深，但如果版权指引强化了独立版权方的话语权，快手是否可以抓紧和七猫/书旗探索直接版权合作，在供给侧建立快手独有的内容资产，避免被红果垄断内容版权的被动局面'),
  spacer(),

  // D3
  h2('字节即梦积分缩水六成（变相涨价），可灵限时8折'),
  b1('字节往高端B端走，快手往规模C端走，两条路各有合理性；快手的策略在短期内对CP和广告主都是利好，但要警惕"价格战 → 质量感知下降"的副作用'),
  b2('即梦涨价的背后逻辑是Seedance企业API门槛已达1000万/年，字节在赌少数大客户的高端溢价。快手如果把可灵定位成普惠工具，扩大的是中小CP和个人创作者群体——这些群体在快手短剧广告变现链上的ARPU和付费意愿是什么水平？如果变现能力弱，扩大这个群体对快手广告收入的拉动可能低于预期'),
  b2b('可灵降价带来的直接业务机会：', '制作成本下降 → 中小CP起量门槛降低 → 快手短剧广告库存扩大。运营侧可以用这个逻辑做一轮中小CP的专项触达——"现在用可灵的成本下降了X%，在快手发行一部漫剧的综合成本降到了Y"，用具体数字做拉新'),
  b2('需要警惕：如果快手把可灵的价格压得很低，而技术上又落后HappyHorse和混元，CP会形成"便宜但不够好"的认知，可能影响快手在AI制作生态里的品牌定位。可灵的降价策略应该有时间限制，不要让低价成为持久标签'),
  spacer(),

  // D4
  h2('网络视听大会：AI漫剧日产470部，爆款率不足4%，AI仿真人类型爆款率千分之一'),
  b1('供给爆炸+精品稀缺，流量会向少数爆款高度集中；对快手来说，能不能拿到这些爆款的首发权是广告收入天花板的关键变量'),
  b2('爆款率不足4%意味着大量漫剧会在低流量区消耗资源；快手平台上漫剧的流量分配逻辑是否已经在往头部集中？如果还是相对均匀分配，低质内容会稀释用户对漫剧内容的整体体验，长期损害广告主投放意愿'),
  b2b('精品漫剧CP的UE（用户获取经济性）显著好于一般制作方：', '爆款更容易被压量，广告主愿意在爆款内容里加大投入。运营侧是否可以按"爆款基因"做CP分层管理——第一层：历史有爆款记录、第二层：制作团队有爆款经历、第三层：当前在播的播放增速指标？用数据标签替代主观判断，把稀缺的运营资源投到第一层CP上'),
  b2('各大平台强调"成为创作者基础设施"，说明平台侧的竞争从发行竞争升级为制作生态竞争；快手磁力引擎目前给CP的扶持（流量/工具/资金）和红果/抖音相比处于什么档位？如果差距较大，头部CP会优先在竞争对手平台首发，快手只能拿到二轮内容，广告变现窗口更窄'),

  // 页脚
  new Paragraph({ children: [new TextRun('')], spacing: { before: 600 } }),
  new Paragraph({
    children: [new TextRun({ text: '内容消费研究组 · 数据仅供内部参考 · 2026 W16', size: 18, color: '94a3b8', font: '宋体' })],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0' } },
    spacing: { before: 160 },
  }),
];

// ── build doc ────────────────────────────────────────────────────────────────

const doc = new Document({
  numbering,
  styles: {
    default: { document: { run: { font: '宋体', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: '宋体', color: '0f1f3d' },
        paragraph: { spacing: { before: 560, after: 180 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: '宋体', color: '1a2f52' },
        paragraph: { spacing: { before: 400, after: 100 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('W16行业深度研判.docx', buf);
  console.log('Done: W16行业深度研判.docx');
});
