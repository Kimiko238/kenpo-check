import type { Metadata } from "next";
import MasterEditor from "../ui/master-editor";

export const metadata: Metadata = {
  title: "マスタ設定 | 協会けんぽ健診チェック",
  description: "年度別の判定ルールを編集するマスタ画面です。",
};

export default function MasterPage() {
  return <MasterEditor />;
}
