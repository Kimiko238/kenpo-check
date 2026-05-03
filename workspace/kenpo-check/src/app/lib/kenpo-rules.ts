export type Sex = "male" | "female";
export type FiscalRule = "fy2025" | "fy2026plus";
export type MenuStatus = "eligible" | "conditional" | "ineligible";
export type ParityRule = "any" | "even" | "odd";
export type EligibilitySex = "all" | "female" | "male";
export type CustomEligibilityMode = "pattern" | "specificAges";

export type MenuResult = {
  id: string;
  title: string;
  description: string;
  status: MenuStatus;
  note?: string;
  price?: string;
};

export type CalculationResult = {
  fiscalYearLabel: string;
  ageAtFiscalYearEnd: number;
  ageOnExamDate: number;
  appliedRuleLabel?: string;
  ruleSummary?: string;
  assumptions: string[];
  menus: MenuResult[];
  warnings: string[];
};

type MenuConfig = {
  title: string;
  description: string;
  price?: string;
};

type AgeBand = {
  min: number;
  max: number;
};

type PatternRule = {
  eligibleAge: AgeBand;
  parity: ParityRule;
  sex: EligibilitySex;
};

export type CustomExamConfig = MenuConfig &
  PatternRule & {
    id: string;
    eligibilityMode?: CustomEligibilityMode;
    ages?: number[];
    note?: string;
  };

type Rule2025Config = {
  label: string;
  assumptions: string[];
  general: MenuConfig & { eligibleAge: AgeBand };
  added: MenuConfig & { ages: number[] };
  breast: MenuConfig & PatternRule;
  cervical: MenuConfig & PatternRule;
  cervicalStandalone: MenuConfig & PatternRule & { ages: number[] };
};

type Rule2026PlusConfig = {
  label: string;
  summary: string;
  assumptions: string[];
  youth: MenuConfig & { ages: number[] };
  general: MenuConfig & { eligibleAge: AgeBand };
  milestone: MenuConfig & { ages: number[] };
  breast: MenuConfig & PatternRule;
  boneDensity: MenuConfig & PatternRule;
  cervical: MenuConfig & PatternRule;
  cervicalStandalone: MenuConfig & PatternRule;
  customMenus: CustomExamConfig[];
};

export type RuleConfig = {
  fy2025: Rule2025Config;
  fy2026plus: Rule2026PlusConfig;
};

export const RULE_CONFIG_STORAGE_KEY = "kenpo-rule-config-v1";
export const RULE_CONFIG_EVENT_NAME = "kenpo-rule-config-change";

// 年齢ごとのルールを定義している
export const DEFAULT_RULE_CONFIG: RuleConfig = {
  fy2025: {
    label: "令和7年度",
    assumptions: [
      "この画面は協会けんぽの被保険者本人向けの健診を対象にしています。",
      "同じ年度内に受けられる補助は1回です。",
    ],
    general: {
      title: "一般健診",
      description:
        "血液検査、尿検査、胸部・胃部レントゲンなどを含む基本の健診です。",
      price: "自己負担額 5,282円",
      eligibleAge: { min: 35, max: 74 },
    },
    added: {
      title: "付加健診",
      description: "腹部超音波や眼底検査などを一般健診に追加する詳細健診です。",
      price: "自己負担額 2,689円",
      ages: [40, 45, 50, 55, 60, 65, 70],
    },
    breast: {
      title: "乳がん検診",
      description: "マンモグラフィを中心とした乳がん検診です。",
      eligibleAge: { min: 40, max: 74 },
      parity: "even",
      sex: "female",
    },
    cervical: {
      title: "子宮頸がん検診",
      description: "子宮頸部の細胞診による検診です。",
      eligibleAge: { min: 36, max: 74 },
      parity: "even",
      sex: "female",
    },
    cervicalStandalone: {
      title: "子宮頸がん検診（単独受診）",
      description: "一般健診を付けずに受けられる子宮頸がん検診です。",
      eligibleAge: { min: 20, max: 38 },
      parity: "even",
      sex: "female",
      ages: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38],
    },
  },
  fy2026plus: {
    label: "令和8年度以降の継続ルール",
    summary:
      "2025年度と2026年度の差分から、2026年度以降も続くと読めるパターンをローカル定義しています。",
    assumptions: [
      "この画面は協会けんぽの被保険者本人向けの健診を対象にしています。",
      "同じ年度内に受けられる補助は原則1回です。",
    ],
    youth: {
      title: "若年健診",
      description: "胃検査、便鮮血検査無しの一般検診です。",
      ages: [20, 25, 30],
    },
    general: {
      title: "生活習慣病予防健診",
      description:
        "35歳以上が対象です。",
      eligibleAge: { min: 35, max: 74 },
    },
    milestone: {
      title: "節目健診",
      description: "節目年齢の追加オプションです。",
      ages: [40, 45, 50, 55, 60, 65, 70],
    },
    breast: {
      title: "乳がん検診（マンモグラフィ）",
      description:
        "女性向けの追加検診です。マンモグラフィを用いる乳がん検診です。",
      eligibleAge: { min: 40, max: 74 },
      parity: "even",
      sex: "female",
    },
    boneDensity: {
      title: "骨密度検査",
      description: "女性向けの追加検査です。2026年度以降の骨密度検査です。",
      eligibleAge: { min: 40, max: 74 },
      parity: "even",
      sex: "female",
    },
    cervical: {
      title: "子宮頸がん検診",
      description: "女性向けの子宮頸がん検診です。",
      eligibleAge: { min: 36, max: 74 },
      parity: "even",
      sex: "female",
    },
    cervicalStandalone: {
      title: "子宮頸がん検診（単独）",
      description: "一般メニューを付けずに受ける単独の子宮頸がん検診です。",
      eligibleAge: { min: 20, max: 38 },
      parity: "even",
      sex: "female",
    },
    customMenus: [],
  },
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function calculateAge(at: Date, birthDate: Date) {
  let age = at.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    at.getMonth() > birthDate.getMonth() ||
    (at.getMonth() === birthDate.getMonth() &&
      at.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function calculateFiscalYearAge(at: Date, birthDate: Date) {
  const adjustedBirthDate = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate() - 1,
  );

  return calculateAge(at, adjustedBirthDate);
}

function isAgeInBand(age: number, band: AgeBand) {
  return age >= band.min && age <= band.max;
}

function matchesParity(age: number, parity: ParityRule) {
  if (parity === "any") return true;
  if (parity === "even") return age % 2 === 0;
  return age % 2 !== 0;
}

function matchesSex(targetSex: Sex, sexRule: EligibilitySex) {
  if (sexRule === "all") return true;
  return sexRule === targetSex;
}

function matchesPattern(
  age: number,
  sex: Sex,
  before75thBirthday: boolean,
  pattern: PatternRule,
) {
  return (
    before75thBirthday &&
    isAgeInBand(age, pattern.eligibleAge) &&
    matchesParity(age, pattern.parity) &&
    matchesSex(sex, pattern.sex)
  );
}

function matchesCustomExam(
  age: number,
  sex: Sex,
  before75thBirthday: boolean,
  exam: CustomExamConfig,
) {
  if (!before75thBirthday || !matchesSex(sex, exam.sex)) {
    return false;
  }

  if (exam.eligibilityMode === "specificAges") {
    return Array.isArray(exam.ages) && exam.ages.includes(age);
  }

  return matchesPattern(age, sex, before75thBirthday, exam);
}

function sexLabel(sex: EligibilitySex) {
  if (sex === "female") return "女性";
  if (sex === "male") return "男性";
  return "男女";
}

function parityLabel(parity: ParityRule) {
  if (parity === "even") return "偶数年齢";
  if (parity === "odd") return "奇数年齢";
  return "全年齢";
}

function buildPatternNote(pattern: PatternRule) {
  const ageText = `${pattern.eligibleAge.min}歳から${pattern.eligibleAge.max}歳`;
  const sexText = sexLabel(pattern.sex);

  if (pattern.parity === "any") {
    return `${ageText}の${sexText}が対象です。`;
  }

  return `${ageText}の${parityLabel(pattern.parity)}の${sexText}が対象です。`;
}

function appendSputumNote(note: string, age: number) {
  if (age < 50) {
    return note;
  }

  return `${note}50歳以上は喀痰検査も追加できます。`;
}

function getFiscalYearInfo(examDate: Date) {
  const startYear =
    examDate.getMonth() >= 3
      ? examDate.getFullYear()
      : examDate.getFullYear() - 1;
  const fiscalYearLabel = `令和${startYear - 2018}年度`;
  const fiscalYearStart = new Date(startYear, 3, 1);
  const fiscalYearEnd = new Date(startYear + 1, 2, 31);
  const nextFiscalYearStart = new Date(startYear + 1, 3, 1);
  const rule: FiscalRule | null =
    startYear === 2025 ? "fy2025" : startYear >= 2026 ? "fy2026plus" : null;

  return {
    fiscalYearLabel,
    fiscalYearStart,
    fiscalYearEnd,
    nextFiscalYearStart,
    rule,
  };
}

export function buildResults(
  examDateValue: string,
  birthDateValue: string,
  sex: Sex,
  config: RuleConfig = DEFAULT_RULE_CONFIG,
): CalculationResult | null {
  if (!examDateValue || !birthDateValue) {
    return null;
  }

  const examDate = parseDate(examDateValue);
  const birthDate = parseDate(birthDateValue);

  if (
    Number.isNaN(examDate.getTime()) ||
    Number.isNaN(birthDate.getTime()) ||
    birthDate > examDate
  ) {
    return null;
  }

  const {
    fiscalYearLabel,
    fiscalYearStart,
    fiscalYearEnd,
    nextFiscalYearStart,
    rule,
  } = getFiscalYearInfo(examDate);
  const ageAtFiscalYearEnd = calculateFiscalYearAge(fiscalYearEnd, birthDate);
  const ageOnExamDate = calculateAge(examDate, birthDate);
  const seventyFifthBirthday = new Date(
    birthDate.getFullYear() + 75,
    birthDate.getMonth(),
    birthDate.getDate(),
  );
  const before75thBirthday = examDate < seventyFifthBirthday;
  const warnings: string[] = [];
  const menus: MenuResult[] = [];

  if (!before75thBirthday) {
    warnings.push(
      "75歳の誕生日以降は、協会けんぽの被保険者向け健診の対象外です。",
    );
  }

  if (!rule) {
    warnings.push(
      "この年度の判定ルールはまだ登録していません。現在は令和7年度と令和8年度以降の推定ルールに対応しています。",
    );
  }

  if (examDate < fiscalYearStart) {
    warnings.push(
      `${formatDate(examDate)}は${fiscalYearLabel}（${formatDate(fiscalYearStart)}から${formatDate(
        fiscalYearEnd,
      )}）として判定します。次年度の判定に切り替わるのは${formatDate(nextFiscalYearStart)}です。`,
    );
  }

  const definition = rule ? config[rule] : null;
  if (definition) {
    if (rule === "fy2026plus" && fiscalYearLabel !== "令和8年度") {
      warnings.push(
        `${fiscalYearLabel}は、令和8年度で見えた偶数年齢・節目年齢の反復パターンを使って推定しています。`,
      );
    }
  }

  if (rule === "fy2025") {
    const ruleConfig = config.fy2025;
    const generalEligible =
      before75thBirthday &&
      isAgeInBand(ageAtFiscalYearEnd, ruleConfig.general.eligibleAge);
    const addedEligible =
      before75thBirthday && ruleConfig.added.ages.includes(ageAtFiscalYearEnd);
    const breastEligible = matchesPattern(
      ageAtFiscalYearEnd,
      sex,
      before75thBirthday,
      ruleConfig.breast,
    );
    const cervicalEligible = matchesPattern(
      ageAtFiscalYearEnd,
      sex,
      before75thBirthday,
      ruleConfig.cervical,
    );
    const standaloneCervicalEligible =
      matchesPattern(
        ageAtFiscalYearEnd,
        sex,
        before75thBirthday,
        ruleConfig.cervicalStandalone,
      ) && ruleConfig.cervicalStandalone.ages.includes(ageAtFiscalYearEnd);

    menus.push({
      id: "general",
      title: ruleConfig.general.title,
      description: ruleConfig.general.description,
      price: ruleConfig.general.price,
      status: generalEligible ? "eligible" : "ineligible",
      note: appendSputumNote(
        `${ruleConfig.general.eligibleAge.min}歳から${ruleConfig.general.eligibleAge.max}歳までが対象です。`,
        ageAtFiscalYearEnd,
      ),
    });
    menus.push({
      id: "added",
      title: ruleConfig.added.title,
      description: ruleConfig.added.description,
      price: ruleConfig.added.price,
      status: addedEligible ? "eligible" : "ineligible",
      note: `${ruleConfig.added.ages.join("・")}歳で、一般健診を受ける場合に追加できます。`,
    });
    menus.push({
      id: "breast",
      title: ruleConfig.breast.title,
      description: ruleConfig.breast.description,
      price: ruleConfig.breast.price,
      status: breastEligible ? "eligible" : "ineligible",
    });
    menus.push({
      id: "cervical",
      title: ruleConfig.cervical.title,
      description: ruleConfig.cervical.description,
      price: ruleConfig.cervical.price,
      status: cervicalEligible ? "eligible" : "ineligible",
    });
    menus.push({
      id: "cervical-standalone",
      title: ruleConfig.cervicalStandalone.title,
      description: ruleConfig.cervicalStandalone.description,
      price: ruleConfig.cervicalStandalone.price,
      status: standaloneCervicalEligible ? "eligible" : "ineligible",
    });
  }

  if (rule === "fy2026plus") {
    const ruleConfig = config.fy2026plus;
    const youthEligible =
      before75thBirthday && ruleConfig.youth.ages.includes(ageAtFiscalYearEnd);
    const generalEligible =
      before75thBirthday &&
      isAgeInBand(ageAtFiscalYearEnd, ruleConfig.general.eligibleAge);
    const milestoneEligible =
      before75thBirthday &&
      ruleConfig.milestone.ages.includes(ageAtFiscalYearEnd);
    const breastEligible = matchesPattern(
      ageAtFiscalYearEnd,
      sex,
      before75thBirthday,
      ruleConfig.breast,
    );
    const boneDensityEligible = matchesPattern(
      ageAtFiscalYearEnd,
      sex,
      before75thBirthday,
      ruleConfig.boneDensity,
    );
    const cervicalEligible = matchesPattern(
      ageAtFiscalYearEnd,
      sex,
      before75thBirthday,
      ruleConfig.cervical,
    );
    const standaloneCervicalEligible = matchesPattern(
      ageAtFiscalYearEnd,
      sex,
      before75thBirthday,
      ruleConfig.cervicalStandalone,
    );
    const isGeneralAge35To39 =
      ageAtFiscalYearEnd >= 35 && ageAtFiscalYearEnd < 40;

    menus.push({
      id: "youth",
      title: ruleConfig.youth.title,
      description: ruleConfig.youth.description,
      status: youthEligible ? "eligible" : "ineligible",
      note: `${ruleConfig.youth.ages.join("・")}歳が対象です。`,
    });
    menus.push({
      id: "general",
      title: ruleConfig.general.title,
      description: ruleConfig.general.description,
      status: generalEligible ? "eligible" : "ineligible",
      note: appendSputumNote(
        isGeneralAge35To39
          ? `胃部レントゲン検査と便潜血反応検査はキャンセルできます。`
          : `胃部レントゲン検査と便潜血反応検査は必須です`,
        ageAtFiscalYearEnd,
      ),
    });
    menus.push({
      id: "milestone",
      title: ruleConfig.milestone.title,
      description: ruleConfig.milestone.description,
      status: milestoneEligible ? "eligible" : "ineligible",
      note: `${ruleConfig.milestone.ages.join("・")}歳が対象です。`,
    });
    menus.push({
      id: "breast",
      title: ruleConfig.breast.title,
      description: ruleConfig.breast.description,
      status: breastEligible ? "eligible" : "ineligible",
    });
    menus.push({
      id: "bone-density",
      title: ruleConfig.boneDensity.title,
      description: ruleConfig.boneDensity.description,
      status: boneDensityEligible ? "eligible" : "ineligible",
    });
    menus.push({
      id: "cervical",
      title: ruleConfig.cervical.title,
      description: ruleConfig.cervical.description,
      status: cervicalEligible ? "eligible" : "ineligible",
    });
    menus.push({
      id: "cervical-standalone",
      title: ruleConfig.cervicalStandalone.title,
      description: ruleConfig.cervicalStandalone.description,
      status: standaloneCervicalEligible ? "eligible" : "ineligible",
    });

    for (const customMenu of ruleConfig.customMenus) {
      const customEligible = matchesCustomExam(
        ageAtFiscalYearEnd,
        sex,
        before75thBirthday,
        customMenu,
      );
      menus.push({
        id: customMenu.id,
        title: customMenu.title,
        description: customMenu.description,
        price: customMenu.price,
        status: customEligible ? "eligible" : "ineligible",
      });
    }
  }

  return {
    fiscalYearLabel,
    ageAtFiscalYearEnd,
    ageOnExamDate,
    appliedRuleLabel: definition?.label,
    assumptions: definition?.assumptions ?? [],
    menus,
    warnings,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number")
  );
}

function isMenuConfig(value: unknown): value is MenuConfig {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    (value.price === undefined || typeof value.price === "string")
  );
}

function isAgeBand(value: unknown): value is AgeBand {
  return (
    isObject(value) &&
    typeof value.min === "number" &&
    typeof value.max === "number"
  );
}

function isParityRule(value: unknown): value is ParityRule {
  return value === "any" || value === "even" || value === "odd";
}

function isEligibilitySex(value: unknown): value is EligibilitySex {
  return value === "all" || value === "female" || value === "male";
}

function isPatternRule(value: unknown): value is PatternRule {
  return (
    isObject(value) &&
    isAgeBand(value.eligibleAge) &&
    isParityRule(value.parity) &&
    isEligibilitySex(value.sex)
  );
}

function isMenuConfigWithAgeBand(
  value: unknown,
): value is MenuConfig & { eligibleAge: AgeBand } {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    (value.price === undefined || typeof value.price === "string") &&
    isAgeBand(value.eligibleAge)
  );
}

function isMenuConfigWithAges(
  value: unknown,
): value is MenuConfig & { ages: number[] } {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    (value.price === undefined || typeof value.price === "string") &&
    isNumberArray(value.ages)
  );
}

function isPatternMenuConfig(
  value: unknown,
): value is MenuConfig & PatternRule {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    (value.price === undefined || typeof value.price === "string") &&
    isAgeBand(value.eligibleAge) &&
    isParityRule(value.parity) &&
    isEligibilitySex(value.sex)
  );
}

function isPatternMenuConfigWithAges(
  value: unknown,
): value is MenuConfig & PatternRule & { ages: number[] } {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    (value.price === undefined || typeof value.price === "string") &&
    isAgeBand(value.eligibleAge) &&
    isParityRule(value.parity) &&
    isEligibilitySex(value.sex) &&
    isNumberArray(value.ages)
  );
}

function isCustomExamConfig(value: unknown): value is CustomExamConfig {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    isMenuConfig(value) &&
    isPatternRule(value) &&
    (!("eligibilityMode" in value) ||
      value.eligibilityMode === undefined ||
      value.eligibilityMode === "pattern" ||
      value.eligibilityMode === "specificAges") &&
    (!("ages" in value) ||
      value.ages === undefined ||
      isNumberArray(value.ages)) &&
    (!("note" in value) ||
      value.note === undefined ||
      typeof value.note === "string")
  );
}

function isRule2025Config(value: unknown): value is Rule2025Config {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.label === "string" &&
    isStringArray(value.assumptions) &&
    isMenuConfigWithAgeBand(value.general) &&
    isMenuConfigWithAges(value.added) &&
    isPatternMenuConfig(value.breast) &&
    isPatternMenuConfig(value.cervical) &&
    isPatternMenuConfigWithAges(value.cervicalStandalone)
  );
}

function isRule2026PlusConfig(value: unknown): value is Rule2026PlusConfig {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.label === "string" &&
    typeof value.summary === "string" &&
    isStringArray(value.assumptions) &&
    isMenuConfigWithAges(value.youth) &&
    isMenuConfigWithAgeBand(value.general) &&
    isMenuConfigWithAges(value.milestone) &&
    isPatternMenuConfig(value.breast) &&
    isPatternMenuConfig(value.boneDensity) &&
    isPatternMenuConfig(value.cervical) &&
    isPatternMenuConfig(value.cervicalStandalone) &&
    Array.isArray(value.customMenus) &&
    value.customMenus.every((item) => isCustomExamConfig(item))
  );
}

export function isRuleConfig(value: unknown): value is RuleConfig {
  return (
    isObject(value) &&
    isRule2025Config(value.fy2025) &&
    isRule2026PlusConfig(value.fy2026plus)
  );
}

export function parseRuleConfigJson(value: string): RuleConfig {
  const parsed = JSON.parse(value) as unknown;
  const normalized = normalizeRuleConfig(parsed);
  if (!isRuleConfig(normalized)) {
    throw new Error("設定 JSON の形式が正しくありません。");
  }
  return normalized;
}

function normalizeRuleConfig(value: unknown): unknown {
  if (!isObject(value) || !isObject(value.fy2026plus)) {
    return value;
  }

  const nextValue = structuredClone(value);

  if (
    isObject(nextValue.fy2026plus) &&
    isPatternMenuConfig(nextValue.fy2026plus.breastBone) &&
    !("breast" in nextValue.fy2026plus) &&
    !("boneDensity" in nextValue.fy2026plus)
  ) {
    nextValue.fy2026plus.breast = {
      ...nextValue.fy2026plus.breastBone,
      title: "乳がん検診（マンモグラフィ）",
      description:
        "女性向けの追加検診です。マンモグラフィを用いる乳がん検診です。",
    };
    nextValue.fy2026plus.boneDensity = {
      ...nextValue.fy2026plus.breastBone,
      title: "骨密度検査",
      description: "女性向けの追加検査です。2026年度以降に追加されました。",
    };
    delete nextValue.fy2026plus.breastBone;
  }

  return nextValue;
}
