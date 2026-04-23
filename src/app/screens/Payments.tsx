/**
 * WHY: Make payments feel more intentional while being honest about which payment capabilities are already real and which are still in preparation.
 * CHANGED: YYYY-MM-DD
 */
import { CreditCard, Shield, Lock, CheckCircle, Plus, Smartphone } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { ScreenHeader } from "../components/ScreenHeader";
import { SectionHeader } from "../components/SectionHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { useAppState } from "../hooks/useAppState";

export function Payments() {
  const navigate = useNavigate();
  const { paymentMethods, transactions, jobs } = useAppState();

  return (
    <div className="app-screen pb-8">
      <ScreenHeader
        title="Pagos seguros"
        subtitle="Métodos guardados, movimientos y señales de protección."
        onBack={() => navigate(-1)}
      />

      <div className="px-6 py-6">
        <div className="bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-4 mb-4"><div className="bg-white/20 p-3 rounded-2xl"><Shield size={28} className="text-white" /></div><div><h2 className="font-bold text-xl mb-1">Protección total</h2><p className="text-white/90 text-sm">Tus pagos se gestionan con una experiencia clara, protegida y pensada para generar confianza.</p></div></div>
          <div className="grid grid-cols-2 gap-3"><div className="bg-white/10 rounded-2xl p-3 border border-white/20"><CheckCircle size={18} className="mb-1" /><p className="text-sm font-semibold">SSL seguro</p></div><div className="bg-white/10 rounded-2xl p-3 border border-white/20"><CheckCircle size={18} className="mb-1" /><p className="text-sm font-semibold">Anti fraude</p></div></div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <SectionHeader
          title="Tus métodos"
          subtitle="El alta de métodos todavía no está disponible desde la app."
          action={
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                toast("Pagos aún no disponible", {
                  description:
                    "Vamos a habilitar esta sección cuando el flujo de pagos esté conectado de punta a punta.",
                })
              }
              icon={<Plus size={16} />}
            >
              Aún no disponible
            </Button>
          }
          className="mb-4"
        />
        <SurfaceCard tone="soft" padding="sm" className="mb-4 text-sm leading-relaxed text-[var(--app-text-muted)] shadow-none">
          Por ahora changa no procesa ni guarda medios de pago desde esta pantalla. Cuando el flujo
          esté disponible, vas a ver acá métodos, cobros y movimientos reales.
        </SurfaceCard>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className={`rounded-[28px] bg-gradient-to-br ${method.colorClass} p-6 text-white shadow-[0_18px_36px_rgba(17,24,39,0.14)]`}>
              <div className="mb-8 flex items-start justify-between">
                <div>
                  {method.isDefault ? (
                    <Badge variant="success" icon={<CheckCircle size={10} />}>
                      Principal
                    </Badge>
                  ) : (
                    <p className="text-sm text-white/80">Secundaria</p>
                  )}
                </div>
                <CreditCard size={32} className="text-white/80" />
              </div>
              <p className="mb-2 text-2xl font-bold tracking-wider">•••• {method.last4}</p>
              <div className="flex items-center justify-between text-sm">
                <p className="text-white/80">{method.type}</p>
                <p className="font-semibold">{method.expiry}</p>
              </div>
            </div>
          ))}
          {paymentMethods.length === 0 ? (
            <SurfaceCard className="text-center text-sm text-[var(--app-text-muted)]" padding="lg">
              Todavía no hay métodos de pago disponibles para gestionar desde la app.
            </SurfaceCard>
          ) : null}
        </div>
      </div>

      <div className="px-6 mb-6">
        <SurfaceCard padding="md" className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-3"><Lock size={24} className="text-blue-600" /></div>
            <p className="text-sm text-[var(--app-text-muted)]">Encriptación SSL para proteger tus datos.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[var(--app-brand-soft)] p-3"><Shield size={24} className="text-[var(--app-brand)]" /></div>
            <p className="text-sm text-[var(--app-text-muted)]">Garantía de devolución en casos cubiertos.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-violet-50 p-3"><Smartphone size={24} className="text-violet-600" /></div>
            <p className="text-sm text-[var(--app-text-muted)]">Verificación adicional en transacciones sensibles.</p>
          </div>
        </SurfaceCard>
      </div>

      <div className="px-6 space-y-3">
        <SectionHeader title="Movimientos" subtitle="Aparecerán cuando pagos esté habilitado y haya actividad real." className="mb-4" />
        {transactions.map((tx) => {
          const job = jobs.find((item) => item.id === tx.jobId);
          const statusBadge =
            tx.status === "pagado"
              ? { variant: "success" as const, label: "Pagado" }
              : tx.status === "pendiente"
                ? { variant: "pending" as const, label: "Pendiente" }
                : { variant: "info" as const, label: "Reintegrado" };
          return (
            <SurfaceCard key={tx.id} padding="md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-base font-bold tracking-[-0.02em] text-[var(--app-text)]">
                    {job?.title ?? "Trabajo"}
                  </h3>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    {new Date(tx.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                <p className="text-lg font-bold text-[var(--app-text)]">{tx.amountLabel}</p>
              </div>
              <Badge variant={statusBadge.variant} icon={<CheckCircle size={12} />}>
                {statusBadge.label}
              </Badge>
            </SurfaceCard>
          );
        })}
        {transactions.length === 0 ? (
          <SurfaceCard className="text-center text-sm text-[var(--app-text-muted)]" padding="lg">
            Todavía no hay movimientos. Cuando empieces a cerrar changas y pagos, el historial va a aparecer acá.
          </SurfaceCard>
        ) : null}
      </div>
    </div>
  );
}
