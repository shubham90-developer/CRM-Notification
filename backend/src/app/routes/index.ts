import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { roleRouter } from "../modules/role/role.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { generalSettingsRouter } from "../modules/general-settings/general-settings.routes";
import { menuMasterRouter } from "../modules/menuMaster/menuMaster.routes";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },

  {
    path: "/menu-category",
    route: menuMasterRouter,
  },
  {
    path: "/roles",
    route: roleRouter,
  },

  {
    path: "/general-settings",
    route: generalSettingsRouter,
  },
  {
    path: "/upload",
    route: uploadRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
