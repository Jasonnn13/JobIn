import { z } from "zod";
import { defineAction, type MiniApp } from "../types";

const viewProfile = defineAction({
  description: "Open the user's own profile page.",
  params: z.object({}),
  keywords: ["profile", "my profile", "profil", "profil saya"],
  announce: () => "Opening your profile",
  run: (_, ctx) => ctx.navigate("/profile"),
});

const editProfile = defineAction({
  description: "Open the form to edit the user's profile, such as name, phone, skills, or photo.",
  params: z.object({}),
  keywords: ["edit profile", "change my profile", "update profile", "edit profil", "ubah profil"],
  announce: () => "Opening edit profile",
  run: (_, ctx) => ctx.navigate("/edit-profile"),
});

export const accountMiniApp: MiniApp = {
  id: "account",
  name: "Account",
  actions: { viewProfile, editProfile },
};
