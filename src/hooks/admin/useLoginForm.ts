"use client";

import { signIn } from "@/services/admin/actions/auth";
import { useAdminForm } from "./useAdminForm";

export function useLoginForm() {
  return useAdminForm(signIn);
}
