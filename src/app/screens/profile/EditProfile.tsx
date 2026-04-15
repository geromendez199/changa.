import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAppState, useCurrentUser } from "../../hooks/useAppState";

export function EditProfile() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { setManualLocation } = useAppState();
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

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

        {saved && <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-sm text-green-700">Perfil actualizado.</div>}

        <Button fullWidth onClick={async () => { await setManualLocation(location); setSaved(true); setTimeout(() => navigate("/profile"), 800); }} icon={<Save size={18} />}>Guardar cambios</Button>
      </div>
    </div>
  );
}
