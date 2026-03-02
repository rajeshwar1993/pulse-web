"use server";

import { revalidatePath } from "next/cache";

export async function revalidateProfilePages() {
  revalidatePath("/appview/dashboard");
  revalidatePath("/appview/settings");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
