
import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Simply render children without any authentication check
  return children;
}
