"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildResults, type MenuResult, type Sex } from "../lib/kenpo-rules";
import { useSharedRuleConfig } from "./use-shared-rule-config";

const DATE_PART_LABELS = {
  year: "年",
  month: "月",
  day: "日",
} as const;

type DateInput = {
  year: string;
  month: string;
  day: string;
};

type SubmittedInput = {
  examDate: string;
  birthDate: string;
  sex: Sex;
};

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function splitIsoDate(value: string): DateInput {
  const [year = "", month = "", day = ""] = value.split("-");
  return { year, month, day };
}

function formatDateLabel(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function sexLabel(value: Sex) {
  return value === "female" ? "女性" : "男性";
}

function normalizeDateInput(input: DateInput, fieldLabel: string) {
  const year = input.year.trim();
  const month = input.month.trim();
  const day = input.day.trim();
  const hasAnyValue = Boolean(year || month || day);
  const isComplete = Boolean(year && month && day);

  if (!hasAnyValue) {
    return { value: "", error: `${fieldLabel}を入力してください。` };
  }

  if (!isComplete) {
    return {
      value: "",
      error: `${fieldLabel}を年・月・日で入力してください。`,
    };
  }

  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (
    !Number.isInteger(yearNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(dayNumber) ||
    yearNumber < 1900 ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31
  ) {
    return { value: "", error: `存在する${fieldLabel}を入力してください。` };
  }

  const value = `${String(yearNumber).padStart(4, "0")}-${String(monthNumber).padStart(2, "0")}-${String(
    dayNumber,
  ).padStart(2, "0")}`;
  const parsed = new Date(`${value}T00:00:00`);
  const isValidDate =
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === yearNumber &&
    parsed.getMonth() + 1 === monthNumber &&
    parsed.getDate() === dayNumber;

  if (!isValidDate) {
    return { value: "", error: `存在する${fieldLabel}を入力してください。` };
  }

  return { value, error: null };
}

function statusLabel(status: MenuResult["status"]) {
  if (status === "eligible") return "対象";
  if (status === "conditional") return "条件あり";
  return "対象外";
}

function statusClassName(status: MenuResult["status"]) {
  if (status === "eligible") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "conditional") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function MenuIcon({ menuId }: { menuId: string }) {
  if (menuId === "general") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="5" y="4" width="14" height="16" rx="2.5" />
        <path d="M9 9h6M9 13h6M12 7v12" />
      </svg>
    );
  }

  if (menuId === "added" || menuId === "milestone") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }

  if (menuId === "breast") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M7 6c1.5 0 2.5 1 2.5 2.5S8.5 11 7 11 4.5 10 4.5 8.5 5.5 6 7 6Z" />
        <path d="M17 6c1.5 0 2.5 1 2.5 2.5S18.5 11 17 11s-2.5-1-2.5-2.5S15.5 6 17 6Z" />
        <path d="M7 11c.3 3.3 1.8 6 5 7 3.2-1 4.7-3.7 5-7" />
      </svg>
    );
  }

  if (menuId === "bone-density") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M8 6.5a2.5 2.5 0 1 1 5 0V9h-2V6.5a.5.5 0 0 0-1 0v11a2.5 2.5 0 1 1-5 0V15h2v2.5a.5.5 0 0 0 1 0v-11Z" />
        <path d="M14 9h2.5a2.5 2.5 0 1 1 0 5H14" />
        <path d="M14 10.5h2.5a1 1 0 1 1 0 2H14" />
      </svg>
    );
  }

  if (menuId === "cervical" || menuId === "cervical-standalone") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 5c3 0 5 2 5 5 0 4-3 5.5-5 9-2-3.5-5-5-5-9 0-3 2-5 5-5Z" />
        <path d="M12 9v4M10 11h4" />
      </svg>
    );
  }

  if (menuId === "hepatitis") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M8 6h8" />
        <path d="M12 6v12" />
        <path d="M9 10h6" />
        <path d="M10 18h4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="7" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

const fieldGroupClassName =
  "rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(148,163,184,0.08)] backdrop-blur";

const dateInputShellClassName =
  "rounded-[1.2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,251,255,0.98))] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition focus-within:border-sky-200 focus-within:shadow-[0_0_0_4px_rgba(186,230,253,0.35)]";

const textInputClassName =
  "date-part-input mt-1 w-full bg-transparent text-base font-medium text-slate-800 outline-none placeholder:text-slate-400";

const alertClassName =
  "rounded-[1.2rem] border px-4 py-3 text-sm leading-6 shadow-[0_8px_24px_rgba(148,163,184,0.08)]";

export default function KenpoChecker() {
  const [examDateInput, setExamDateInput] = useState<DateInput>({
    year: "",
    month: "",
    day: "",
  });
  const [birthDateInput, setBirthDateInput] = useState<DateInput>({
    year: "",
    month: "",
    day: "",
  });
  const [sex, setSex] = useState<Sex>("female");
  const [submittedInput, setSubmittedInput] = useState<SubmittedInput | null>(
    null,
  );
  const { ruleConfig, loading, error } = useSharedRuleConfig();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setExamDateInput((current) => {
        if (current.year || current.month || current.day) {
          return current;
        }

        return splitIsoDate(getTodayDateValue());
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const normalizedExamDate = useMemo(
    () => normalizeDateInput(examDateInput, "受診日"),
    [examDateInput],
  );
  const normalizedBirthDate = useMemo(
    () => normalizeDateInput(birthDateInput, "生年月日"),
    [birthDateInput],
  );

  const liveValidationResult = useMemo(() => {
    if (
      normalizedExamDate.error ||
      !normalizedExamDate.value ||
      normalizedBirthDate.error ||
      !normalizedBirthDate.value
    ) {
      return null;
    }

    return buildResults(
      normalizedExamDate.value,
      normalizedBirthDate.value,
      sex,
      ruleConfig,
    );
  }, [normalizedExamDate, normalizedBirthDate, ruleConfig, sex]);

  const examDateError =
    normalizedExamDate.error ??
    (normalizedExamDate.value &&
    normalizedBirthDate.value &&
    !liveValidationResult
      ? "受診日は生年月日以降の日付を入力してください。"
      : null);

  const birthDateError =
    normalizedBirthDate.error ??
    (normalizedExamDate.value &&
    normalizedBirthDate.value &&
    !liveValidationResult
      ? "生年月日は受診日以前の日付を入力してください。"
      : null);

  const result = useMemo(() => {
    if (!submittedInput) {
      return null;
    }

    return buildResults(
      submittedInput.examDate,
      submittedInput.birthDate,
      submittedInput.sex,
      ruleConfig,
    );
  }, [submittedInput, ruleConfig]);

  const eligibleMenus =
    result?.menus.filter(
      (menu) => menu.status === "eligible" || menu.status === "conditional",
    ) ?? [];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      examDateError ||
      birthDateError ||
      !normalizedExamDate.value ||
      !normalizedBirthDate.value
    ) {
      return;
    }

    setSubmittedInput({
      examDate: normalizedExamDate.value,
      birthDate: normalizedBirthDate.value,
      sex,
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(220,246,239,0.75),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,244,207,0.75),transparent_32%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[26rem] bg-[radial-gradient(circle_at_15%_55%,rgba(253,228,238,0.68),transparent_28%),radial-gradient(circle_at_85%_35%,rgba(227,240,255,0.78),transparent_32%)]"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="w-full rounded-[2.5rem] border border-white/80 bg-white/76 p-6 shadow-[0_28px_100px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-10">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/master"
              className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(148,163,184,0.08)] transition hover:border-sky-200 hover:bg-sky-50/80"
            >
              マスタ設定
            </Link>
          </div>

          <div className="mt-8 grid gap-10 ">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Check
              </p>
              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-balance text-slate-900 sm:text-5xl">
                条件を入力してください。
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,255,0.98))] p-5 shadow-[0_20px_70px_rgba(148,163,184,0.18)] md:p-6"
            >
              <div className="grid gap-4">
                <div className={fieldGroupClassName}>
                  <span className="text-sm font-medium text-slate-600">
                    受診日
                  </span>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {(
                      Object.keys(DATE_PART_LABELS) as Array<keyof DateInput>
                    ).map((part) => (
                      <label key={part} className={dateInputShellClassName}>
                        <span className="text-xs font-medium tracking-[0.08em] text-slate-500">
                          {DATE_PART_LABELS[part]}
                        </span>
                        <input
                          className={textInputClassName}
                          type="text"
                          inputMode="numeric"
                          maxLength={part === "year" ? 4 : 2}
                          placeholder={
                            part === "year"
                              ? "2026"
                              : part === "month"
                                ? "04"
                                : "01"
                          }
                          value={examDateInput[part]}
                          onChange={(event) =>
                            setExamDateInput((current) => ({
                              ...current,
                              [part]: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className={fieldGroupClassName}>
                  <span className="text-sm font-medium text-slate-600">
                    生年月日
                  </span>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {(
                      Object.keys(DATE_PART_LABELS) as Array<keyof DateInput>
                    ).map((part) => (
                      <label key={part} className={dateInputShellClassName}>
                        <span className="text-xs font-medium tracking-[0.08em] text-slate-500">
                          {DATE_PART_LABELS[part]}
                        </span>
                        <input
                          className={textInputClassName}
                          type="text"
                          inputMode="numeric"
                          maxLength={part === "year" ? 4 : 2}
                          placeholder={
                            part === "year"
                              ? "1986"
                              : part === "month"
                                ? "08"
                                : "18"
                          }
                          value={birthDateInput[part]}
                          onChange={(event) =>
                            setBirthDateInput((current) => ({
                              ...current,
                              [part]: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <fieldset className={fieldGroupClassName}>
                  <legend className="px-2 text-sm font-medium text-slate-600">
                    性別
                  </legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "male" as const, label: "男性" },
                      { value: "female" as const, label: "女性" },
                    ].map((option) => {
                      const active = sex === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSex(option.value)}
                          className={`rounded-[1.2rem] border px-4 py-3 text-left text-base font-medium shadow-[0_8px_24px_rgba(148,163,184,0.08)] transition ${
                            active
                              ? option.value === "male"
                                ? "border-sky-100 bg-[linear-gradient(135deg,rgba(211,236,255,0.98),rgba(232,246,255,0.98))] text-sky-700"
                                : "border-rose-100 bg-[linear-gradient(135deg,rgba(255,240,242,0.98),rgba(255,247,249,0.98))] text-rose-700"
                              : "border-slate-200/80 bg-white/95 text-slate-700 hover:border-slate-200 hover:bg-[linear-gradient(135deg,rgba(245,249,255,0.9),rgba(255,247,249,0.9))]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="mt-5 space-y-3">
                {error && (
                  <p
                    className={`${alertClassName} border-rose-100 bg-rose-50/90 text-rose-700`}
                  >
                    {error}
                  </p>
                )}
                {examDateError && (
                  <p
                    className={`${alertClassName} border-rose-100 bg-rose-50/90 text-rose-700`}
                  >
                    {examDateError}
                  </p>
                )}
                {birthDateError && (
                  <p
                    className={`${alertClassName} border-rose-100 bg-rose-50/90 text-rose-700`}
                  >
                    {birthDateError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="check-submit-button mt-6 w-full rounded-full border border-white/80 px-6 py-4 text-green-700 font-semibold shadow-[0_18px_42px_rgba(180,215,193,0.34)] transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:shadow-none"
                disabled={Boolean(examDateError) || Boolean(birthDateError)}
              >
                判定する
              </button>
            </form>
          </div>
        </section>
      </div>

      {submittedInput && result && (
        <div className="result-modal-backdrop fixed inset-0 z-50 bg-slate-900/22 px-4 py-6 backdrop-blur-[6px] sm:px-6">
          <button
            type="button"
            onClick={() => setSubmittedInput(null)}
            className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-slate-200/80 bg-white/95 px-6 py-3 text-base font-semibold text-slate-800 shadow-[0_18px_46px_rgba(15,23,42,0.18)] transition hover:border-sky-200 hover:bg-sky-50/90"
          >
            閉じる
          </button>
          <div className="mx-auto flex h-full max-w-5xl items-center justify-center">
            <section className="result-modal-panel max-h-[88vh] w-full overflow-y-auto rounded-[2rem] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(249,251,255,0.98))] p-6 pb-24 shadow-[0_36px_120px_rgba(100,116,139,0.26)] sm:pb-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex rounded-full border border-sky-100 bg-sky-50/90 px-3 py-1 text-sm font-medium text-sky-900">
                    判定結果
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">
                    受けられる検診・オプション
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(227,240,255,0.86),rgba(253,228,238,0.52),rgba(255,255,255,0.96))] p-6 shadow-[0_14px_40px_rgba(148,163,184,0.14)]">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-sm text-slate-500">受診日</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatDateLabel(submittedInput.examDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">生年月日</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatDateLabel(submittedInput.birthDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">性別</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {sexLabel(submittedInput.sex)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">判定年度</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {result.fiscalYearLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.7rem] border border-white/70 bg-white/72 p-5 shadow-[0_10px_30px_rgba(148,163,184,0.1)]">
                    <p className="text-sm text-slate-500">受診日時点の年齢</p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900">
                      {result.ageOnExamDate}歳
                    </p>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.7rem] border border-white/70 bg-white/72 p-5 shadow-[0_10px_30px_rgba(148,163,184,0.1)]">
                      <p className="text-sm text-slate-500">年度末時点の年齢</p>
                      <p className="mt-2 text-4xl font-semibold text-slate-900">
                        {result.ageAtFiscalYearEnd}歳
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {result.warnings.map((warning) => (
                  <p
                    key={warning}
                    className={`${alertClassName} border-amber-100 bg-amber-50/90 text-amber-700`}
                  >
                    {warning}
                  </p>
                ))}
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {eligibleMenus.map((menu) => (
                  <article
                    key={menu.id}
                    className="rounded-[2rem] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.96))] p-6 shadow-[0_14px_40px_rgba(148,163,184,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,rgba(227,240,255,0.95),rgba(220,246,239,0.9))] text-sky-700 shadow-[0_10px_24px_rgba(148,163,184,0.1)]">
                        <MenuIcon menuId={menu.id} />
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClassName(menu.status)}`}
                      >
                        {statusLabel(menu.status)}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold text-slate-950">
                      {menu.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-slate-600">
                      {menu.description}
                    </p>
                    {menu.price && (
                      <p className="mt-4 text-sm font-semibold text-sky-700">
                        {menu.price}
                      </p>
                    )}
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {menu.note}
                    </p>
                  </article>
                ))}

                {!eligibleMenus.length && (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/85 p-8 text-sm leading-7 text-slate-500 shadow-[0_10px_30px_rgba(148,163,184,0.08)] lg:col-span-2">
                    条件に合う検診・オプションはありません。対象外のメニューは表示していません。
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/82 p-6 shadow-[0_12px_36px_rgba(148,163,184,0.1)]">
                <h3 className="text-lg font-semibold text-slate-900">前提</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
                  {result.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                  {!result.assumptions.length && (
                    <li>対応年度外のため、前提は表示していません。</li>
                  )}
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
