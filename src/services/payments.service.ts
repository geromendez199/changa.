import { paymentMethods as mockMethods, transactions as mockTransactions } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { PaymentMethod, Transaction } from "../types/domain";
import { PaymentMethodsRow, TransactionsRow, mapPaymentMethodRow, mapTransactionRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export async function getPaymentMethods(userId: string): Promise<ServiceResult<PaymentMethod[]>> {
  if (shouldUseFallback()) {
    return { data: mockMethods, source: "fallback" };
  }

  try {
    const { data, error } = await supabase!.from("payment_methods").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;

    const mapped = (data as PaymentMethodsRow[]).map(mapPaymentMethodRow);
    return mapped.length ? { data: mapped, source: "supabase" } : { data: mockMethods, source: "fallback" };
  } catch (error) {
    return { data: mockMethods, source: "fallback", error: normalizeError(error) };
  }
}

export async function getTransactions(userId: string): Promise<ServiceResult<Transaction[]>> {
  if (shouldUseFallback()) {
    return { data: mockTransactions, source: "fallback" };
  }

  try {
    const { data, error } = await supabase!.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;

    const mapped = (data as TransactionsRow[]).map(mapTransactionRow);
    return mapped.length ? { data: mapped, source: "supabase" } : { data: mockTransactions, source: "fallback" };
  } catch (error) {
    return { data: mockTransactions, source: "fallback", error: normalizeError(error) };
  }
}
