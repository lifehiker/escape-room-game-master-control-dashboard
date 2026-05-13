import { MembershipRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      activeVenueId?: string | null;
      role?: MembershipRole | null;
    };
  }

  interface User {
    activeVenueId?: string | null;
  }
}
