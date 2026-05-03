import type { Metadata } from "next";
import KenpoChecker from "./ui/kenpo-checker";

export const metadata: Metadata = {
  title: "協会けんぽ健診チェック",
  description:
    "受診日・生年月日・性別から、協会けんぽの被保険者向け健診メニューを判定します。",
};

export default function Home() {
  return <KenpoChecker />;
}
