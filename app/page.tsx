"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "intro" | "trailer" | "choice" | "result" | "done";
type UserChoice = "A" | "B";
type EmotionTone = "emotional" | "rational" | null;
type GeneratedVersion = "emotion-cut" | "rational-cut" | null;

type AnalyticsEvent = {
  id: number;
  title: string;
  detail: string;
};

type DashboardMetric = {
  title: string;
  normal: number;
  ai: number;
  uplift: string;
  hint: string;
};

type RecompositionDetail = {
  toneLabel: string;
  scene: string;
  dialogue: string;
  music: string;
  rhythm: string;
  roleTitle: string;
  roleDescription: string;
  keywords: string[];
  aiSummary: string;
};

const NAV_ITEMS = ["电视剧", "电影", "综艺", "动漫", "少儿", "短剧", "纪录片", "全部"];
const HEADER_ACTIONS = ["会员专区", "游戏", "快捷访问", "历史", "创作", "应用"];
const STORY_TAGS = ["内地", "2024", "女性题材", "女性成长"];
const PRODUCT_THESIS =
  "AI 参与式预告：让用户的选择驱动预告内容，把被动看片变成可参与、可转化的片尾体验。";
const USER_PAIN_POINTS = [
  "看完一集后流失",
  "普通预告点击率低",
  "预约转化弱",
  "讨论度不足",
];
const USER_SOLUTION =
  "让用户从“看预告”变成“参与预告”。同一段内容按选择生成不同情绪版本，直接拉高参与、停留和追更意愿。";
const AI_NECESSITY =
  "AI 按用户选择重组场景、台词与节奏，让同一段预告生成不同情绪版本，而不是固定分支跳转。";
const HERO_HIGHLIGHTS = [
  ["互动剧情", "用户在悬念点做出选择，预告开始回应观众"],
  ["实时生成", "同一段内容被重组为不同情绪版本，形成专属体验"],
  ["转化承接", "把片尾流失点直接改造成预约与追更入口"],
];
const PLATFORM_VALUES = [
  ["预告完播率", "把最容易流失的片尾 10 秒留下来"],
  ["互动率", "把观看动作转成选择动作"],
  ["预约转化", "在悬念点直接触发追更意愿"],
  ["推荐精度", "沉淀情绪选择数据，反哺推荐"],
];
const PREVIEW_RECOMPOSITION: Record<UserChoice, RecompositionDetail> = {
  A: {
    toneLabel: "冲动、心动、不顾一切",
    scene: "雨夜街头、推开门的瞬间、一路奔向答案的靠近",
    dialogue: "“有些事，不做会后悔一辈子。”",
    music: "弦乐上扬，快节奏剪辑",
    rhythm: "镜头更近、更快、更热，情绪一路顶到见面那一刻",
    roleTitle: "情绪化路径：她决定不再后退",
    roleDescription: "这一次她选择把心动推到最前面，哪怕冒险，也要亲自把答案听清楚。",
    keywords: ["冲动", "心动", "不顾一切"],
    aiSummary: "AI 会把内容收向雨夜街头、推门见面的瞬间和不再犹豫的心跳感。",
  },
  B: {
    toneLabel: "克制、清醒、自我保护",
    scene: "窗边独坐、手机屏幕熄灭、把情绪留给自己的夜色",
    dialogue: "“爱一个人，也要先爱自己。”",
    music: "钢琴低沉，慢镜头留白",
    rhythm: "停顿更久、镜头更稳、留白更明显，情绪被收进内心",
    roleTitle: "理性路径：她先把自己放回中心",
    roleDescription: "她没有冲出去，而是先守住边界，把这一夜留给更清醒的决定。",
    keywords: ["克制", "清醒", "自我保护"],
    aiSummary: "AI 会把内容收向窗边独坐、熄屏留白和先照顾自己的理性版本。",
  },
};
const COMPARISON_POINTS = [
  ["场景组织", "固定镜头顺序，所有用户看到同一版", "按选择重组镜头顺序和留白节奏"],
  ["台词表达", "固定台词，情绪单一", "按倾向切换冲突型或反思型表达"],
  ["音乐氛围", "统一配乐，不随用户变化", "按情绪版本匹配推进或平静氛围"],
  ["用户感受", "被动接收预告信息", "像被剧情回应，形成更强代入"],
];
const METRIC_ASSUMPTIONS = [
  ["预告完播率", "+30%", "片尾最后 10 秒被看完的概率显著提升"],
  ["预约转化率", "+15%", "在悬念点触发行动，强化更新提醒点击"],
  ["下一集点击率", "+10%", "通过情绪延续，带动对正片的即时点击"],
  ["追更留存", "+8%", "形成“看完一集就期待下一集”的稳定习惯"],
];
const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    title: "预告完播率",
    normal: 62,
    ai: 85,
    uplift: "+23%",
    hint: "片尾悬念点被完整看完的比例显著提升",
  },
  {
    title: "互动参与率",
    normal: 0,
    ai: 41,
    uplift: "+41%",
    hint: "互动选择让用户从被动观看转向主动参与",
  },
  {
    title: "预约转化率",
    normal: 12,
    ai: 27,
    uplift: "+15%",
    hint: "在情绪峰值处直接承接预约动作",
  },
  {
    title: "下一集点击意愿",
    normal: 38,
    ai: 56,
    uplift: "+18%",
    hint: "延长预告强化对后续正片的即时兴趣",
  },
];
const DASHBOARD_EVENT_TIMELINE = [
  { time: "22:41:08", event: "trailer_enter" },
  { time: "22:41:15", event: "suspense_pause" },
  { time: "22:41:18", event: "choice_submit" },
  { time: "22:41:20", event: "ai_preview_generate" },
  { time: "22:41:24", event: "extended_preview_play" },
  { time: "22:41:31", event: "episode_reserve_click" },
] as const;
const DEPLOYMENT_SCENARIOS = [
  "片尾自动播放下一集互动预告，作为默认片尾承接能力。",
  "会员专属互动预告，优先在高热剧和高讨论剧集试点。",
  "热剧运营活动入口，结合站内预约、弹幕和话题页联动。",
];
const GENRE_EXPANSION = ["都市情感", "悬疑", "古装", "综艺", "动漫", "短剧"];
const COMMERCIAL_VALUES_EXTENDED = [
  "品牌联动版预告：按角色立场生成合作内容。",
  "社交分享版预告：让用户晒出“我选的版本”。",
  "角色人格化预告：放大会员专属内容与付费吸引力。",
  "选择数据资产：提升平台活跃度与推荐效率。",
];
const TRAILER_LINES = [
  "深夜，北京。",
  "她收到了一条很久没有出现的消息。",
  "“我在楼下，想见你一面。”",
  "她握着手机，沉默了很久。",
  "预告片即将结束。",
  "可故事，似乎还没结束。",
];
const RESULT_SCENES: Record<
  UserChoice,
  { badge: string; title: string; description: string; lines: string[] }
> = {
  A: {
    badge: "情绪上扬版",
    title: "让她去见他",
    description: "她冲进雨夜，推开门的那一刻，所有压住的心意都不想再藏。",
    lines: [
      "雨夜街头的脚步越来越快。",
      "门被推开的瞬间，呼吸和镜头一起贴近。",
      "弦乐猛地上扬，这一版不再给犹豫留位置。",
    ],
  },
  B: {
    badge: "理性留白版",
    title: "让她不去",
    description: "她坐回窗边，让手机屏幕熄灭，也让自己重新站回决定的中心。",
    lines: [
      "她没有下楼，而是把夜色慢慢收回房间里。",
      "屏幕熄灭后，只剩呼吸和安静的钢琴声。",
      "慢镜头停在她的侧脸，这一版把答案留给她自己。",
    ],
  },
};
const REVIEWS = [
  ["错儿妹", "互动预告不是剧情游戏，而像是平台替观众多留住了一秒犹豫。"],
  ["蜗牛的美人蕉", "选项停在悬念点上，既不打断沉浸感，又很容易带出预约动作。"],
  ["秦尘", "AI 记住上一次怎么选之后，整个 Demo 的代入感一下就上来了。"],
];
const EPISODES = Array.from({ length: 25 }, (_, index) => {
  const number = index + 1;
  return { number, vip: number >= 3, active: number === 13, preview: number === 13 };
});

const GENERATION_STEPS = [
  "正在分析你的选择偏好…",
  "匹配情绪向量：都市情感 / 高张力…",
  "正在重组第13集预告片段…",
  "你的专属版本已生成 ✓",
] as const;
const BRANCH_VISUALS: Record<
  UserChoice,
  {
    ambient: string;
    surface: string;
    chip: string;
    pill: string;
    softCard: string;
    accentText: string;
    mutedText: string;
  }
> = {
  A: {
    ambient:
      "bg-[radial-gradient(circle_at_74%_32%,rgba(255,151,99,0.24),transparent_28%),radial-gradient(circle_at_28%_74%,rgba(255,211,138,0.14),transparent_34%)]",
    surface:
      "border-[#ffb17a]/18 bg-[linear-gradient(180deg,rgba(40,21,13,0.88),rgba(18,12,10,0.72))]",
    chip: "bg-[#3b2419]/72 text-[#ffd3ad]",
    pill: "border-[#ffb17a]/20 bg-[#2f1912]/74 text-[#ffd1ab]",
    softCard:
      "border-[#ffb17a]/14 bg-[linear-gradient(180deg,rgba(54,28,15,0.56),rgba(18,12,10,0.28))]",
    accentText: "text-[#ffbf8a]",
    mutedText: "text-[#ffd9bf]",
  },
  B: {
    ambient:
      "bg-[radial-gradient(circle_at_76%_30%,rgba(125,232,255,0.2),transparent_30%),radial-gradient(circle_at_22%_76%,rgba(102,134,255,0.14),transparent_34%)]",
    surface:
      "border-[#1fd7ff]/18 bg-[linear-gradient(180deg,rgba(10,20,28,0.88),rgba(10,13,18,0.72))]",
    chip: "bg-[#102735]/72 text-[#bfefff]",
    pill: "border-[#1fd7ff]/18 bg-[#0f202a]/74 text-[#bfefff]",
    softCard:
      "border-[#1fd7ff]/14 bg-[linear-gradient(180deg,rgba(10,34,46,0.54),rgba(10,13,18,0.28))]",
    accentText: "text-[#7de8ff]",
    mutedText: "text-[#d1f7ff]",
  },
};

const LINE_DURATION = 1500;
const FADE_DURATION = 220;
const GENERATION_STEP_DELAY = 650;
const GENERATION_CHAR_INTERVAL = 26;
const GENERATE_DURATION = 2800;
const AUTO_RESERVE_DELAY = 1200;
const TRAILER_PROGRESS_MAX = 82;
const TOTAL_FAKE_SECONDS = 28;

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.min(TOTAL_FAKE_SECONDS, seconds));
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function getMemoryPrompt(choice: UserChoice | null) {
  if (choice === "A") {
    return "上一次，你让她往前走了一步。这一次，她还会为那个迟到的答案下楼吗？";
  }

  if (choice === "B") {
    return "上一次，你让她把情绪留在夜里。这一次，她还会先把自己放在前面吗？";
  }

  return "如果故事停在这一秒，你想让她去见他，还是先把夜色留给自己？";
}

function getEmotionLine(choice: UserChoice) {
  return choice === "B"
    ? "爱一个人，也要先爱自己。"
    : "有些事，不做会后悔一辈子。";
}

function getGeneratedVersionLabel(version: GeneratedVersion) {
  if (version === "rational-cut") return "AI 定制版：更靠近自我的预告";
  if (version === "emotion-cut") return "AI 定制版：更靠近答案的预告";
  return "等待生成专属版本";
}

function getGeneratedVersionTitle(version: GeneratedVersion) {
  if (version === "rational-cut") return "更靠近自我的预告";
  if (version === "emotion-cut") return "更靠近答案的预告";
  return "等待生成专属版本";
}

function getResultLines(choice: UserChoice) {
  return [getEmotionLine(choice), ...RESULT_SCENES[choice].lines];
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 44 44" className="h-10 w-10 shrink-0">
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#29f08d" />
            <stop offset="100%" stopColor="#14b4ff" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ffe561" />
            <stop offset="100%" stopColor="#ffa71f" />
          </linearGradient>
        </defs>
        <path
          d="M21.5 3.8c-10 0-18 8-18 18s8 18.4 18 18.4c10.5 0 18.7-8 18.7-18.4S32 3.8 21.5 3.8Z"
          fill="url(#g1)"
        />
        <path
          d="M14.4 11.7c0-1.8 2-2.9 3.6-2l14.8 8.3c1.7 1 1.7 3.4 0 4.4l-14.8 8.2c-1.6 1-3.6-.2-3.6-2V11.7Z"
          fill="url(#g2)"
        />
        <path d="M19.6 16.3 27.6 21l-8 4.8v-9.5Z" fill="#fff" />
      </svg>
      <span className="text-[18px] font-semibold tracking-[0.04em] text-white">腾讯视频</span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function Page() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [userChoice, setUserChoice] = useState<UserChoice | null>(null);
  const [lastChoiceMemory, setLastChoiceMemory] = useState<UserChoice | null>(null);
  const [emotion, setEmotion] = useState<EmotionTone>(null);
  const [rational, setRational] = useState<boolean | null>(null);
  const [generatedVersion, setGeneratedVersion] = useState<GeneratedVersion>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerIndex, setTrailerIndex] = useState(0);
  const [resultIndex, setResultIndex] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [reserved, setReserved] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [eventLogs, setEventLogs] = useState<AnalyticsEvent[]>([]);
  const [generationStepIndex, setGenerationStepIndex] = useState(-1);
  const [generationTypedChars, setGenerationTypedChars] = useState(0);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reserveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      setGenerationStepIndex(-1);
      setGenerationTypedChars(0);
      return;
    }

    const generationTimeouts: ReturnType<typeof setTimeout>[] = [];
    const generationIntervals: ReturnType<typeof setInterval>[] = [];

    GENERATION_STEPS.forEach((step, index) => {
      const startStepTimeout = setTimeout(() => {
        setGenerationStepIndex(index);
        setGenerationTypedChars(0);

        let charCount = 0;
        const typingInterval = setInterval(() => {
          charCount += 1;
          setGenerationTypedChars(charCount);

          if (charCount >= step.length) {
            clearInterval(typingInterval);
          }
        }, GENERATION_CHAR_INTERVAL);

        generationIntervals.push(typingInterval);
      }, index * GENERATION_STEP_DELAY);

      generationTimeouts.push(startStepTimeout);
    });

    return () => {
      generationTimeouts.forEach(clearTimeout);
      generationIntervals.forEach(clearInterval);
    };
  }, [isGenerating]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
      if (reserveTimeoutRef.current) clearTimeout(reserveTimeoutRef.current);
    };
  }, []);

  const addEvent = (title: string, detail: string) => {
    setEventLogs((current) => [
      { id: Date.now() + Math.random(), title, detail },
      ...current,
    ].slice(0, 6));
  };

  const transitionSubtitle = (nextText: string) => {
    setSubtitleVisible(false);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setSubtitle(nextText);
      setSubtitleVisible(true);
    }, FADE_DURATION);
  };

  useEffect(() => {
    if (phase !== "trailer" || isPaused) return;
    const timer = setTimeout(() => {
      if (trailerIndex >= TRAILER_LINES.length - 1) {
        setProgress(TRAILER_PROGRESS_MAX);
        setIsPaused(true);
        setPhase("choice");
        addEvent("互动节点", "预告已停在悬念点，等待用户选择。");
        return;
      }
      const nextIndex = trailerIndex + 1;
      setTrailerIndex(nextIndex);
      setProgress(((nextIndex + 1) / TRAILER_LINES.length) * TRAILER_PROGRESS_MAX);
      transitionSubtitle(TRAILER_LINES[nextIndex]);
    }, LINE_DURATION);
    return () => clearTimeout(timer);
  }, [phase, trailerIndex, isPaused]);

  useEffect(() => {
    if (phase !== "result" || !userChoice || isPaused || isGenerating) return;
    const lines = getResultLines(userChoice);
    const timer = setTimeout(() => {
      if (resultIndex >= lines.length - 1) {
        setProgress(100);
        setIsPaused(true);
        setPhase("done");
        return;
      }
      const nextIndex = resultIndex + 1;
      setResultIndex(nextIndex);
      setProgress(
        TRAILER_PROGRESS_MAX + ((nextIndex + 1) / lines.length) * (100 - TRAILER_PROGRESS_MAX),
      );
      transitionSubtitle(lines[nextIndex]);
    }, LINE_DURATION);
    return () => clearTimeout(timer);
  }, [phase, resultIndex, userChoice, isPaused, isGenerating]);

  useEffect(() => {
    if (phase !== "done" || !userChoice || reserved) return;

    addEvent("预约曝光", `${RESULT_SCENES[userChoice].title} 分支的预约按钮已展示。`);
    reserveTimeoutRef.current = setTimeout(() => {
      setReserved(true);
      addEvent("预约点击", `已模拟用户点击“预约正片更新” - ${RESULT_SCENES[userChoice].title}`);
    }, AUTO_RESERVE_DELAY);

    return () => {
      if (reserveTimeoutRef.current) clearTimeout(reserveTimeoutRef.current);
    };
  }, [phase, reserved, userChoice]);

  const startTrailer = () => {
    setPhase("trailer");
    setUserChoice(null);
    setEmotion(null);
    setRational(null);
    setGeneratedVersion(null);
    setTrailerIndex(0);
    setResultIndex(0);
    setReserved(false);
    setIsPaused(false);
    setIsGenerating(false);
    setProgress(TRAILER_PROGRESS_MAX / TRAILER_LINES.length);
    setSubtitle(TRAILER_LINES[0]);
    setSubtitleVisible(true);
    addEvent("播放启动", "用户进入互动预告播放。");
  };

  const handleChoice = (choice: UserChoice) => {
    const nextEmotion: EmotionTone = choice === "B" ? "rational" : "emotional";
    const nextVersion: GeneratedVersion = choice === "B" ? "rational-cut" : "emotion-cut";
    const lines = getResultLines(choice);

    if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
    if (reserveTimeoutRef.current) clearTimeout(reserveTimeoutRef.current);

    setUserChoice(choice);
    setLastChoiceMemory(choice);
    setEmotion(nextEmotion);
    setRational(choice === "B");
    setGeneratedVersion(nextVersion);
    setResultIndex(0);
    setReserved(false);
    setIsPaused(true);
    setIsGenerating(true);
    setPhase("result");
    setProgress(TRAILER_PROGRESS_MAX);
    addEvent(
      "分支选择",
      choice === "A" ? "选择去见他（情感冲动）" : "选择不要去（理性克制）",
    );
    addEvent("角色记忆", getMemoryPrompt(choice));

    generateTimeoutRef.current = setTimeout(() => {
      setIsGenerating(false);
      setIsPaused(false);
      setProgress(TRAILER_PROGRESS_MAX + (1 / lines.length) * (100 - TRAILER_PROGRESS_MAX));
      setSubtitle(lines[0]);
      setSubtitleVisible(true);
      addEvent("AI生成", `${getGeneratedVersionLabel(nextVersion)} 已生成完成。`);
    }, GENERATE_DURATION);
  };

  const replay = () => {
    if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
    if (reserveTimeoutRef.current) clearTimeout(reserveTimeoutRef.current);
    setPhase("intro");
    setUserChoice(null);
    setEmotion(null);
    setRational(null);
    setGeneratedVersion(null);
    setTrailerIndex(0);
    setResultIndex(0);
    setSubtitle("");
    setSubtitleVisible(true);
    setProgress(0);
    setReserved(false);
    setIsPaused(false);
    setIsGenerating(false);
    addEvent("重新观看", "用户重新进入互动预告首页。");
  };

  const togglePlay = () => {
    if (phase === "intro") {
      startTrailer();
      return;
    }
    if (phase === "choice" || phase === "done" || isGenerating) return;
    setIsPaused((value) => !value);
    addEvent("播放控制", isPaused ? "继续播放预告。" : "暂停当前预告。");
  };

  const handleReserve = () => {
    if (!userChoice) return;

    if (reserveTimeoutRef.current) clearTimeout(reserveTimeoutRef.current);

    if (!reserved) {
      setReserved(true);
      addEvent("预约点击", `用户手动点击“预约正片更新” - ${RESULT_SCENES[userChoice].title}`);
      return;
    }

    addEvent("预约确认", `用户再次确认保留预约提醒 - ${RESULT_SCENES[userChoice].title}`);
  };

  const sceneMeta = userChoice ? RESULT_SCENES[userChoice] : null;
  const personalization = userChoice ? PREVIEW_RECOMPOSITION[userChoice] : null;
  const branchVisual = userChoice ? BRANCH_VISUALS[userChoice] : null;
  const versionLabel = getGeneratedVersionLabel(generatedVersion);
  const versionTitle = getGeneratedVersionTitle(generatedVersion);
  const dashboardEvents = DASHBOARD_EVENT_TIMELINE.map((item) => {
    switch (item.event) {
      case "trailer_enter":
        return {
          ...item,
          description:
            phase === "intro"
              ? "等待用户进入第13集预告。"
              : "用户已进入第13集互动预告，开始片尾承接。",
          status: phase === "intro" ? "等待中" : "已触发",
          active: phase !== "intro",
        };
      case "suspense_pause":
        return {
          ...item,
          description:
            phase === "choice" || phase === "result" || phase === "done"
              ? "预告已在悬念点暂停，成功把用户带入选择节点。"
              : "预告仍在推进，等待到达悬念停顿点。",
          status:
            phase === "choice" || phase === "result" || phase === "done" ? "已触发" : "等待中",
          active: phase === "choice" || phase === "result" || phase === "done",
        };
      case "choice_submit":
        return {
          ...item,
          description: userChoice
            ? `用户已完成互动选择：${userChoice === "A" ? "去见他" : "先不去"}。`
            : "等待用户做出剧情选择，触发个性化生成。",
          status: userChoice ? "已触发" : "等待中",
          active: Boolean(userChoice),
        };
      case "ai_preview_generate":
        return {
          ...item,
          description: isGenerating
            ? "AI 正在重组片段、匹配情绪节奏并生成专属版本。"
            : generatedVersion
              ? `${versionTitle} 已生成完成，内容可继续播放。`
              : "尚未进入生成阶段。",
          status: isGenerating ? "生成中" : generatedVersion ? "已完成" : "等待中",
          active: isGenerating || Boolean(generatedVersion),
        };
      case "extended_preview_play":
        return {
          ...item,
          description:
            phase === "result" || phase === "done"
              ? `用户正在观看${versionTitle}带来的延长预告内容。`
              : "专属预告尚未播放。",
          status:
            phase === "result" ? "播放中" : phase === "done" ? "已触发" : "等待中",
          active: phase === "result" || phase === "done",
        };
      case "episode_reserve_click":
        return {
          ...item,
          description: reserved
            ? "用户已点击预约正片，完成转化动作。"
            : phase === "done"
              ? "预约入口已出现，正在等待用户点击。"
              : "预约入口尚未露出。",
          status: reserved ? "已转化" : phase === "done" ? "待转化" : "等待中",
          active: reserved || phase === "done",
        };
    }
  });
  const memoryPrompt = getMemoryPrompt(lastChoiceMemory);
  const currentTime = formatTime(Math.round((progress / 100) * TOTAL_FAKE_SECONDS));
  const dashboardTriggeredCount = dashboardEvents.filter((item) => item.active).length;
  const showControls =
    isHovered || phase === "intro" || phase === "choice" || phase === "done" || isPaused || isGenerating;
  const playerStatus =
    phase === "intro"
      ? "待播放"
      : phase === "trailer"
        ? isPaused
          ? "预告暂停中"
          : "预告播放中"
        : phase === "choice"
          ? "互动选择"
          : phase === "result"
            ? isGenerating
              ? "AI 生成中"
              : isPaused
                ? "分支暂停中"
                : "专属预告播放中"
            : "彩蛋已解锁";

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1820px] flex-col px-4 pb-12 pt-4 md:px-6 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center gap-4 rounded-[26px] bg-[#171717] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.26)]">
          <Logo />

          <nav className="hidden items-center gap-7 pl-3 text-[17px] text-white/78 lg:flex">
            {NAV_ITEMS.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`transition-colors duration-300 hover:text-white ${
                  index === 0 ? "font-semibold text-white" : ""
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="min-w-[240px] flex-1 lg:px-3">
            <div className="flex h-14 items-center justify-between rounded-full bg-[#252525] px-5 text-white/48">
              <span className="text-base">玫瑰的故事</span>
              <SearchIcon />
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-5 xl:flex">
            {HEADER_ACTIONS.map((action, index) => (
              <button
                key={action}
                type="button"
                className="flex items-center gap-2 text-sm text-white/62 transition-colors duration-300 hover:text-white"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === 0 ? "bg-[#f1c15b]" : "bg-white/35"
                  }`}
                />
                {action}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hidden h-11 items-center rounded-full bg-white/10 px-5 text-sm font-medium text-white transition-colors duration-300 hover:bg-white/16 xl:flex"
          >
            下载客户端
          </button>

          <button
            type="button"
            className="ml-auto h-11 rounded-full bg-white/14 px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-white/20 xl:ml-0"
          >
            登录
          </button>
        </header>

        <section className="relative mb-5 overflow-hidden rounded-[32px] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(12,21,28,0.98),rgba(16,16,16,0.98))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] ring-1 ring-white/[0.04] md:p-6">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(125,232,255,0.14),transparent_70%)]" />
          <div className="pointer-events-none absolute -right-10 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(34,180,255,0.16),transparent_68%)] blur-2xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,205,128,0.12),transparent_68%)] blur-2xl" />

          <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#1fd7ff]/12 bg-[linear-gradient(180deg,rgba(18,32,40,0.92),rgba(17,17,17,0.82))] px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7de8ff] shadow-[0_0_14px_rgba(125,232,255,0.5)]" />
                <span className="text-[11px] tracking-[0.28em] text-[#7de8ff] uppercase">Competition Demo</span>
              </div>

              <p className="mt-5 text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">产品命题</p>
              <h2 className="mt-3 max-w-5xl text-[28px] font-semibold leading-tight text-white md:text-[38px] md:leading-[1.14]">
                {PRODUCT_THESIS}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
                面向长视频平台的片尾互动能力演示，用更强的参与感、生成感和转化感，证明 AI 不是附加玩法，而是新的产品链路入口。
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/74">
                {["互动预告", "个性化生成", "片尾转化", "AI 情绪理解"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2 ring-1 ring-white/[0.03]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {HERO_HIGHLIGHTS.map(([title, detail]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.16)]"
                >
                  <p className="text-sm font-medium text-[#7de8ff]">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-white/60">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["目标链路", "片尾预告 -> 互动选择 -> AI 生成 -> 预约转化"],
              ["演示重点", "让评委同时看到剧情反馈、数据反馈和商业价值反馈"],
              ["当前状态", playerStatus],
            ].map(([title, detail]) => (
              <div
                key={title}
                className="rounded-[22px] border border-white/[0.06] bg-black/18 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                <p className="text-[11px] tracking-[0.24em] text-white/38 uppercase">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className="min-w-0">
            <div
              className="relative overflow-hidden rounded-[34px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(21,24,27,0.98),rgba(12,12,12,0.98))] p-[10px] shadow-[0_28px_100px_rgba(0,0,0,0.34)] ring-1 ring-white/[0.03]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="pointer-events-none absolute left-8 right-8 top-0 h-16 bg-[radial-gradient(circle_at_top,rgba(125,232,255,0.12),transparent_72%)]" />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(125,232,255,0.48),rgba(18,55,70,0.94))] shadow-[0_0_20px_rgba(125,232,255,0.2)]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d7fbff]" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 19h14" strokeLinecap="round" />
                      <path d="M7 16V8" strokeLinecap="round" />
                      <path d="M12 16V5" strokeLinecap="round" />
                      <path d="M17 16v-6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] tracking-[0.28em] text-[#7de8ff] uppercase">Interactive Trailer Engine</p>
                    <p className="mt-1 text-sm text-white/68">剧情响应、分支生成与转化承接在同一播放器内完成</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-white/58">
                  {[
                    userChoice ? `已选分支 ${userChoice}` : "等待选择",
                    generatedVersion ? versionTitle : "未生成版本",
                    reserved ? "预约已触发" : "转化待触发",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] bg-[#0f0f0f] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-video overflow-hidden bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_40%,rgba(239,215,158,0.28),transparent_28%),radial-gradient(circle_at_62%_34%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_80%_72%,rgba(130,90,60,0.34),transparent_25%)]" />
                {userChoice && phase !== "intro" && phase !== "choice" && (
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${BRANCH_VISUALS[userChoice].ambient}`}
                  />
                )}
                <div className="absolute -left-[3%] top-0 h-full w-[11%] bg-[linear-gradient(90deg,rgba(56,35,20,0.76),rgba(130,91,64,0.12),transparent)]" />
                <div className="absolute left-[8%] top-0 h-full w-[8%] bg-[linear-gradient(90deg,rgba(255,239,194,0.22),rgba(255,255,255,0.05),transparent)] blur-[2px]" />
                <div className="absolute right-[12%] top-[10%] h-[72%] w-[32%] rounded-[42%] bg-[radial-gradient(circle_at_42%_34%,rgba(247,226,204,0.42),rgba(83,54,37,0.78)_52%,rgba(26,21,19,0.96)_82%)] opacity-80 blur-[1px]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.66),transparent_24%,transparent_70%,rgba(0,0,0,0.84))]" />

                <div className="absolute left-7 top-7 space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] tracking-[0.24em] text-white/55 uppercase">
                    <span className="h-2 w-2 rounded-full bg-[#1fd7ff]" />
                    AI 互动预告
                  </div>
                  <h1 className="text-2xl font-semibold md:text-[50px] md:leading-[1.06]">
                    玫瑰的故事 第13集预告
                  </h1>
                  <p className="max-w-xl text-base text-white/78 md:text-[18px]">
                    停在悬念点，让同一段预告按用户选择生成不同情绪版本。
                  </p>
                  {(lastChoiceMemory || sceneMeta) && (
                    <div className="max-w-xl rounded-2xl border border-white/12 bg-[#0f1820]/65 px-4 py-3 text-sm leading-7 text-[#e6edf2] backdrop-blur-sm">
                      {sceneMeta && (
                        <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] tracking-[0.2em] text-white/62 uppercase">
                          {sceneMeta.badge}
                        </div>
                      )}
                      {lastChoiceMemory && (
                        <div>
                          <span className="mr-2 text-white/58">上一轮选择：</span>
                          {memoryPrompt}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute right-7 top-5 flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-white/14 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-white/20"
                  >
                    客户端播放
                  </button>
                  <div className="rounded-full border border-white/10 bg-black/26 px-4 py-2 text-xs tracking-[0.22em] text-white/58 uppercase">
                    {playerStatus}
                  </div>
                </div>

                {!generatedVersion && (
                  <div className="absolute right-10 top-20 hidden items-center gap-3 text-4xl font-semibold text-white/12 lg:flex">
                    <Logo />
                  </div>
                )}

                {generatedVersion && phase !== "intro" && phase !== "choice" && (
                  <div
                    className={`absolute right-7 top-20 rounded-[20px] border px-4 py-3 text-left shadow-[0_16px_42px_rgba(0,0,0,0.22)] backdrop-blur-md ${
                      branchVisual?.surface ?? "border-white/12 bg-[linear-gradient(180deg,rgba(9,19,26,0.86),rgba(9,19,26,0.7))]"
                    }`}
                  >
                    <p
                      className={`text-[10px] tracking-[0.26em] uppercase ${
                        branchVisual?.accentText ?? "text-white/45"
                      }`}
                    >
                      AI 定制版
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/88">{versionTitle}</p>
                  </div>
                )}

                {phase === "intro" && (
                  <div className="absolute inset-0 flex items-center justify-center px-6">
                    <div className="rounded-[30px] border border-white/10 bg-black/42 px-8 py-9 text-center backdrop-blur-md md:px-12">
                      <p className="text-sm tracking-[0.38em] text-white/45 uppercase">Episode Ended</p>
                      <h2 className="mt-4 text-3xl font-light tracking-[0.16em] md:text-5xl">
                        第 12 集已结束
                      </h2>
                      <p className="mt-4 text-base tracking-[0.2em] text-white/70 md:text-lg">
                        即将播放：第 13 集 AI 互动预告
                      </p>
                      <button
                        type="button"
                        onClick={startTrailer}
                        className="mt-8 rounded-full bg-[#19d6ff] px-8 py-3 text-sm font-semibold tracking-[0.22em] text-[#04161b] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#59e4ff] hover:shadow-[0_16px_44px_rgba(25,214,255,0.28)]"
                      >
                        播放预告
                      </button>
                    </div>
                  </div>
                )}

                {phase !== "intro" && (
                  <div className="absolute inset-x-0 bottom-24 px-8 text-center md:bottom-28 md:px-14">
                    <p
                      className={`mx-auto max-w-4xl text-[22px] font-light leading-relaxed tracking-[0.2em] text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.55)] transition-all duration-500 md:text-[40px] ${
                        subtitleVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                      }`}
                    >
                      {subtitle}
                    </p>
                  </div>
                )}

                {phase === "choice" && (
                  <div className="choice-overlay absolute inset-x-0 bottom-0 top-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.58)_58%,rgba(0,0,0,0.74))] px-5">
                    <div className="choice-card absolute bottom-28 left-1/2 w-[min(860px,calc(100%-2.5rem))] -translate-x-1/2 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(23,23,23,0.54),rgba(15,15,15,0.38))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:bottom-32 md:p-8">
                      <div className="mb-7 text-center">
                        <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        <p className="text-xs tracking-[0.32em] text-white/42 uppercase">Interactive Choice</p>
                        <h3 className="mt-3 text-[26px] font-medium md:text-[34px]">你希望她怎么选？</h3>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65">
                          {memoryPrompt}
                        </p>
                        <div className="mx-auto mt-4 max-w-3xl rounded-[22px] border border-white/8 bg-black/22 px-4 py-4 text-left backdrop-blur-sm">
                          <p className="text-[11px] tracking-[0.24em] text-[#7fe6ff] uppercase">
                            AI 作用
                          </p>
                          <p className="mt-2 text-sm leading-7 text-white/62">{AI_NECESSITY}</p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleChoice("A")}
                          className="rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(32,32,32,0.66),rgba(20,20,20,0.58))] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/26 hover:bg-[linear-gradient(180deg,rgba(40,40,40,0.74),rgba(24,24,24,0.66))] hover:shadow-[0_22px_60px_rgba(255,255,255,0.08)] active:scale-[0.99]"
                        >
                          <p className="text-xs tracking-[0.28em] text-white/52 uppercase">选项 A</p>
                          <p className="mt-4 text-xl font-medium text-white">去见他</p>
                          <p className="mt-3 text-sm leading-7 text-white/68">
                            让她把迟到的那句话听完，也让这一夜真正有个落点。
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChoice("B")}
                          className="rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(32,32,32,0.66),rgba(20,20,20,0.58))] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/26 hover:bg-[linear-gradient(180deg,rgba(40,40,40,0.74),rgba(24,24,24,0.66))] hover:shadow-[0_22px_60px_rgba(255,255,255,0.08)] active:scale-[0.99]"
                        >
                          <p className="text-xs tracking-[0.28em] text-white/52 uppercase">选项 B</p>
                          <p className="mt-4 text-xl font-medium text-white">不要去</p>
                          <p className="mt-3 text-sm leading-7 text-white/68">
                            让她先把情绪放回自己手里，不急着为谁给出答案。
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {phase === "result" && isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/74 px-5 backdrop-blur-md">
                    <div
                      className={`w-full max-w-xl rounded-[28px] border px-8 py-8 text-left shadow-[0_28px_90px_rgba(0,0,0,0.45)] ${
                        branchVisual?.surface ?? "border-[#1fd7ff]/16 bg-[#11161a]/94"
                      }`}
                    >
                      <p className="text-xs tracking-[0.32em] text-[#7de8ff] uppercase">AI 生成中</p>
                      <h3 className="mt-3 text-[28px] font-semibold text-white">{versionLabel}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/70">
                        {emotion === "rational"
                          ? "系统正在收拢情绪、拉长留白，并把这一版预告推向更理性的节奏。"
                          : "系统正在提升情绪张力、压缩犹豫留白，并把这一版预告推向更直接的心动。"}
                      </p>
                      <div className="mt-6 space-y-3">
                        {GENERATION_STEPS.map((step, index) => {
                          const isComplete =
                            index < generationStepIndex ||
                            (index === generationStepIndex && generationTypedChars >= step.length);
                          const isActive = index === generationStepIndex;
                          const visibleText =
                            index < generationStepIndex
                              ? step
                              : index === generationStepIndex
                                ? step.slice(0, generationTypedChars)
                                : "";

                          return (
                            <div key={step} className="flex min-h-[28px] items-start gap-3">
                              <span
                                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-300 ${
                                  isComplete || isActive
                                    ? "bg-[#7de8ff] shadow-[0_0_14px_rgba(125,232,255,0.45)]"
                                    : "bg-white/18"
                                } ${isActive ? "animate-pulse" : ""}`}
                              />
                              <p
                                className={`text-sm leading-7 ${
                                  index === GENERATION_STEPS.length - 1 && isComplete
                                    ? "text-[#7de8ff]"
                                    : "text-white/70"
                                }`}
                              >
                                {visibleText}
                                {isActive && generationTypedChars < step.length && (
                                  <span className="ml-0.5 inline-block h-4 w-px translate-y-[2px] bg-[#7de8ff] animate-pulse" />
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {personalization && phase !== "intro" && phase !== "choice" && !isGenerating && (
                  <div
                    className={`absolute right-7 top-36 w-[300px] rounded-[24px] border p-4 shadow-[0_20px_52px_rgba(0,0,0,0.28)] backdrop-blur-lg ${
                      branchVisual?.surface ??
                      "border-white/10 bg-[linear-gradient(180deg,rgba(10,15,19,0.84),rgba(15,15,15,0.68))]"
                    }`}
                  >
                    <p className="text-[11px] tracking-[0.26em] text-[#7fe6ff] uppercase">
                      角色路径反馈
                    </p>
                    <h4 className={`mt-2 text-[20px] font-semibold ${branchVisual?.mutedText ?? "text-white"}`}>
                      {personalization.roleTitle}
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-white/68">
                      {personalization.roleDescription}
                    </p>
                    <div className="mt-4 rounded-2xl bg-white/[0.04] px-3 py-3 ring-1 ring-white/[0.06]">
                      <p className="text-[11px] tracking-[0.2em] text-white/42 uppercase">当前关键词</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {personalization.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className={`rounded-full px-3 py-1.5 text-xs ${branchVisual?.chip ?? "bg-white/[0.05] text-white/72"}`}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {phase === "done" && sceneMeta && (
                  <div className="absolute inset-x-0 bottom-40 flex flex-col items-center gap-4 px-6 text-center md:bottom-44">
                    <div
                      className={`rounded-full border px-5 py-2 text-sm tracking-[0.24em] uppercase ${
                        branchVisual?.pill ?? "border-white/10 bg-black/42 text-white/64"
                      }`}
                    >
                      当前版本：{sceneMeta.title}
                    </div>
                    <button
                      type="button"
                      onClick={handleReserve}
                      className={`rounded-full px-9 py-3 text-sm font-semibold tracking-[0.18em] transition-all duration-300 ${
                        reserved
                          ? "border border-[#ffe1a6]/40 bg-[#4d3911]/85 text-[#ffe4ad] shadow-[0_18px_46px_rgba(255,184,63,0.16)]"
                          : "bg-[#f6d17a] text-[#362400] hover:-translate-y-0.5 hover:bg-[#ffe39d] hover:shadow-[0_18px_46px_rgba(255,209,122,0.26)]"
                      }`}
                    >
                      {reserved ? "已预约正片更新" : "预约正片更新"}
                    </button>
                    <button
                      type="button"
                      onClick={replay}
                      className="text-sm tracking-[0.2em] text-white/58 transition-colors duration-300 hover:text-white/86"
                    >
                      重新观看互动预告
                    </button>
                  </div>
                )}

              </div>

              <div className="relative bg-[linear-gradient(180deg,rgba(11,11,11,0.98),rgba(17,17,17,1))] px-5 pb-5 pt-3 md:px-7">
                <div className="relative mt-2 rounded-[18px] bg-black/18 px-3 py-3 md:px-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[13px] font-medium text-white/74 transition-all duration-200 ${
                        isHovered ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
                      }`}
                    >
                      {currentTime}
                    </span>
                    <div className="relative flex-1">
                      <div
                        className={`pointer-events-none absolute -top-8 z-10 rounded-full bg-black/88 px-2.5 py-1 text-[11px] font-medium text-white transition-all duration-200 ${
                          isHovered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                        }`}
                        style={{
                          left:
                            progress <= 0
                              ? "0px"
                              : progress >= 100
                                ? "calc(100% - 44px)"
                                : `calc(${progress}% - 22px)`,
                        }}
                      >
                        {currentTime}
                      </div>
                      <div className="relative h-[4px] overflow-hidden rounded-full bg-[#2a2a2a]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-[#16d8ff] transition-[width] duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#d7fbff] shadow-[0_0_16px_rgba(22,216,255,0.38)] transition-all duration-200 ${
                          isHovered ? "scale-100 opacity-100" : "scale-75 opacity-0"
                        }`}
                        style={{
                          left:
                            progress <= 0
                              ? "0px"
                              : progress >= 100
                                    ? "calc(100% - 12px)"
                                    : `calc(${progress}% - 6px)`,
                        }}
                      />
                    </div>
                    </div>
                    <span
                      className={`text-[13px] font-medium text-white/74 transition-all duration-200 ${
                        isHovered ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
                      }`}
                    >
                      {formatTime(TOTAL_FAKE_SECONDS)}
                    </span>
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    showControls
                      ? "mt-4 max-h-40 opacity-100"
                      : "mt-0 max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.68),rgba(17,17,17,0.42))] px-4 py-4 shadow-[0_20px_52px_rgba(0,0,0,0.24)] backdrop-blur-xl md:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/72">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="rounded-full bg-white/10 px-4 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/16 active:translate-y-0"
                        >
                          {phase === "intro" ? "播放" : isPaused ? "继续" : "暂停"}
                        </button>
                        <button
                          type="button"
                          className="rounded-full px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                        >
                          下一集
                        </button>
                        <button
                          type="button"
                          className="rounded-full px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                        >
                          弹幕
                        </button>
                        <div className="hidden rounded-full bg-white/8 px-4 py-2 text-white/40 lg:block">
                          登录发个友善的弹幕吧！
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded-full bg-[#f6d17a] px-5 py-2 text-sm font-semibold text-[#362400] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffe39d] active:translate-y-0"
                      >
                        新客特惠开 VIP
                      </button>

                      <div className="flex items-center gap-1">
                        {["音量", "480P", "倍速", "设置", "小窗", "全屏"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="rounded-full px-3 py-2 font-medium text-white/88 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <section className="mt-7 overflow-hidden rounded-[30px] border border-[#1fd7ff]/10 bg-[linear-gradient(135deg,rgba(13,18,24,0.96),rgba(17,17,17,0.98))] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.24)] ring-1 ring-white/[0.04] md:p-6">
              <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center gap-4 rounded-full border border-[#1fd7ff]/12 bg-[linear-gradient(180deg,rgba(18,31,39,0.92),rgba(17,17,17,0.82))] px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(125,232,255,0.56),rgba(17,53,68,0.94))] shadow-[0_0_24px_rgba(125,232,255,0.26)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#d7fbff]" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h10" strokeLinecap="round" />
                      <path d="m11 7 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="12" r="2.4" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] tracking-[0.28em] text-[#7de8ff] uppercase">Insight Flow</p>
                    <p className="mt-1 text-sm text-white/72">互动结果正在流向实时效果看板</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">Live Metrics</p>
                  <h3 className="mt-3 text-[28px] font-semibold text-white">实时效果看板</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    模拟展示 AI 互动预告在播放链路中的用户行为、内容生成与转化效果
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-sm text-white/62">
                    已联动事件 <span className="ml-2 text-[#7de8ff]">{dashboardTriggeredCount}/6</span>
                  </div>
                  <div className="rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-sm text-white/62">
                    当前阶段 <span className="ml-2 text-[#7de8ff]">{playerStatus}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_1.15fr]">
                <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] tracking-[0.26em] text-[#7de8ff] uppercase">实时埋点流</p>
                      <h4 className="mt-2 text-[22px] font-semibold text-white">实时埋点流</h4>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
                        从用户选择到专属预告生成，关键行为被转化为可运营的数据事件。
                      </p>
                    </div>
                    <div className="rounded-full bg-white/[0.04] px-3 py-1 text-xs tracking-[0.18em] text-white/42 uppercase">
                      {eventLogs.length} 条联动日志
                    </div>
                  </div>

                  <div className="mt-5 max-h-[430px] space-y-3 overflow-y-auto pr-1">
                    {dashboardEvents.map((item, index) => {
                      const isWaiting = item.status === "等待中";
                      const isWorking = item.status === "生成中" || item.status === "播放中";
                      const isConversion = item.status === "已转化" || item.status === "待转化";

                      return (
                        <div
                          key={item.event}
                          className={`relative overflow-hidden rounded-[22px] border px-4 py-4 transition-all duration-300 ${
                            item.active
                              ? "border-[#1fd7ff]/12 bg-[linear-gradient(180deg,rgba(13,29,38,0.46),rgba(255,255,255,0.02))]"
                              : "border-white/6 bg-white/[0.02]"
                          }`}
                        >
                          {index < dashboardEvents.length - 1 && (
                            <div className="pointer-events-none absolute left-[21px] top-[44px] h-[calc(100%-16px)] w-px bg-[linear-gradient(180deg,rgba(125,232,255,0.32),rgba(255,255,255,0))]" />
                          )}
                          <div className="flex gap-4">
                            <div className="pt-1">
                              <span
                                className={`block h-3 w-3 rounded-full transition-all duration-300 ${
                                  isWaiting
                                    ? "bg-white/18"
                                    : isWorking
                                      ? "bg-[#7de8ff] shadow-[0_0_18px_rgba(125,232,255,0.5)] animate-pulse"
                                      : isConversion
                                        ? "bg-[#ffd58f] shadow-[0_0_16px_rgba(255,213,143,0.36)]"
                                        : "bg-[#7de8ff] shadow-[0_0_14px_rgba(125,232,255,0.36)]"
                                }`}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex min-w-0 flex-wrap items-center gap-3">
                                  <span className="text-xs tracking-[0.16em] text-white/38">{item.time}</span>
                                  <span className="rounded-full bg-black/22 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/58">
                                    {item.event}
                                  </span>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.16em] ${
                                    isWaiting
                                      ? "bg-white/[0.04] text-white/40"
                                      : isWorking
                                        ? "bg-[#123341] text-[#7de8ff]"
                                        : isConversion
                                          ? "bg-[#3f2d15] text-[#ffdba6]"
                                          : "bg-[#102735] text-[#bfefff]"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-7 text-white/64">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {DASHBOARD_METRICS.map((metric) => (
                    <div
                      key={metric.title}
                      className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-white/52">{metric.title}</p>
                          <p className="mt-2 text-[30px] font-semibold text-[#7de8ff]">{metric.ai}%</p>
                        </div>
                        <div className="rounded-full bg-[#102735] px-3 py-1 text-sm font-semibold text-[#7de8ff]">
                          {metric.uplift}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-xs text-white/42">
                            <span>普通预告</span>
                            <span>{metric.normal}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))]"
                              style={{ width: `${metric.normal}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-white/52">AI互动预告</span>
                            <span className="font-semibold text-[#7de8ff]">{metric.ai}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-[#0e1b22]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#18d8ff,#7de8ff)] shadow-[0_0_18px_rgba(31,216,255,0.22)]"
                              style={{ width: `${metric.ai}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-white/54">{metric.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[11px] tracking-[0.26em] text-[#7de8ff] uppercase">效果对比图</p>
                    <h4 className="mt-2 text-[24px] font-semibold text-white">普通预告 vs AI互动预告</h4>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
                      数据为试点效果假设，用于展示互动预告对用户参与和转化链路的潜在提升。
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {DASHBOARD_METRICS.map((metric) => (
                    <div key={metric.title} className="grid gap-4 rounded-[22px] bg-black/14 px-4 py-4 md:grid-cols-[180px_minmax(0,1fr)_92px] md:items-center">
                      <div>
                        <p className="text-sm font-medium text-white/88">{metric.title}</p>
                        <p className="mt-1 text-xs text-white/40">普通 {metric.normal} / AI {metric.ai}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-12 shrink-0 text-xs text-white/38">普通</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))]"
                              style={{ width: `${metric.normal}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-xs text-white/46">{metric.normal}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="w-12 shrink-0 text-xs text-[#7de8ff]">AI</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#0c1920]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#16d8ff,#7de8ff)] shadow-[0_0_22px_rgba(22,216,255,0.22)]"
                              style={{ width: `${metric.ai}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-xs font-semibold text-[#7de8ff]">
                            {metric.ai}
                          </span>
                        </div>
                      </div>

                      <div className="justify-self-start rounded-full bg-[#102735] px-3 py-1.5 text-sm font-semibold text-[#7de8ff] md:justify-self-end">
                        {metric.uplift}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-xl">
                      <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">产品价值</p>
                      <h4 className="mt-2 text-[24px] font-semibold text-white">把片尾预告变成产品转化入口</h4>
                      <p className="mt-3 text-sm leading-7 text-white/62">
                        提升预告完播率、互动率和预约转化，同时沉淀更细的情绪选择数据，反哺推荐。
                      </p>
                    </div>

                    <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {PLATFORM_VALUES.map(([title, detail]) => (
                        <div
                          key={title}
                          className="rounded-[22px] bg-white/[0.04] p-4 ring-1 ring-white/[0.05]"
                        >
                          <p className="text-sm text-[#7fe6ff]">{title}</p>
                          <p className="mt-3 text-sm leading-6 text-white/62">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-[#1fd7ff]/10 bg-[linear-gradient(90deg,rgba(15,33,42,0.94),rgba(18,18,18,0.82))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#7de8ff] shadow-[0_0_16px_rgba(125,232,255,0.46)]" />
                    <p className="text-sm leading-7 text-white/72">
                      AI互动预告的价值不只是让预告更好玩，而是把片尾流失点改造成可交互、可生成、可转化的数据入口。
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-5">
            <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#1d1d1d,#171717)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.25)] ring-1 ring-white/[0.04]">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_72%)]" />
              <div className="pointer-events-none absolute inset-x-5 top-5 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[28px] font-semibold">玫瑰的故事</h2>
                  <p className="mt-1 text-sm text-white/48">简介</p>
                </div>
                <button type="button" className="text-white/32 transition-colors duration-300 hover:text-white/72">›</button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_168px]">
                <div className="min-w-0">
                  <p className="text-sm leading-7 text-white/60">
                    腾讯视频热播都市情感剧。把爱情、关系与自我成长放进同一条人生轨迹里。
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/58">
                    {STORY_TAGS.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="rounded-full bg-white/8 px-4 py-2 text-[15px] font-semibold">8.9分</div>
                    <div className="rounded-full bg-white/8 px-4 py-2 text-[15px] font-semibold">10894</div>
                    <div className="rounded-full bg-[#1b3940] px-4 py-2 text-[15px] font-semibold text-[#7de8ff]">
                      腾讯视频独播
                    </div>
                  </div>
                </div>

                <div className="md:justify-self-end">
                  <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.24)] ring-1 ring-white/[0.05]">
                    <div className="mb-2 flex items-center justify-between px-1 text-[10px] tracking-[0.2em] text-white/42 uppercase">
                      <span>官方海报</span>
                      <span>Rose Story</span>
                    </div>
                    <div className="relative overflow-hidden rounded-[20px] shadow-[0_22px_52px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.07]">
                      <div className="pointer-events-none absolute inset-0 z-10 rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
                      <img
                        src="/rose-poster.jpg"
                        alt="玫瑰的故事海报"
                        className="aspect-[3/4.4] w-[152px] object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-px bg-[linear-gradient(90deg,rgba(31,216,255,0.26),rgba(255,255,255,0.04),transparent)]" />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.05]">
                  <p className="text-[11px] tracking-[0.22em] text-white/40 uppercase">追剧日历</p>
                  <p className="mt-2 text-sm font-medium text-white/88">全 38 集 · 会员看全集</p>
                  <p className="mt-1 text-sm text-white/52">片尾可直达互动预告与预约入口</p>
                </div>
                <div className="rounded-[20px] bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.05]">
                  <p className="text-[11px] tracking-[0.22em] text-white/40 uppercase">剧情看点</p>
                  <p className="mt-2 text-sm font-medium text-white/88">爱情 / 关系 / 自我成长</p>
                  <p className="mt-1 text-sm text-white/52">更适合承接互动预告与情绪分支体验</p>
                </div>
              </div>

              <div className="mt-5 rounded-[20px] bg-[#141414] px-4 py-4 ring-1 ring-white/[0.05]">
                <p className="text-[11px] tracking-[0.22em] text-white/40 uppercase">一句简介</p>
                <p className="mt-2 text-sm leading-7 text-white/66">
                  她在爱与成长之间不断重写自己，也在每一次关系选择里，重新决定想成为谁。
                </p>
              </div>

              <div className="mt-6 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-white/[0.04]">
                <div className="mb-3 flex items-center justify-between px-1 text-[11px] tracking-[0.22em] text-white/34 uppercase">
                  <span>内容互动</span>
                  <span>会员权益</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-white/84">
                  {["加入", "下载", "更多"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="flex h-14 items-center justify-center rounded-2xl bg-white/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[22px] bg-[linear-gradient(135deg,#ffe4a6,#f6d17a_52%,#f0bc48)] p-4 text-[#573500]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold">新客 VIP 专享特惠！</p>
                    <p className="mt-1 text-sm text-[#6c4c17]">好剧热综持续更新，会员畅享精彩内容</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-[#b06800] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#8f5200]"
                  >
                    开通会员
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-[#1a1a1a] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.25)] ring-1 ring-white/[0.04]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm tracking-[0.26em] text-[#7de8ff] uppercase">用户价值</p>
                  <h3 className="mt-2 text-[20px] font-semibold">为什么这不是普通片尾预告</h3>
                </div>
                <div className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-white/46">
                  问题与解法
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {USER_PAIN_POINTS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/[0.05] px-3 py-2 text-sm text-white/68 ring-1 ring-white/[0.06]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 ring-1 ring-white/[0.05]">
                <p className="text-[11px] tracking-[0.24em] text-white/42 uppercase">解法</p>
                <p className="mt-3 text-sm leading-7 text-white/66">{USER_SOLUTION}</p>
              </div>
            </section>

            <section className="rounded-[28px] bg-[#1a1a1a] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-5 flex gap-8 text-[17px] font-semibold">
                <button type="button" className="text-white">播放列表</button>
                <button type="button" className="text-white/42 transition-colors duration-300 hover:text-white/72">相关推荐</button>
              </div>

              <div className="rounded-[24px] bg-[#262626] p-4">
                <p className="text-[16px] font-semibold">选集</p>
                <div className="mt-3 flex gap-3">
                  <button type="button" className="rounded-full bg-[#17444b] px-4 py-2 text-sm font-semibold text-[#39dcff]">1-30</button>
                  <button type="button" className="rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white/52">31-38</button>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-3">
                  {EPISODES.map((episode) => (
                    <button
                      key={episode.number}
                      type="button"
                      className={`relative h-[68px] rounded-[14px] text-center text-[16px] font-semibold transition-all duration-300 ${
                        episode.active
                          ? "bg-[#24484d] text-[#39dcff] shadow-[0_10px_28px_rgba(34,204,235,0.16)]"
                          : "bg-[#4a4a4a] text-white/92 hover:bg-[#595959]"
                      }`}
                    >
                      {episode.vip && (
                        <span className="absolute right-1.5 top-1.5 rounded-md bg-[#f6d17a] px-1.5 py-0.5 text-[10px] font-bold text-[#563600]">
                          VIP
                        </span>
                      )}
                      {episode.preview && (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-[#19d6ff] px-1.5 py-0.5 text-[10px] font-bold text-[#04202a]">
                          预告
                        </span>
                      )}
                      {episode.number}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#18d8ff]/12 bg-[linear-gradient(180deg,#171d1f,#141414)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm tracking-[0.26em] text-[#79e9ff] uppercase">角色回声</p>
                  <h3 className="mt-2 text-[20px] font-semibold">
                    {sceneMeta ? sceneMeta.title : "等待用户选择"}
                  </h3>
                </div>
                <div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/56">{playerStatus}</div>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/68">{memoryPrompt}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-[20px] border p-4 ${
                    branchVisual?.softCard ?? "border-white/8 bg-black/18"
                  }`}
                >
                  <p className={`text-sm ${branchVisual?.accentText ?? "text-white/46"}`}>情绪标签</p>
                  <p className="mt-2 text-[24px] font-semibold text-white">
                    {personalization ? personalization.toneLabel : "还未展开"}
                  </p>
                </div>
                <div
                  className={`rounded-[20px] border p-4 ${
                    branchVisual?.softCard ?? "border-white/8 bg-black/18"
                  }`}
                >
                  <p className={`text-sm ${branchVisual?.accentText ?? "text-white/46"}`}>音乐节奏</p>
                  <p className="mt-2 text-[24px] font-semibold text-white">
                    {personalization ? personalization.music : "还未生成"}
                  </p>
                </div>
              </div>

              <div
                className={`mt-4 rounded-[20px] border p-4 ${
                  branchVisual?.softCard ?? "border-[#1fd7ff]/12 bg-[#081118]/58"
                }`}
              >
                <p className="text-sm text-[#7fe6ff]">当前预告版本</p>
                <p className="mt-2 text-[22px] font-semibold text-white">{versionLabel}</p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  {sceneMeta
                    ? sceneMeta.description
                    : "预告将在结尾悬念点暂停，弹出双选项，用户选择后播放对应的彩蛋式剧情。"}
                </p>
                {personalization && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {personalization.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className={`rounded-full px-3 py-1.5 text-xs ${branchVisual?.chip ?? "bg-white/[0.05] text-white/72"}`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 ring-1 ring-white/[0.05]">
                <p className="text-sm text-[#7fe6ff]">AI 重组内容</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-black/18 px-4 py-3">
                    <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase">场景</p>
                    <p className="mt-1 text-sm leading-6 text-white/74">
                      {personalization ? personalization.scene : "根据用户选择，重组镜头顺序与空间氛围。"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/18 px-4 py-3">
                    <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase">台词</p>
                    <p className="mt-1 text-sm leading-6 text-white/74">
                      {personalization ? personalization.dialogue : "根据情绪倾向，切换更靠近冲突或反思的表达。"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/18 px-4 py-3">
                    <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase">音乐与节奏</p>
                    <p className="mt-1 text-sm leading-6 text-white/74">
                      {personalization
                        ? `${personalization.music}；${personalization.rhythm}`
                        : "根据用户情绪曲线，调节配乐强度与镜头节奏。"}
                    </p>
                  </div>
                </div>
                {personalization && (
                  <p className="mt-4 text-sm leading-7 text-white/62">{personalization.aiSummary}</p>
                )}
              </div>

              <div className="mt-4 rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 ring-1 ring-white/[0.05]">
                <p className="text-sm text-[#7fe6ff]">为什么是 AI</p>
                <p className="mt-3 text-sm leading-7 text-white/64">{AI_NECESSITY}</p>
              </div>

              <div className="mt-5 rounded-[20px] border border-white/8 bg-black/18 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/50">模拟埋点 / 用户行为</p>
                  <span className="text-xs text-white/34">{eventLogs.length} 条</span>
                </div>
                <div className="mt-4 space-y-3">
                  {eventLogs.length === 0 && (
                    <div className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-white/42">
                      还没有记录到互动行为，先播放预告并做一次选择。
                    </div>
                  )}
                  {eventLogs.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-white/78"
                    >
                      <p className="font-medium text-white/92">{event.title}</p>
                      <p className="mt-1 leading-6 text-white/56">{event.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] bg-[#171717] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">
                  普通预告 vs AI 互动预告
                </p>
                <h3 className="mt-3 text-[24px] font-semibold text-white">
                  同一段预告，生成不同情绪版本
                </h3>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 ring-1 ring-white/[0.05]">
                <p className="text-sm text-white/46">普通预告</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-white/66">
                  {COMPARISON_POINTS.map(([title, normal]) => (
                    <li key={title} className="rounded-2xl bg-black/18 px-4 py-3">
                      <p className="font-medium text-white/88">{title}</p>
                      <p className="mt-1">{normal}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(12,28,36,0.46),rgba(255,255,255,0.02))] p-5 ring-1 ring-[#1fd8ff]/12">
                <p className="text-sm text-[#7fe6ff]">AI 互动预告</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                  {COMPARISON_POINTS.map(([title, , ai]) => (
                    <li key={title} className="rounded-2xl bg-black/18 px-4 py-3">
                      <p className="font-medium text-white">{title}</p>
                      <p className="mt-1">{ai}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#171717] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">效果假设</p>
                <h3 className="mt-3 text-[24px] font-semibold text-white">AI 互动预告的试点预估</h3>
              </div>
              <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-white/44">
                试点预估
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {METRIC_ASSUMPTIONS.map(([title, value, detail]) => (
                <div key={title} className="rounded-[22px] bg-white/[0.04] p-4 ring-1 ring-white/[0.05]">
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-sm text-white/60">{title}</p>
                    <p className="text-[28px] font-semibold text-[#7fe6ff]">{value}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/62">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[28px] bg-[#171717] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05]">
            <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">落地场景</p>
            <h3 className="mt-3 text-[22px] font-semibold text-white">怎么放进真实业务里</h3>
            <div className="mt-5 space-y-3">
              {DEPLOYMENT_SCENARIOS.map((item, index) => (
                <div key={item} className="rounded-[22px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.05]">
                  <p className="text-[11px] tracking-[0.2em] text-white/38 uppercase">场景 {index + 1}</p>
                  <p className="mt-2 text-sm leading-7 text-white/66">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-[#171717] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05]">
            <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">可扩展性</p>
            <h3 className="mt-3 text-[22px] font-semibold text-white">不只适用于都市情感剧</h3>
            <p className="mt-3 text-sm leading-7 text-white/62">
              互动预告是平台级能力，不依赖单一剧种。只要存在悬念、角色选择或情绪张力，就可以复用。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {GENRE_EXPANSION.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/[0.05] px-4 py-2 text-sm text-white/70 ring-1 ring-white/[0.05]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-[#171717] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05]">
            <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">商业化与运营价值</p>
            <h3 className="mt-3 text-[22px] font-semibold text-white">放大会员与运营价值</h3>
            <div className="mt-5 space-y-3">
              {COMMERCIAL_VALUES_EXTENDED.map((item) => (
                <div key={item} className="rounded-[22px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.05]">
                  <p className="text-sm leading-7 text-white/66">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-sm tracking-[0.08em] text-white/45">
          本 Demo 演示：在长视频平台预告片结尾加入互动分支，以提升追剧期待感、讨论度与预约转化。
        </p>
      </div>
      <style jsx global>{`
        @keyframes choice-fade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes choice-pop {
          0% {
            opacity: 0;
            transform: translate(-50%, 18px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .choice-overlay {
          animation: choice-fade 0.24s ease-out;
        }

        .choice-card {
          animation: choice-pop 0.32s ease-out;
        }
      `}</style>
    </main>
  );
}
