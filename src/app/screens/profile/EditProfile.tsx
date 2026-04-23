/**
 * WHY: Improve profile-edit feedback and trust-building copy so users understand why completing their profile matters.
 * CHANGED: YYYY-MM-DD
 */
import { Camera, Save, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { PreviewModeNotice } from "../../components/PreviewModeNotice";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfaceCard } from "../../components/SurfaceCard";
import { Textarea } from "../../components/Textarea";
import { UserAvatar } from "../../components/UserAvatar";
import { useAppState, useCurrentUser } from "../../hooks/useAppState";
import { getFallbackPreviewMessage, isLocalPreviewSource } from "../../../services/service.utils";

const MAX_AVATAR_FILE_SIZE_BYTES = 6 * 1024 * 1024;
const AVATAR_MAX_DIMENSION_PX = 512;
const AVATAR_OUTPUT_QUALITY = 0.82;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No pudimos leer la imagen seleccionada."));
    };
    reader.onerror = () => reject(new Error("No pudimos leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No pudimos preparar la foto de perfil."));
    image.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No pudimos preparar la foto de perfil."));
        return;
      }

      resolve(blob);
    }, "image/jpeg", AVATAR_OUTPUT_QUALITY);
  });

const buildAvatarAsset = async (file: File) => {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, AVATAR_MAX_DIMENSION_PX / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No pudimos preparar la foto de perfil.");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  const blob = await canvasToBlob(canvas);

  return {
    previewUrl: canvas.toDataURL("image/jpeg", AVATAR_OUTPUT_QUALITY),
    uploadFile: new File([blob], "avatar.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    }),
  };
};

export function EditProfile() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { saveUserProfile, dataSource } = useAppState();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const isPreview = isLocalPreviewSource(dataSource);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setLocation(user.location || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || "");
    setAvatarFile(null);
    setAvatarFileName("");
    setRemoveAvatar(false);
  }, [user]);

  if (!user) return null;

  const onAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback(null);

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Elegí una imagen válida para la foto de perfil." });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      setFeedback({ type: "error", message: "La imagen es demasiado pesada. Elegí una de hasta 6 MB." });
      event.target.value = "";
      return;
    }

    setIsProcessingAvatar(true);

    try {
      const { previewUrl, uploadFile } = await buildAvatarAsset(file);
      setAvatarUrl(previewUrl);
      setAvatarFile(uploadFile);
      setAvatarFileName(file.name);
      setRemoveAvatar(false);
      event.target.value = "";
      toast.success("Foto lista", {
        description: "La imagen ya está lista para guardarse y sincronizarse entre tus dispositivos.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos procesar la imagen.";
      setFeedback({ type: "error", message });
      event.target.value = "";
    } finally {
      setIsProcessingAvatar(false);
    }
  };

  const onRemoveAvatar = () => {
    setAvatarUrl("");
    setAvatarFile(null);
    setAvatarFileName("");
    setRemoveAvatar(true);
    setFeedback(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      avatarFile,
      removeAvatar,
    });
    setIsSaving(false);

    if (!result.ok) {
      const message = result.message || "No pudimos guardar tus datos.";
      setFeedback({ type: "error", message });
      toast.error("No pudimos guardar el perfil", {
        description: message,
      });
      return;
    }

    setFeedback({ type: "success", message: "Perfil guardado correctamente" });
    toast.success("Perfil actualizado", {
      description: avatarUrl.trim() || removeAvatar
        ? "Tus cambios ya quedaron sincronizados con tu cuenta."
        : "Tus cambios principales ya están visibles en Changa.",
    });
    setTimeout(() => navigate("/profile"), 900);
  };

  return (
    <div className="app-screen pb-8">
      <ScreenHeader
        title="Editar perfil"
        subtitle="Un perfil claro genera más confianza y mejores respuestas."
        onBack={() => navigate(-1)}
      />

      <div className="space-y-4 px-6 py-6">
        {isPreview ? (
          <PreviewModeNotice
            description={`${getFallbackPreviewMessage("la edición de perfil")} Podés revisar la interfaz, pero el guardado real está deshabilitado en esta vista previa.`}
          />
        ) : null}

        <SurfaceCard padding="lg" className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={name || user.name}
              avatarUrl={removeAvatar ? undefined : avatarUrl || user.avatarUrl}
              fallbackLetter={user.avatarLetter}
              size="lg"
              tone={!removeAvatar && (avatarUrl || user.avatarUrl) ? "surface" : "soft"}
            />
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">Vista previa del perfil</p>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                La foto que elijas se va a ver así en tu perfil y en tus chats.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarFileChange}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                icon={<Camera size={18} />}
                disabled={isPreview || isProcessingAvatar}
              >
                {isProcessingAvatar ? "Procesando foto..." : "Subir foto desde archivo"}
              </Button>

              {avatarUrl ? (
                <Button
                  type="button"
                  size="lg"
                  variant="ghost"
                  onClick={onRemoveAvatar}
                  icon={<Trash2 size={18} />}
                  disabled={isPreview || isProcessingAvatar}
                >
                  Quitar foto
                </Button>
              ) : null}
            </div>

            <p className="text-sm text-[var(--app-text-muted)]">
              {avatarFileName
                ? `Archivo seleccionado: ${avatarFileName}`
                : "Elegí una imagen desde tu computadora o celular. Máximo 6 MB."}
            </p>
          </div>

          <Input placeholder="Nombre público" value={name} onChange={setName} size="lg" />
          <Input placeholder="Ubicación" value={location} onChange={setLocation} size="lg" />
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Contá qué tipo de tareas hacés, cómo trabajás o cualquier dato que aporte confianza."
          />
        </SurfaceCard>

        {feedback?.type === "success" ? (
          <div className="rounded-[18px] border border-green-100 bg-green-50 p-3 text-sm text-green-700">
            {feedback.message}
          </div>
        ) : null}
        {feedback?.type === "error" ? (
          <div className="rounded-[18px] border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {feedback.message}
          </div>
        ) : null}

        <Button
          fullWidth
          size="lg"
          onClick={onSave}
          icon={<Save size={18} />}
          disabled={isSaving || isPreview || isProcessingAvatar}
        >
          {isPreview ? "Guardado no disponible en vista previa" : isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
