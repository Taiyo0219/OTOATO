import { AlertCircle, CheckCircle2, LoaderCircle, LocateFixed } from "lucide-react";

function getStatusCopy(status) {
  if (status === "loading") {
    return {
      title: "現在地を取得中",
      description: "ブラウザの位置情報確認を待っています。"
    };
  }

  if (status === "success") {
    return {
      title: "現在地を取得しました",
      description: "地図上に現在地を表示しています。"
    };
  }

  if (status === "denied") {
    return {
      title: "位置情報が許可されていません",
      description: "地図から場所を選ぶこともできます。"
    };
  }

  if (status === "timeout") {
    return {
      title: "現在地取得がタイムアウトしました",
      description: "通信環境を変えるか、地図から場所を選んでください。"
    };
  }

  if (status === "unavailable") {
    return {
      title: "位置情報を利用できません",
      description: "地図から場所を選んで投稿できます。"
    };
  }

  if (status === "error") {
    return {
      title: "現在地を取得できませんでした",
      description: "地図から場所を選ぶこともできます。"
    };
  }

  return {
    title: "現在地を使う",
    description: "必要なときだけ位置情報を取得します。"
  };
}

function LocationStatusPanel({ status, coords, errorMessage, onRequest, compact = false }) {
  const copy = getStatusCopy(status);
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = ["denied", "timeout", "unavailable", "error"].includes(status);

  return (
    <section className={`location-status${compact ? " is-compact" : ""}${isError ? " is-error" : ""}`}>
      <div className="location-status-icon" aria-hidden="true">
        {isLoading ? <LoaderCircle className="loading-icon" size={18} /> : null}
        {isSuccess ? <CheckCircle2 size={18} /> : null}
        {isError ? <AlertCircle size={18} /> : null}
        {!isLoading && !isSuccess && !isError ? <LocateFixed size={18} /> : null}
      </div>
      <div className="location-status-copy">
        <p className="location-status-title">{copy.title}</p>
        <p>{errorMessage || copy.description}</p>
        {coords ? (
          <p className="coordinate-line">
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </p>
        ) : null}
      </div>
      <button className="location-action" type="button" onClick={onRequest} disabled={isLoading}>
        {isLoading ? "取得中" : isSuccess ? "再取得" : "取得"}
      </button>
    </section>
  );
}

export default LocationStatusPanel;
