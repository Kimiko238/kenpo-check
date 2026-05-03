"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type CustomExamConfig,
  type EligibilitySex,
  type ParityRule,
  type RuleConfig,
} from "../lib/kenpo-rules";
import { IS_STATIC_MODE } from "../lib/static-mode";
import { useSharedRuleConfig } from "./use-shared-rule-config";

function cloneConfig(config: RuleConfig): RuleConfig {
  return JSON.parse(JSON.stringify(config)) as RuleConfig;
}

function agesToText(ages: number[]) {
  return ages.join(", ");
}

function textToAges(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

function buildAgesByParity(min: number, max: number, parity: ParityRule) {
  const ages: number[] = [];
  for (let age = min; age <= max; age += 1) {
    if (
      parity === "any" ||
      (parity === "even" && age % 2 === 0) ||
      (parity === "odd" && age % 2 !== 0)
    ) {
      ages.push(age);
    }
  }
  return ages;
}

function parityLabel(parity: ParityRule) {
  if (parity === "even") return "偶数年齢";
  if (parity === "odd") return "奇数年齢";
  return "制限なし";
}

function sexLabel(sex: EligibilitySex) {
  if (sex === "female") return "女性";
  if (sex === "male") return "男性";
  return "男女";
}

function customEligibilityLabel(mode?: CustomExamConfig["eligibilityMode"]) {
  return mode === "specificAges" ? "特定年齢" : "年齢帯";
}

const cardClassName =
  "rounded-[1.85rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.96))] p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]";

const fieldClassName =
  "mt-2 w-full rounded-[1.2rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-700 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus:border-sky-200 focus:ring-4 focus:ring-sky-100/80";

const subtleButtonClassName =
  "rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-[0_8px_22px_rgba(148,163,184,0.08)] transition hover:border-sky-200 hover:bg-sky-50/70";

const dangerButtonClassName =
  "rounded-full border border-rose-100 bg-[linear-gradient(135deg,rgba(255,241,244,0.96),rgba(255,248,250,0.96))] px-3 py-2 text-xs font-semibold text-rose-700 shadow-[0_8px_22px_rgba(251,113,133,0.08)] transition hover:border-rose-200 hover:bg-[linear-gradient(135deg,rgba(255,236,241,0.98),rgba(255,245,248,0.98))]";

const noticeClassName =
  "mt-4 rounded-[1.35rem] border px-4 py-3 text-sm leading-7 shadow-[0_10px_28px_rgba(148,163,184,0.08)]";

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberInput({ label, value, onChange }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input
        type="number"
        className={fieldClassName}
        value={inputValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          setInputValue(nextValue);

          if (nextValue === "") {
            return;
          }

          const parsedValue = Number(nextValue);
          if (Number.isFinite(parsedValue)) {
            onChange(parsedValue);
          }
        }}
      />
    </label>
  );
}

type SelectInputProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectInputProps<T>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select
        className={fieldClassName}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type RangeEditorProps = {
  title: string;
  description: string;
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

function RangeEditor({
  title,
  description,
  min,
  max,
  onMinChange,
  onMaxChange,
}: RangeEditorProps) {
  return (
    <section className={cardClassName}>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberInput label="開始年齢" value={min} onChange={onMinChange} />
        <NumberInput label="終了年齢" value={max} onChange={onMaxChange} />
      </div>
    </section>
  );
}

type PatternEditorProps = {
  title: string;
  description: string;
  min: number;
  max: number;
  parity: ParityRule;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onParityChange: (value: ParityRule) => void;
};

function PatternEditor({
  title,
  description,
  min,
  max,
  parity,
  onMinChange,
  onMaxChange,
  onParityChange,
}: PatternEditorProps) {
  return (
    <section className={cardClassName}>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberInput label="開始年齢" value={min} onChange={onMinChange} />
        <NumberInput label="終了年齢" value={max} onChange={onMaxChange} />
        <SelectInput
          label="年齢の規則"
          value={parity}
          options={[
            { value: "even", label: "偶数年齢" },
            { value: "odd", label: "奇数年齢" },
            { value: "any", label: "制限なし" },
          ]}
          onChange={onParityChange}
        />
      </div>
    </section>
  );
}

type AgeListEditorProps = {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
};

function AgeListEditor({
  title,
  description,
  value,
  onChange,
}: AgeListEditorProps) {
  return (
    <label className={`block ${cardClassName}`}>
      <span className="text-lg font-semibold text-slate-900">{title}</span>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <input
        className={fieldClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="例: 40, 45, 50, 55, 60, 65, 70"
      />
    </label>
  );
}

type AssumptionsEditorProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

function AssumptionsEditor({ values, onChange }: AssumptionsEditorProps) {
  return (
    <section className={`${cardClassName} lg:col-span-2`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">注意文</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            判定画面の「前提」に出す文言です。
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className={subtleButtonClassName}
        >
          行を追加
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {values.map((value, index) => (
          <div key={index} className="flex gap-3">
            <textarea
              className="min-h-20 flex-1 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-sky-200 focus:ring-4 focus:ring-sky-100/80"
              value={value}
              onChange={(event) =>
                onChange(
                  values.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                )
              }
            />
            <button
              type="button"
              onClick={() =>
                onChange(values.filter((_, itemIndex) => itemIndex !== index))
              }
              className={`self-start ${dangerButtonClassName}`}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

type CustomExamEditorProps = {
  exams: CustomExamConfig[];
  onChange: (exams: CustomExamConfig[]) => void;
};

function CustomExamEditor({ exams, onChange }: CustomExamEditorProps) {
  return (
    <section className={`${cardClassName} lg:col-span-2`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            新規登録する検査
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            新たに補助対象になった検査をここから追加できます。
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...exams,
              {
                id: `custom-${crypto.randomUUID()}`,
                title: "新しい検査",
                description: "",
                eligibilityMode: "pattern",
                eligibleAge: { min: 40, max: 74 },
                parity: "any",
                sex: "all",
                ages: [40],
                note: "",
              },
            ])
          }
          className={subtleButtonClassName}
        >
          検査を追加
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {exams.length === 0 && (
          <p className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-sm leading-7 text-slate-600">
            追加検査はまだ登録されていません。
          </p>
        )}
        {exams.map((exam, index) => (
          <div
            key={exam.id}
            className="rounded-[1.7rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(250,251,255,0.98),rgba(245,248,252,0.96))] p-4 shadow-[0_12px_30px_rgba(148,163,184,0.1)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">
                追加検査 {index + 1}
              </h3>
              <button
                type="button"
                onClick={() =>
                  onChange(exams.filter((item) => item.id !== exam.id))
                }
                className={dangerButtonClassName}
              >
                削除
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">
                  表示名
                </span>
                <input
                  className={fieldClassName}
                  value={exam.title}
                  onChange={(event) =>
                    onChange(
                      exams.map((item) =>
                        item.id === exam.id
                          ? { ...item, title: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">
                  料金表示
                </span>
                <input
                  className={fieldClassName}
                  value={exam.price ?? ""}
                  onChange={(event) =>
                    onChange(
                      exams.map((item) =>
                        item.id === exam.id
                          ? { ...item, price: event.target.value || undefined }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">
                  説明文
                </span>
                <textarea
                  className={`${fieldClassName} leading-7`}
                  rows={3}
                  value={exam.description}
                  onChange={(event) =>
                    onChange(
                      exams.map((item) =>
                        item.id === exam.id
                          ? { ...item, description: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <SelectInput
                label="判定方法"
                value={exam.eligibilityMode ?? "pattern"}
                options={[
                  { value: "pattern", label: "年齢帯で判定" },
                  { value: "specificAges", label: "特定年齢で判定" },
                ]}
                onChange={(value) =>
                  onChange(
                    exams.map((item) =>
                      item.id === exam.id
                        ? {
                            ...item,
                            eligibilityMode: value,
                            ages:
                              value === "specificAges"
                                ? item.ages?.length
                                  ? item.ages
                                  : [item.eligibleAge.min]
                                : item.ages,
                          }
                        : item,
                    ),
                  )
                }
              />
              <SelectInput
                label="性別"
                value={exam.sex}
                options={[
                  { value: "female", label: "女性" },
                  { value: "male", label: "男性" },
                  { value: "all", label: "男女" },
                ]}
                onChange={(value) =>
                  onChange(
                    exams.map((item) =>
                      item.id === exam.id ? { ...item, sex: value } : item,
                    ),
                  )
                }
              />
              {(exam.eligibilityMode ?? "pattern") === "specificAges" ? (
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-slate-600">
                    対象年齢
                  </span>
                  <input
                    className={fieldClassName}
                    value={agesToText(exam.ages ?? [])}
                    onChange={(event) =>
                      onChange(
                        exams.map((item) =>
                          item.id === exam.id
                            ? { ...item, ages: textToAges(event.target.value) }
                            : item,
                        ),
                      )
                    }
                    placeholder="例: 40, 45, 50"
                  />
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    付加健診のように、対象になる年齢だけを個別指定できます。
                  </p>
                </label>
              ) : (
                <>
                  <NumberInput
                    label="開始年齢"
                    value={exam.eligibleAge.min}
                    onChange={(value) =>
                      onChange(
                        exams.map((item) =>
                          item.id === exam.id
                            ? {
                                ...item,
                                eligibleAge: {
                                  ...item.eligibleAge,
                                  min: value,
                                },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <NumberInput
                    label="終了年齢"
                    value={exam.eligibleAge.max}
                    onChange={(value) =>
                      onChange(
                        exams.map((item) =>
                          item.id === exam.id
                            ? {
                                ...item,
                                eligibleAge: {
                                  ...item.eligibleAge,
                                  max: value,
                                },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <SelectInput
                    label="年齢の規則"
                    value={exam.parity}
                    options={[
                      { value: "even", label: "偶数年齢" },
                      { value: "odd", label: "奇数年齢" },
                      { value: "any", label: "制限なし" },
                    ]}
                    onChange={(value) =>
                      onChange(
                        exams.map((item) =>
                          item.id === exam.id
                            ? { ...item, parity: value }
                            : item,
                        ),
                      )
                    }
                  />
                </>
              )}
              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">
                  判定メモ
                </span>
                <textarea
                  className={`${fieldClassName} leading-7`}
                  rows={2}
                  value={exam.note ?? ""}
                  onChange={(event) =>
                    onChange(
                      exams.map((item) =>
                        item.id === exam.id
                          ? { ...item, note: event.target.value || undefined }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type RuleSummaryViewProps = {
  config: RuleConfig;
};

function RuleSummaryView({ config }: RuleSummaryViewProps) {
  const rows = [
    {
      key: "youth",
      name: config.fy2026plus.youth.title,
      age: `${agesToText(config.fy2026plus.youth.ages)}歳`,
      parity: "-",
      sex: "男女",
      extra: config.fy2026plus.youth.description,
    },
    {
      key: "general",
      name: config.fy2026plus.general.title,
      age: `${config.fy2026plus.general.eligibleAge.min}-${config.fy2026plus.general.eligibleAge.max}歳`,
      parity: "制限なし",
      sex: "男女",
      extra: config.fy2026plus.general.description,
    },
    {
      key: "milestone",
      name: "節目健診",
      age: agesToText(config.fy2026plus.milestone.ages),
      parity: "-",
      sex: "男女",
      extra: config.fy2026plus.milestone.description,
    },
    {
      key: "breast",
      name: config.fy2026plus.breast.title,
      age: `${config.fy2026plus.breast.eligibleAge.min}-${config.fy2026plus.breast.eligibleAge.max}歳`,
      parity: parityLabel(config.fy2026plus.breast.parity),
      sex: sexLabel(config.fy2026plus.breast.sex),
      extra: config.fy2026plus.breast.description,
    },
    {
      key: "bone-density",
      name: config.fy2026plus.boneDensity.title,
      age: `${config.fy2026plus.boneDensity.eligibleAge.min}-${config.fy2026plus.boneDensity.eligibleAge.max}歳`,
      parity: parityLabel(config.fy2026plus.boneDensity.parity),
      sex: sexLabel(config.fy2026plus.boneDensity.sex),
      extra: config.fy2026plus.boneDensity.description,
    },
    {
      key: "cervical",
      name: config.fy2026plus.cervical.title,
      age: `${config.fy2026plus.cervical.eligibleAge.min}-${config.fy2026plus.cervical.eligibleAge.max}歳`,
      parity: parityLabel(config.fy2026plus.cervical.parity),
      sex: sexLabel(config.fy2026plus.cervical.sex),
      extra: config.fy2026plus.cervical.description,
    },
    {
      key: "cervical-standalone",
      name: config.fy2026plus.cervicalStandalone.title,
      age: `${config.fy2026plus.cervicalStandalone.eligibleAge.min}-${config.fy2026plus.cervicalStandalone.eligibleAge.max}歳`,
      parity: parityLabel(config.fy2026plus.cervicalStandalone.parity),
      sex: sexLabel(config.fy2026plus.cervicalStandalone.sex),
      extra: config.fy2026plus.cervicalStandalone.description,
    },
    ...config.fy2026plus.customMenus.map((menu) => ({
      key: menu.id,
      name: menu.title,
      age:
        menu.eligibilityMode === "specificAges" && menu.ages?.length
          ? `${agesToText(menu.ages)}歳`
          : `${menu.eligibleAge.min}-${menu.eligibleAge.max}歳`,
      parity:
        menu.eligibilityMode === "specificAges"
          ? "-"
          : parityLabel(menu.parity),
      sex: sexLabel(menu.sex),
      extra: menu.note || menu.description || `追加検査 / ${customEligibilityLabel(menu.eligibilityMode)}`,
    })),
  ];

  return (
    <section className={`${cardClassName} lg:col-span-2`}>
      <h2 className="text-lg font-semibold text-slate-900">現在の登録内容</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        いま保存対象になっている規則性を一覧で確認できます。
      </p>
      <div className="mt-4 grid gap-3 sm:hidden">
        {rows.map((row) => (
          <article
            key={`${row.key}-card`}
            className="rounded-[1.25rem] border border-slate-200/80 bg-white/86 p-4 shadow-[0_10px_28px_rgba(148,163,184,0.08)]"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {row.name}
            </h3>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-slate-500">年齢</dt>
                <dd className="font-medium text-slate-800">{row.age}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-slate-500">規則</dt>
                <dd className="font-medium text-slate-800">{row.parity}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-slate-500">性別</dt>
                <dd className="font-medium text-slate-800">{row.sex}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-slate-500">備考</dt>
                <dd className="font-medium leading-6 text-slate-800">
                  {row.extra}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="min-w-full text-sm text-slate-700">
          <thead>
            <tr className="border-b border-slate-200/80 text-left text-slate-500">
              <th className="px-3 py-2 font-medium">検査</th>
              <th className="px-3 py-2 font-medium">年齢</th>
              <th className="px-3 py-2 font-medium">規則</th>
              <th className="px-3 py-2 font-medium">性別</th>
              <th className="px-3 py-2 font-medium">備考</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-slate-100/80"
              >
                <td className="px-3 py-3">{row.name}</td>
                <td className="px-3 py-3">{row.age}</td>
                <td className="px-3 py-3">{row.parity}</td>
                <td className="px-3 py-3">{row.sex}</td>
                <td className="px-3 py-3">{row.extra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function MasterEditor() {
  const {
    ruleConfig,
    loading,
    error: sharedError,
    saveRuleConfig,
    resetRuleConfig,
  } = useSharedRuleConfig();
  const [draftConfig, setDraftConfig] = useState<RuleConfig | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const config = draftConfig ?? ruleConfig;
  const hasUnsavedChanges = draftConfig !== null;
  const jsonPreview = useMemo(() => JSON.stringify(config, null, 2), [config]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function updateConfig(updater: (draft: RuleConfig) => void) {
    setDraftConfig((current) => {
      const next = cloneConfig(current ?? ruleConfig);
      updater(next);
      next.fy2025.breast.sex = "female";
      next.fy2025.cervical.sex = "female";
      next.fy2025.cervicalStandalone.sex = "female";
      next.fy2026plus.breast.sex = "female";
      next.fy2026plus.boneDensity.sex = "female";
      next.fy2026plus.cervical.sex = "female";
      next.fy2026plus.cervicalStandalone.sex = "female";
      return next;
    });
    setMessage(null);
    setSaveError(null);
  }

  async function handleSave() {
    if (IS_STATIC_MODE) {
      setMessage(null);
      setSaveError("静的公開モードでは保存できません。設定を変更する場合はコード側の標準設定を編集して再デプロイしてください。");
      return;
    }

    try {
      const nextConfig = cloneConfig(config);
      nextConfig.fy2025.breast.sex = "female";
      nextConfig.fy2025.cervical.sex = "female";
      nextConfig.fy2025.cervicalStandalone.sex = "female";
      nextConfig.fy2026plus.breast.sex = "female";
      nextConfig.fy2026plus.boneDensity.sex = "female";
      nextConfig.fy2026plus.cervical.sex = "female";
      nextConfig.fy2026plus.cervicalStandalone.sex = "female";
      await saveRuleConfig(nextConfig);
      setDraftConfig(null);
      setSaveError(null);
      setMessage(
        "共有マスタを保存しました。別端末でも最新設定を読み込めます。",
      );
    } catch (nextError) {
      setMessage(null);
      setSaveError(
        nextError instanceof Error ? nextError.message : "保存に失敗しました。",
      );
    }
  }

  async function handleReset() {
    if (IS_STATIC_MODE) {
      setMessage(null);
      setSaveError("静的公開モードでは標準設定への書き戻しはできません。");
      return;
    }

    try {
      await resetRuleConfig();
      setDraftConfig(null);
      setSaveError(null);
      setMessage("共有マスタを標準設定へ戻しました。");
    } catch (nextError) {
      setMessage(null);
      setSaveError(
        nextError instanceof Error
          ? nextError.message
          : "初期化に失敗しました。",
      );
    }
  }

  function confirmDiscardChanges() {
    return !hasUnsavedChanges || window.confirm("保存していない変更があります。このまま移動すると変更は失われます。");
  }

  const youngGeneralAges = agesToText(config.fy2026plus.youth.ages);
  const milestoneAges = agesToText(config.fy2026plus.milestone.ages);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-white/88 px-4 py-3 shadow-[0_-18px_42px_rgba(148,163,184,0.2)] backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-xl grid-cols-[auto_1fr] gap-3">
          <Link
            href="/"
            onClick={(event) => {
              if (!confirmDiscardChanges()) {
                event.preventDefault();
              }
            }}
            className="rounded-full border border-slate-200/80 bg-white/95 px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-[0_10px_28px_rgba(148,163,184,0.14)] transition hover:border-sky-200 hover:bg-sky-50/80"
          >
            戻る
          </Link>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={IS_STATIC_MODE}
          className="rounded-full border border-white/80 bg-[linear-gradient(135deg,#9fddea_0%,#bbe9dd_48%,#f2ecad_100%)] px-5 py-3 text-base font-semibold text-green-700 shadow-[0_18px_42px_rgba(180,215,193,0.34)] transition hover:translate-y-[-1px] hover:brightness-[1.02] active:translate-y-[1px] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
        >
          保存
        </button>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(220,246,239,0.72),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,244,207,0.78),transparent_28%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28rem] bg-[radial-gradient(circle_at_18%_48%,rgba(253,228,238,0.7),transparent_26%),radial-gradient(circle_at_86%_38%,rgba(227,240,255,0.76),transparent_30%)]"
      />
      <div className="relative mx-auto max-w-6xl rounded-[2.2rem] border border-white/85 bg-white/76 p-6 pb-24 shadow-[0_30px_90px_rgba(148,163,184,0.2)] backdrop-blur-xl md:p-8 md:pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-sm font-medium text-emerald-900 shadow-[0_6px_18px_rgba(16,185,129,0.08)]">
              マスタ設定
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance text-slate-900 sm:text-5xl">
              <span className="block text-slate-700">設定画面</span>
            </h1>
          </div>
        </div>

        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
          追加検査の条件を編集できます。
        </p>

        <div className="mt-7 grid gap-4 rounded-[1.9rem] border border-white/85 bg-[linear-gradient(135deg,rgba(227,240,255,0.82),rgba(253,228,238,0.46),rgba(255,255,255,0.96))] p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)] md:grid-cols-3">
          <div className="rounded-[1.4rem] bg-white/58 p-4">
            <p className="text-sm text-slate-500">編集対象</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              年齢帯 / 偶数奇数 / 新規検査
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-white/58 p-4">
            <p className="text-sm text-slate-500">保存先</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {IS_STATIC_MODE ? "固定マスタ" : "サーバー共有マスタ"}
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-white/58 p-4">
            <p className="text-sm text-slate-500">反映範囲</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {IS_STATIC_MODE ? "再デプロイ時に反映" : "全端末で共通"}
            </p>
          </div>
        </div>

        {loading && (
          <p
            className={`${noticeClassName} border-sky-100 bg-sky-50/90 text-sky-900`}
          >
            共有マスタを読み込んでいます。
          </p>
        )}
        {message && (
          <p
            className={`${noticeClassName} border-emerald-100 bg-emerald-50/90 text-emerald-800`}
          >
            {message}
          </p>
        )}
        {(saveError ?? sharedError) && (
          <p
            className={`${noticeClassName} border-rose-100 bg-rose-50/90 text-rose-700`}
          >
            {saveError ?? sharedError}
          </p>
        )}
        {IS_STATIC_MODE && (
          <p className={`${noticeClassName} border-amber-100 bg-amber-50/90 text-amber-800`}>
            静的公開モードです。画面上の編集は確認用で、保存はできません。
          </p>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <RangeEditor
            title="生活習慣病検診の対象年齢"
            description="年齢範囲を指定できます"
            min={config.fy2026plus.general.eligibleAge.min}
            max={config.fy2026plus.general.eligibleAge.max}
            onMinChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.general.eligibleAge.min = value;
                draft.fy2026plus.general.eligibleAge.min = value;
              })
            }
            onMaxChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.general.eligibleAge.max = value;
                draft.fy2026plus.general.eligibleAge.max = value;
              })
            }
          />

          <AgeListEditor
            title="若年検診の対象年齢"
            description=""
            value={youngGeneralAges}
            onChange={(value) =>
              updateConfig((draft) => {
                draft.fy2026plus.youth.ages = textToAges(value);
              })
            }
          />

          <AgeListEditor
            title="節目検診の対象年齢"
            description=""
            value={milestoneAges}
            onChange={(value) =>
              updateConfig((draft) => {
                const ages = textToAges(value);
                draft.fy2025.added.ages = ages;
                draft.fy2026plus.milestone.ages = ages;
              })
            }
          />

          <PatternEditor
            title="乳がん検診（マンモグラフィ）の対象年齢"
            description=""
            min={config.fy2026plus.breast.eligibleAge.min}
            max={config.fy2026plus.breast.eligibleAge.max}
            parity={config.fy2026plus.breast.parity}
            onMinChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.breast.eligibleAge.min = value;
                draft.fy2026plus.breast.eligibleAge.min = value;
              })
            }
            onMaxChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.breast.eligibleAge.max = value;
                draft.fy2026plus.breast.eligibleAge.max = value;
              })
            }
            onParityChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.breast.parity = value;
                draft.fy2026plus.breast.parity = value;
              })
            }
          />

          <PatternEditor
            title="骨密度検査の対象年齢"
            description=""
            min={config.fy2026plus.boneDensity.eligibleAge.min}
            max={config.fy2026plus.boneDensity.eligibleAge.max}
            parity={config.fy2026plus.boneDensity.parity}
            onMinChange={(value) =>
              updateConfig((draft) => {
                draft.fy2026plus.boneDensity.eligibleAge.min = value;
              })
            }
            onMaxChange={(value) =>
              updateConfig((draft) => {
                draft.fy2026plus.boneDensity.eligibleAge.max = value;
              })
            }
            onParityChange={(value) =>
              updateConfig((draft) => {
                draft.fy2026plus.boneDensity.parity = value;
              })
            }
          />

          <PatternEditor
            title="子宮頸がん検診"
            description="年齢帯に加えて、偶数年齢・奇数年齢・制限なしを切り替えられます。"
            min={config.fy2026plus.cervical.eligibleAge.min}
            max={config.fy2026plus.cervical.eligibleAge.max}
            parity={config.fy2026plus.cervical.parity}
            onMinChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.cervical.eligibleAge.min = value;
                draft.fy2026plus.cervical.eligibleAge.min = value;
              })
            }
            onMaxChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.cervical.eligibleAge.max = value;
                draft.fy2026plus.cervical.eligibleAge.max = value;
              })
            }
            onParityChange={(value) =>
              updateConfig((draft) => {
                draft.fy2025.cervical.parity = value;
                draft.fy2026plus.cervical.parity = value;
              })
            }
          />

          <PatternEditor
            title="子宮頸がん検診（単独）"
            description="年齢帯と偶数/奇数設定を変えると、内部の対象年齢一覧も自動で作り直します。"
            min={config.fy2026plus.cervicalStandalone.eligibleAge.min}
            max={config.fy2026plus.cervicalStandalone.eligibleAge.max}
            parity={config.fy2026plus.cervicalStandalone.parity}
            onMinChange={(value) =>
              updateConfig((draft) => {
                const max = draft.fy2026plus.cervicalStandalone.eligibleAge.max;
                const parity = draft.fy2026plus.cervicalStandalone.parity;
                draft.fy2025.cervicalStandalone.eligibleAge.min = value;
                draft.fy2026plus.cervicalStandalone.eligibleAge.min = value;
                draft.fy2025.cervicalStandalone.ages = buildAgesByParity(
                  value,
                  max,
                  parity,
                );
              })
            }
            onMaxChange={(value) =>
              updateConfig((draft) => {
                const min = draft.fy2026plus.cervicalStandalone.eligibleAge.min;
                const parity = draft.fy2026plus.cervicalStandalone.parity;
                draft.fy2025.cervicalStandalone.eligibleAge.max = value;
                draft.fy2026plus.cervicalStandalone.eligibleAge.max = value;
                draft.fy2025.cervicalStandalone.ages = buildAgesByParity(
                  min,
                  value,
                  parity,
                );
              })
            }
            onParityChange={(value) =>
              updateConfig((draft) => {
                const min = draft.fy2026plus.cervicalStandalone.eligibleAge.min;
                const max = draft.fy2026plus.cervicalStandalone.eligibleAge.max;
                draft.fy2025.cervicalStandalone.parity = value;
                draft.fy2026plus.cervicalStandalone.parity = value;
                draft.fy2025.cervicalStandalone.ages = buildAgesByParity(
                  min,
                  max,
                  value,
                );
              })
            }
          />

          <CustomExamEditor
            exams={config.fy2026plus.customMenus}
            onChange={(exams) =>
              updateConfig((draft) => {
                draft.fy2026plus.customMenus = exams;
              })
            }
          />

          <RuleSummaryView config={config} />

          <AssumptionsEditor
            values={config.fy2026plus.assumptions}
            onChange={(values) =>
              updateConfig((draft) => {
                draft.fy2026plus.assumptions = values;
              })
            }
          />
        </div>

        <details className="mt-8 rounded-[1.85rem] border border-dashed border-slate-200 bg-white/72 p-5 shadow-[0_12px_36px_rgba(148,163,184,0.1)]">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">
            内部データを確認する
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {IS_STATIC_MODE
              ? "静的公開モードでは、この内容は固定マスタの確認用です。"
              : "画面では規則性だけを編集しています。保存時には、この内容が内部の年度別データへ反映されます。"}
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[1.7rem] border border-slate-200/80 bg-slate-900 p-4 text-xs leading-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            {jsonPreview}
          </pre>
        </details>
                <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={IS_STATIC_MODE}
            className="rounded-full border border-rose-100 bg-[linear-gradient(135deg,rgba(255,241,244,0.98),rgba(255,248,250,0.98))] px-5 py-3 text-sm font-semibold text-rose-700 shadow-[0_10px_28px_rgba(251,113,133,0.1)] transition hover:border-rose-200 hover:bg-[linear-gradient(135deg,rgba(255,236,241,0.98),rgba(255,245,248,0.98))] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            標準設定に戻す
          </button>
        </div>
      </div>
    </main>
  );
}
