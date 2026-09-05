import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuraEvent } from '~/lib/aura';
import { toast } from '@aura/ui';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '~/constants';
import type { plans } from '~/constants/subscriptions';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  XCircle,
} from 'lucide-react';

type Plan = (typeof plans)[0];

interface CheckoutProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan;
  projectId: number;
  isYearly: boolean;
  onSuccess: () => void;
}

type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'waitingPayment'
  | 'waitingAuthorization'
  | 'inProgress'
  | 'completed'
  | 'failed';

const CRYPTO_OPTIONS = [
  { value: 'eth', label: 'ETH' },
  { value: 'btc', label: 'BTC' },
  { value: 'usdt', label: 'USDT' },
  { value: 'bnb', label: 'BNB' },
  { value: 'usdc', label: 'USDC' },
];

const TERMINAL = new Set(['completed', 'failed']);

async function getToken(): Promise<string> {
  const token = await getAuth().currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

export function PaymentCheckout({
  open,
  onOpenChange,
  plan,
  projectId,
  isYearly,
  onSuccess,
}: CheckoutProps) {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const [tab, setTab] = useState<'hosted' | 'crypto'>('hosted');
  const dialogRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLElement>(null);

  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [selectedCrypto, setSelectedCrypto] = useState('eth');
  const [cryptoLoading, setCryptoLoading] = useState(false);

  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [polling, setPolling] = useState(false);

  const reset = useCallback(() => {
    setInvoiceLoading(false);
    setWidgetUrl(null);
    setOrderId(null);
    setCryptoLoading(false);
    setStatus('idle');
    setPolling(false);
  }, []);

  useAuraEvent<{ open: boolean }>(dialogRef, 'open-change', (e) => {
    if (!e.open) reset();
    onOpenChange(e.open);
  });
  useAuraEvent<{ value: string }>(tabsRef, 'change', (e) =>
    setTab(e.value as 'hosted' | 'crypto'),
  );

  useEffect(() => {
    if (!orderId || !polling) return;
    if (TERMINAL.has(status)) return;

    const id = setInterval(async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get<{ status: PaymentStatus }>(
          `${API_BASE_URL}/api/payments/status/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setStatus(data.status);

        if (data.status === 'completed') {
          setPolling(false);
          clearInterval(id);

          const token2 = await getToken();
          await axios.post(
            `${API_BASE_URL}/api/projects/upgrade-project`,
            { planId: plan.id, projectId, orderId, isYearly },
            { headers: { Authorization: `Bearer ${token2}` } },
          );

          onSuccess();
          toast.success('Subscription activated!', {
            description: `You are now on the ${plan.name} plan.`,
          });
        } else if (data.status === 'failed') {
          setPolling(false);
          clearInterval(id);
        }
      } catch {
        // silent — keep polling
      }
    }, 5000);

    return () => clearInterval(id);
  }, [orderId, polling, status, plan, projectId, isYearly, onSuccess]);

  const createInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const token = await getToken();
      const successUrl = `${window.location.origin}/dashboard/projects/${projectId}/upgrade`;
      const cancelUrl = window.location.href;

      const { data } = await axios.post<{ orderId: string; widgetUrl: string }>(
        `${API_BASE_URL}/api/payments/create-invoice`,
        {
          projectId,
          planId: plan.id,
          amount: price,
          isYearly,
          successUrl,
          cancelUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrderId(data.orderId);
      setWidgetUrl(data.widgetUrl);
      setStatus('waitingPayment');
      setPolling(true);

      window.open(data.widgetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to create invoice. Please try again.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const createCryptoPayment = async () => {
    setCryptoLoading(true);
    try {
      const token = await getToken();
      const successUrl = `${window.location.origin}/dashboard/projects/${projectId}/upgrade`;
      const cancelUrl = window.location.href;

      const { data } = await axios.post<{
        orderId: string;
        widgetUrl: string;
        currencyCode: string;
      }>(
        `${API_BASE_URL}/api/payments/create-payment`,
        {
          projectId,
          planId: plan.id,
          amount: price,
          currencyCode: selectedCrypto,
          isYearly,
          successUrl,
          cancelUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrderId(data.orderId);
      setWidgetUrl(data.widgetUrl);
      setStatus('waitingPayment');
      setPolling(true);

      window.open(data.widgetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to create payment. Please try again.');
    } finally {
      setCryptoLoading(false);
    }
  };

  return (
    <a-dialog open={open} ref={dialogRef}>
      <div slot="content" className="sm:max-w-md">
        <div className="flex flex-col gap-1.5">
          <a-head level="3">Upgrade to {plan.name}</a-head>
          <a-text variant="muted">
            ${price}/{isYearly ? 'year' : 'month'} ·{' '}
            {plan.tokens.toLocaleString()} verifications
          </a-text>
        </div>

        {status !== 'idle' && <StatusBanner status={status} />}

        {status === 'completed' && (
          <a-button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </a-button>
        )}

        {status === 'failed' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your payment did not complete. You can try again.
            </p>
            <a-button variant="secondary" className="w-full" onClick={reset}>
              Try again
            </a-button>
          </div>
        )}

        {status === 'idle' && (
          <a-tabs value={tab} ref={tabsRef} className="w-full">
            <a-tab value="hosted">Card / Any Crypto</a-tab>
            <a-tab value="crypto">Direct Crypto</a-tab>

            <a-tab-panel slot="panel" value="hosted" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Opens a secure MoonPay page. Accepts cards and 100+
                cryptocurrencies.
              </p>
              <a-button
                className="w-full"
                onClick={createInvoice}
                disabled={invoiceLoading}
              >
                {invoiceLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    invoice…
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" /> Pay ${price} →
                  </>
                )}
              </a-button>
            </a-tab-panel>

            <a-tab-panel slot="panel" value="crypto" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Opens a MoonPay page pre-selected to your chosen currency.
              </p>
              <div className="flex flex-wrap gap-2">
                {CRYPTO_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCrypto(c.value)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                      selectedCrypto === c.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <a-button
                className="w-full"
                onClick={createCryptoPayment}
                disabled={cryptoLoading}
              >
                {cryptoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening
                    MoonPay…
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" /> Pay with{' '}
                    {selectedCrypto.toUpperCase()} →
                  </>
                )}
              </a-button>
            </a-tab-panel>
          </a-tabs>
        )}

        {!TERMINAL.has(status) && status !== 'idle' && widgetUrl && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete payment in the tab that opened. This dialog will update
              automatically.
            </p>
            <a-button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                window.open(widgetUrl, '_blank', 'noopener,noreferrer')
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Reopen MoonPay
            </a-button>
          </div>
        )}
      </div>
    </a-dialog>
  );
}

function StatusBanner({ status }: { status: PaymentStatus }) {
  const configs: Partial<
    Record<
      PaymentStatus,
      { label: string; color: string; icon: React.ReactNode }
    >
  > = {
    waitingPayment: {
      label: 'Waiting for payment',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: <Clock className="h-4 w-4" />,
    },
    pending: {
      label: 'Payment pending',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: <Clock className="h-4 w-4" />,
    },
    waitingAuthorization: {
      label: 'Awaiting authorization',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: <Clock className="h-4 w-4" />,
    },
    inProgress: {
      label: 'Payment in progress',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    completed: {
      label: 'Payment confirmed!',
      color: 'bg-primary/10 text-primary border-primary/20',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    failed: {
      label: 'Payment failed',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const cfg = configs[status];
  if (!cfg) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${cfg.color}`}
    >
      {cfg.icon}
      <span>{cfg.label}</span>
    </div>
  );
}
