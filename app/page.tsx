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

type RecompositionDetail = {
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
const PLATFORM_VALUES = [
  ["预告完播率", "把最容易流失的片尾 10 秒留下来"],
  ["互动率", "把观看动作转成选择动作"],
  ["预约转化", "在悬念点直接触发追更意愿"],
  ["推荐精度", "沉淀情绪选择数据，反哺推荐"],
];
const PREVIEW_RECOMPOSITION: Record<UserChoice, RecompositionDetail> = {
  A: {
    scene: "夜雨楼下、电梯厅、即将见面的停顿",
    dialogue: "“你终于还是来了。”",
    music: "低频脉冲与更强烈的节奏推进",
    rhythm: "切镜更快，冲突感更近，情绪持续上扬",
    roleTitle: "当前更接近主角式推进",
    roleDescription: "愿意先往前一步，用行动把关系推向答案。",
    keywords: ["主动", "冲突", "推进"],
    aiSummary: "AI 会把内容收向冲突、心动和见面后的不确定。",
  },
  B: {
    scene: "空旷走廊、夜色街角、手机熄屏后的留白",
    dialogue: "“不是所有答案，都要今晚说清。”",
    music: "钢琴留白与更安静的环境氛围",
    rhythm: "停顿更长，镜头更稳，情绪收得更内敛",
    roleTitle: "当前更接近理性角色路径",
    roleDescription: "先守住边界，再决定关系要不要继续靠近。",
    keywords: ["克制", "留白", "反思"],
    aiSummary: "AI 会把内容收向克制、留白和更安静的情绪版本。",
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
    badge: "更靠近答案的版本",
    title: "让她去见他",
    description: "她终于愿意下楼，把迟来的那句话留给见面。",
    lines: ["她走向电梯。", "电梯门在她面前打开。", "有些答案，只有见面才知道。"],
  },
  B: {
    badge: "更靠近自我的版本",
    title: "让她不去",
    description: "她没有把情绪交出去，而是先把自己留在这一夜里。",
    lines: ["她把手机屏幕按灭。", "她没有回头，转身走进夜色。", "有些成长，是不再回头。"],
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

const LINE_DURATION = 1500;
const FADE_DURATION = 220;
const GENERATE_DURATION = 1400;
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
    ? "她明白，有些决定不是拒绝谁，而是先把自己安放好。"
    : "她知道，真正难的不是见面，而是承认自己仍然在意。";
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
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reserveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const versionLabel = getGeneratedVersionLabel(generatedVersion);
  const versionTitle = getGeneratedVersionTitle(generatedVersion);
  const memoryPrompt = getMemoryPrompt(lastChoiceMemory);
  const currentTime = formatTime(Math.round((progress / 100) * TOTAL_FAKE_SECONDS));
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

        <section className="mb-5 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(17,26,32,0.96),rgba(21,21,21,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/[0.05]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">产品命题</p>
              <h2 className="mt-3 text-[26px] font-semibold leading-tight text-white md:text-[34px]">
                {PRODUCT_THESIS}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-white/74">
              {["互动预告", "个性化生成", "片尾转化", "AI 情绪理解"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/[0.08]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className="min-w-0">
            <div
              className="overflow-hidden rounded-[28px] bg-[#0f0f0f] shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_40%,rgba(239,215,158,0.28),transparent_28%),radial-gradient(circle_at_62%_34%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_80%_72%,rgba(130,90,60,0.34),transparent_25%)]" />
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
                  <div className="absolute right-7 top-20 rounded-[20px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,19,26,0.86),rgba(9,19,26,0.7))] px-4 py-3 text-left shadow-[0_16px_42px_rgba(0,0,0,0.22)] backdrop-blur-md">
                    <p className="text-[10px] tracking-[0.26em] text-white/45 uppercase">AI 定制版</p>
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
                    <div className="w-full max-w-xl rounded-[28px] border border-[#1fd7ff]/16 bg-[#11161a]/94 px-8 py-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                      <div className="mx-auto h-12 w-12 rounded-full border-2 border-[#1fd7ff]/18 border-t-[#1fd7ff] animate-spin" />
                      <p className="mt-6 text-xs tracking-[0.32em] text-[#77e8ff] uppercase">AI 生成中</p>
                      <h3 className="mt-3 text-[28px] font-semibold">{versionLabel}</h3>
                      <p className="mt-4 text-sm leading-7 text-white/66">
                        {emotion === "rational"
                          ? "正在把这一版预告收向更安静的情绪，让她先照顾好自己。"
                          : "正在把这一版预告推向更直接的心意，让迟到的答案更靠近她。"}
                      </p>
                    </div>
                  </div>
                )}

                {personalization && phase !== "intro" && phase !== "choice" && !isGenerating && (
                  <div className="absolute right-7 top-36 w-[300px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,19,0.84),rgba(15,15,15,0.68))] p-4 shadow-[0_20px_52px_rgba(0,0,0,0.28)] backdrop-blur-lg">
                    <p className="text-[11px] tracking-[0.26em] text-[#7fe6ff] uppercase">
                      角色路径反馈
                    </p>
                    <h4 className="mt-2 text-[20px] font-semibold text-white">
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
                            className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-white/72"
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
                    <div className="rounded-full border border-white/10 bg-black/42 px-5 py-2 text-sm tracking-[0.24em] text-white/64 uppercase">
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

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[22px] font-semibold">用户评价</h3>
                <div className="flex items-center gap-3 text-white/42">
                  <button type="button" className="text-3xl transition-colors duration-300 hover:text-white/82">‹</button>
                  <span className="text-[36px] font-light leading-none">4</span>
                  <button type="button" className="text-3xl transition-colors duration-300 hover:text-white/82">›</button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {REVIEWS.map(([name, text]) => (
                  <div key={name} className="rounded-[24px] border border-white/8 bg-[#1a1a1a] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1fd8ff,#0eabff)] text-sm font-semibold text-[#032028]">
                        {name.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-sm text-[#ff9731]">★★★★★ 强烈推荐</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/68">{text}</p>
                  </div>
                ))}
              </div>
            </div>
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

              <p className="mt-4 text-sm leading-7 text-white/60">
                腾讯视频热播都市情感剧。把爱情、关系与自我成长放进同一条人生轨迹里。
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/58">
                {STORY_TAGS.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="rounded-full bg-white/8 px-4 py-2 text-[15px] font-semibold">8.9分</div>
                <div className="rounded-full bg-white/8 px-4 py-2 text-[15px] font-semibold">10894</div>
                <div className="rounded-full bg-[#1b3940] px-4 py-2 text-[15px] font-semibold text-[#7de8ff]">腾讯视频独播</div>
              </div>

              <div className="mt-6 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)] ring-1 ring-white/[0.05]">
                <div className="mx-auto max-w-[248px]">
                  <div className="mb-3 flex items-center justify-between text-[11px] tracking-[0.2em] text-white/42 uppercase">
                    <span>官方海报</span>
                    <span>Rose Story</span>
                  </div>
                  <div className="relative overflow-hidden rounded-[24px] shadow-[0_26px_60px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.07]">
                    <div className="pointer-events-none absolute inset-0 z-10 rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
                    <img
                      src="/rose-poster.jpg"
                      alt="玫瑰的故事海报"
                      className="aspect-[3/4.35] w-full object-cover object-center"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),transparent_28%,transparent_62%,rgba(0,0,0,0.42))]" />
                    <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                      <div className="rounded-2xl bg-black/42 px-3 py-3 backdrop-blur-sm">
                        <p className="text-[10px] tracking-[0.22em] text-white/58 uppercase">剧集封面</p>
                        <p className="mt-1 text-sm font-medium leading-6 text-white">
                          从此世界在我面前，指向我想去的任何地方
                        </p>
                      </div>
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
                <div className="rounded-[20px] border border-white/8 bg-black/18 p-4">
                  <p className="text-sm text-white/46">这一版的走向</p>
                  <p className="mt-2 text-[24px] font-semibold text-white">
                    {emotion === "rational"
                      ? "把自己放在前面"
                      : emotion === "emotional"
                        ? "朝答案再走一步"
                        : "还未展开"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/8 bg-black/18 p-4">
                  <p className="text-sm text-white/46">情绪节奏</p>
                  <p className="mt-2 text-[24px] font-semibold text-white">
                    {rational === null ? "还未生成" : rational ? "克制、留白、慢下来" : "靠近、犹豫、再向前"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-[#1fd7ff]/12 bg-[#081118]/58 p-4">
                  <p className="text-sm text-[#7fe6ff]">当前预告版本</p>
                <p className="mt-2 text-[22px] font-semibold text-white">{versionLabel}</p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  {sceneMeta
                    ? sceneMeta.description
                    : "预告将在结尾悬念点暂停，弹出双选项，用户选择后播放对应的彩蛋式剧情。"}
                </p>
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

        <section className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,rgba(17,23,28,0.96),rgba(18,18,18,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] tracking-[0.3em] text-[#7de8ff] uppercase">平台价值</p>
              <h3 className="mt-3 text-[24px] font-semibold text-white">把片尾预告变成转化入口</h3>
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
        </section>

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
