import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useNavigate } from "react-router";

export function NotFound() {
  const navigate = useNavigate();

  useDocumentHead({
    title: "Página no encontrada — changa.",
    noindex: true,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Página no encontrada</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Volver
      </button>
    </div>
  );
}
