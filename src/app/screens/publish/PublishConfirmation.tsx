import { CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/Button";
import { useAppState } from "../../hooks/useAppState";

export function PublishConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs } = useAppState();
  const job = jobs.find((item) => item.id === id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto font-['Inter']">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
        <CheckCircle className="text-[#0DAE79] mx-auto mb-4" size={56} />
        <h1 className="text-2xl font-bold text-[#111827] mb-2">¡Publicación creada!</h1>
        <p className="text-sm text-gray-500 mb-6">
          {job ? `Tu changa "${job.title}" ya está visible para la comunidad.` : "Tu changa fue publicada correctamente."}
        </p>
        <div className="space-y-3">
          {job && (
            <Button fullWidth onClick={() => navigate(`/job/${job.id}`)}>
              Ver publicación
            </Button>
          )}
          <Button fullWidth variant="secondary" onClick={() => navigate("/my-jobs")}>Ir a mis trabajos</Button>
        </div>
      </div>
    </div>
  );
}
