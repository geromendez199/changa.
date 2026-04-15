import { supabase } from "../lib/supabase";
import { PaymentMethod, Transaction } from "../types/domain";
import { PaymentMethodsRow, TransactionsRow, mapPaymentMethodRow, mapTransactionRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export async function getPaymentMethods(userId: string): Promise<ServiceResult<PaymentMethod[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResult(
      toSafeArray<Partial<PaymentMethodsRow>>(data)
        .map(mapPaymentMethodRow)
        .filter((method) => isNonEmptyString(method.id)),
    );
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus métodos de pago."));
  }
}

export async function getTransactions(userId: string): Promise<ServiceResult<Transaction[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResult(
      toSafeArray<Partial<TransactionsRow>>(data)
        .map(mapTransactionRow)
        .filter((tx) => isNonEmptyString(tx.id)),
    );
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar los movimientos."));
  }
}
