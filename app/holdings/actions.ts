"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteHolding,
  holdingFormSchema,
  upsertHolding,
} from "@/lib/holdings";

export async function saveHoldingAction(formData: FormData) {
  const parsedInput = holdingFormSchema.parse({
    holdingId: formData.get("holdingId") || undefined,
    fundCode: formData.get("fundCode"),
    units: formData.get("units"),
    averageCost: formData.get("averageCost"),
    purchaseDate: formData.get("purchaseDate"),
    note: formData.get("note") || undefined,
  });

  await upsertHolding(parsedInput);

  revalidatePath("/holdings");
  revalidatePath(`/funds/${parsedInput.fundCode}`);
  redirect("/holdings");
}

export async function deleteHoldingAction(formData: FormData) {
  const id = formData.get("id");

  await deleteHolding(String(id));

  revalidatePath("/holdings");
  redirect("/holdings");
}
