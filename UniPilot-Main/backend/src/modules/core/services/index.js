import * as authService from "./authService.js";
import * as userService from "./userService.js";
import * as roleService from "./roleService.js";

export const CoreService = {
    ...authService,
    ...userService,
    ...roleService,
};

export default CoreService;
