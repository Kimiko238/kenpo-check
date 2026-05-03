"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_RULE_CONFIG,
  parseRuleConfigJson,
  RULE_CONFIG_EVENT_NAME,
  type RuleConfig,
} from "../lib/kenpo-rules";

async function fetchSharedRuleConfig() {
  const response = await fetch("/api/rule-config", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("共有マスタの取得に失敗しました。");
  }

  const json = (await response.json()) as unknown;
  return parseRuleConfigJson(JSON.stringify(json));
}

export function useSharedRuleConfig() {
  const [ruleConfig, setRuleConfig] = useState<RuleConfig>(DEFAULT_RULE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestLoadIdRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function load() {
      const loadId = latestLoadIdRef.current + 1;
      latestLoadIdRef.current = loadId;

      try {
        const nextConfig = await fetchSharedRuleConfig();
        if (!active || loadId !== latestLoadIdRef.current) {
          return;
        }
        setRuleConfig(nextConfig);
        setError(null);
      } catch (nextError) {
        if (!active || loadId !== latestLoadIdRef.current) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "共有マスタの取得に失敗しました。");
      } finally {
        if (active && loadId === latestLoadIdRef.current) {
          setLoading(false);
        }
      }
    }

    void load();

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener(RULE_CONFIG_EVENT_NAME, handleRefresh);
    const intervalId = window.setInterval(handleRefresh, 30000);

    return () => {
      active = false;
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(RULE_CONFIG_EVENT_NAME, handleRefresh);
      window.clearInterval(intervalId);
    };
  }, []);

  async function saveRuleConfig(nextConfig: RuleConfig) {
    const response = await fetch("/api/rule-config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextConfig),
    });

    if (!response.ok) {
      throw new Error("共有マスタの保存に失敗しました。");
    }

    const json = (await response.json()) as unknown;
    const savedConfig = parseRuleConfigJson(JSON.stringify(json));
    latestLoadIdRef.current += 1;
    setRuleConfig(savedConfig);
    setError(null);
    window.dispatchEvent(new Event(RULE_CONFIG_EVENT_NAME));
    return savedConfig;
  }

  async function resetRuleConfig() {
    const response = await fetch("/api/rule-config", {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("共有マスタの初期化に失敗しました。");
    }

    const json = (await response.json()) as unknown;
    const resetConfig = parseRuleConfigJson(JSON.stringify(json));
    latestLoadIdRef.current += 1;
    setRuleConfig(resetConfig);
    setError(null);
    window.dispatchEvent(new Event(RULE_CONFIG_EVENT_NAME));
    return resetConfig;
  }

  return {
    ruleConfig,
    loading,
    error,
    saveRuleConfig,
    resetRuleConfig,
  };
}
