import { supabase } from "../lib/supabase";
import { PaymentMethod, Transaction } from "../types/domain";
import { PaymentMethodsRow, TransactionsRow, mapPaymentMethodRow, mapTransactionRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export async function getPaymentMethods(userId: string): Promise<ServiceResult<PaymentMethod[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!.from("payment_methods").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;

    return { data: (data as PaymentMethodsRow[]).map(mapPaymentMethodRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}

export async function getTransactions(userId: string): Promise<ServiceResult<Transaction[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;

    return { data: (data as TransactionsRow[]).map(mapTransactionRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}
