import { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { initiatePayment, logPaymentInitiated, logError } from '@/lib/edge-functions';
import { Button } from './Button';
import { SurfaceCard } from './SurfaceCard';

interface PaymentInitiatorProps {
  jobId: string;
  amount: number;
  currency?: string;
  onPaymentInitiated?: (clientSecret: string, correlationId: string) => void;
}

export function PaymentInitiator({
  jobId,
  amount,
  currency = 'USD',
  onPaymentInitiated,
}: PaymentInitiatorProps) {
  const [isInitiating, setIsInitiating] = useState(false);

  const handleInitiatePayment = async () => {
    if (amount <= 0) {
      toast.error('Monto inválido', { description: 'El monto debe ser mayor a 0' });
      return;
    }

    setIsInitiating(true);
    try {
      const payment = await initiatePayment({
        jobId,
        amount,
        currency,
      });

      await logPaymentInitiated(jobId, amount, payment.correlationId);

      toast.success('Pago iniciado', {
        description: 'Redirigiendo a la pasarela de pagos...',
      });

      onPaymentInitiated?.(payment.client_secret, payment.correlationId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar el pago';
      toast.error('No pudimos iniciar el pago', { description: errorMessage });
      await logError('Payment initiation failed', error, jobId);
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <SurfaceCard padding="lg" className="space-y-4">
      <div>
        <h3 className="mb-2 text-base font-semibold text-[var(--app-text)]">Información de pago</h3>
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Los pagos se procesan de forma segura con Stripe.</p>
              <p className="mt-1 text-blue-800">Tu información financiera está protegida con encriptación SSL.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-[var(--app-surface-muted)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--app-text-muted)]">Monto</span>
          <span className="text-lg font-bold text-[var(--app-text)]">
            {currency === 'USD' ? '$' : ''}{amount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--app-text-muted)]">Moneda</span>
          <span className="text-sm font-medium text-[var(--app-text)]">{currency}</span>
        </div>
      </div>

      <Button
        fullWidth
        disabled={isInitiating}
        onClick={() => void handleInitiatePayment()}
        icon={<CreditCard size={16} />}
      >
        {isInitiating ? 'Procesando...' : 'Proceder con el pago'}
      </Button>
    </SurfaceCard>
  );
}
