import type { NextFunction, Request, Response } from "express";
import { supabase } from "./supabase";

export type Role = "admin" | "viewer";

export interface AuthUser {
  id: string;
  email: string | null;
  role: Role;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

// Check the Supabase access token and load the user's role.
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  req.user = {
    id: data.user.id,
    email: data.user.email ?? null,
    role: profile?.role === "admin" ? "admin" : "viewer",
  };
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
};
