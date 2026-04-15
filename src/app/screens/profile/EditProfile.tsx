import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAppState, useCurrentUser } from "../../hooks/useAppState";

export function EditProfile() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { saveUserProfile } = useAppState();
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setLocation(user.location || "");
    setBio(user.bio || "");
  }, [user]);

  if (!user) return null;

  const onSave = async () => {
    setFeedback(null);

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Ingresá un nombre válido." });
      return;
    }

    if (!trimmedLocation) {
      setFeedback({ type: "error", message: "Ingresá una ubicación válida." });
      return;
    }

    setIsSaving(true);
    const result = await saveUserProfile({
      fullName: trimmedName,
      location: trimmedLocation,
      bio,
    });
    setIsSaving(false);

    if (!result.ok) {
      setFeedback({ type: "error", message: "No pudimos guardar tus datos" });
      return;
    }

    setFeedback({ type: "success", message: "Perfil guardado correctamente" });
    setTimeout(() => navigate("/profile"), 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-8 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-[#111827]" /></button>
          <div className="flex-1"><h1 className="text-xl font-bold text-[#111827]">Editar perfil</h1><p className="text-sm text-gray-500 mt-0.5">Actualizá tus datos básicos</p></div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <Input placeholder="Nombre" value={name} onChange={setName} />
        <Input placeholder="Ubicación" value={location} onChange={setLocation} />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Contá algo sobre vos" className="w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl py-3.5 px-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-[#0DAE79]" />

        {feedback?.type === "success" && <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-sm text-green-700">{feedback.message}</div>}
        {feedback?.type === "error" && <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-sm text-red-700">{feedback.message}</div>}

        <Button fullWidth onClick={onSave} icon={<Save size={18} />} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
      </div>
    </div>
  );
}
