import { useCallback, useState } from "react";

function getGeolocationErrorMessage(error) {
  if (error?.code === 1) {
    return "位置情報の利用が許可されていません。ブラウザの設定を確認してください。";
  }

  if (error?.code === 2) {
    return "現在地を取得できませんでした。屋外または通信環境の良い場所で再度お試しください。";
  }

  if (error?.code === 3) {
    return "現在地の取得に時間がかかっています。少し移動してから再度お試しください。";
  }

  return "現在地を取得できませんでした。しばらくしてから再度お試しください。";
}

export function useGeolocation() {
  const [status, setStatus] = useState("idle");
  const [coords, setCoords] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("このブラウザは位置情報取得に対応していません。");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setStatus("success");
      },
      (error) => {
        if (error?.code === 1) {
          setStatus("denied");
        } else if (error?.code === 3) {
          setStatus("timeout");
        } else {
          setStatus("error");
        }
        setErrorMessage(getGeolocationErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, []);

  return {
    status,
    coords,
    errorMessage,
    setCoords,
    requestLocation
  };
}
