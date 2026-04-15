import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle, Plus, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/Badge";
import { Input } from "../components/Input";
import { useAppState } from "../hooks/useAppState";

export function Payments() {
  const navigate = useNavigate();
  const { paymentMethods, transactions, jobs, addPaymentMethod } = useAppState();
  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState<"Visa" | "Mastercard" | "Mercado Pago">("Visa");
  const [last4, setLast4] = useState("");
  const [expiry, setExpiry] = useState("");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-8 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-[#111827]" /></button>
          <div className="flex-1"><h1 className="text-xl font-bold text-[#111827]">Pagos seguros</h1><p className="text-sm text-gray-500 mt-0.5">Métodos de pago y seguridad</p></div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-4 mb-4"><div className="bg-white/20 p-3 rounded-2xl"><Shield size={28} className="text-white" /></div><div><h2 className="font-bold text-xl mb-1">Protección total</h2><p className="text-white/90 text-sm">Tus pagos están encriptados y protegidos.</p></div></div>
          <div className="grid grid-cols-2 gap-3"><div className="bg-white/10 rounded-2xl p-3 border border-white/20"><CheckCircle size={18} className="mb-1" /><p className="text-sm font-semibold">SSL seguro</p></div><div className="bg-white/10 rounded-2xl p-3 border border-white/20"><CheckCircle size={18} className="mb-1" /><p className="text-sm font-semibold">Anti fraude</p></div></div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4"><div><h2 className="font-bold text-[#111827] text-lg">Tus tarjetas</h2><p className="text-sm text-gray-500 mt-0.5">Métodos de pago guardados</p></div><button onClick={() => setOpenAdd(true)} className="text-[#0DAE79] text-sm font-semibold flex items-center gap-1.5 bg-green-50 px-4 py-2 rounded-full"><Plus size={16} />Agregar</button></div>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className={`bg-gradient-to-br ${method.colorClass} rounded-3xl p-6 shadow-lg text-white`}>
              <div className="flex items-start justify-between mb-8"><div>{method.isDefault ? <Badge variant="success" icon={<CheckCircle size={10} />}>Principal</Badge> : <p className="text-white/80 text-sm">Secundaria</p>}</div><CreditCard size={32} className="text-white/80" /></div>
              <p className="text-2xl font-bold tracking-wider mb-2">•••• {method.last4}</p>
              <div className="flex items-center justify-between text-sm"><p className="text-white/80">{method.type}</p><p className="font-semibold">{method.expiry}</p></div>
            </div>
          ))}
          {paymentMethods.length === 0 && <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center text-sm text-gray-500">No tenés métodos de pago todavía.</div>}
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 space-y-4">
          <div className="flex items-start gap-4"><div className="bg-blue-50 p-3 rounded-2xl"><Lock size={24} className="text-blue-600" /></div><p className="text-sm text-gray-600">Encriptación SSL para proteger tus datos.</p></div>
          <div className="flex items-start gap-4"><div className="bg-green-50 p-3 rounded-2xl"><Shield size={24} className="text-green-600" /></div><p className="text-sm text-gray-600">Garantía de devolución en casos cubiertos.</p></div>
          <div className="flex items-start gap-4"><div className="bg-purple-50 p-3 rounded-2xl"><Smartphone size={24} className="text-purple-600" /></div><p className="text-sm text-gray-600">Verificación adicional en transacciones sensibles.</p></div>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {transactions.map((tx) => {
          const job = jobs.find((item) => item.id === tx.jobId);
          return (
            <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3"><div className="flex-1"><h3 className="font-bold text-[#111827] text-base mb-1">{job?.title ?? "Trabajo"}</h3><p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString("es-AR")}</p></div><p className="font-bold text-[#111827] text-lg">{tx.amountLabel}</p></div>
              <Badge variant="success" icon={<CheckCircle size={12} />}>Pagado</Badge>
            </div>
          );
        })}
        {transactions.length === 0 && <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center text-sm text-gray-500">No hay movimientos todavía.</div>}
      </div>

      {openAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end max-w-md mx-auto">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-bold text-[#111827]">Agregar método</h3><button onClick={() => setOpenAdd(false)}><X size={18} /></button></div>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl py-3 px-4">
              <option value="Visa">Visa</option><option value="Mastercard">Mastercard</option><option value="Mercado Pago">Mercado Pago</option>
            </select>
            <Input placeholder="Últimos 4 dígitos" value={last4} onChange={setLast4} />
            <Input placeholder="Vencimiento (MM/AA)" value={expiry} onChange={setExpiry} />
            <button onClick={() => { if (last4.length === 4 && expiry) { addPaymentMethod({ type, last4, expiry, holderName: "GERONIMO MENDEZ", isDefault: paymentMethods.length === 0 }); setOpenAdd(false); setLast4(""); setExpiry(""); } }} className="w-full bg-[#0DAE79] text-white py-3 rounded-full font-semibold disabled:bg-gray-300" disabled={last4.length !== 4 || !expiry}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}
