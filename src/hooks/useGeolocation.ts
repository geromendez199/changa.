import { useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const isValidCoordinate = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Tu dispositivo no soporta geolocalización.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        if (!isValidCoordinate(latitude, -90, 90) || !isValidCoordinate(longitude, -180, 180)) {
          setStatus("error");
          setErrorMessage("Recibimos una ubicación inválida. Probá nuevamente o cargala manualmente.");
          return;
        }

        setCoords({ latitude, longitude });
        setStatus("granted");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("No pudimos acceder a tu ubicación. Podés cargarla manualmente.");
          return;
        }

        if (error.code === error.TIMEOUT) {
          setStatus("error");
          setErrorMessage("La ubicación tardó demasiado. Intentá nuevamente.");
          return;
        }

        setStatus("error");
        setErrorMessage("No se pudo obtener la ubicación actual.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return { coords, status, errorMessage, requestLocation };
}
