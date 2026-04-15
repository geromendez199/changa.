import { useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Tu dispositivo no soporta geolocalización.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus("granted");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("No pudimos acceder a tu ubicación. Podés cargarla manualmente.");
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
