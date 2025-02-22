"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforecreated = void 0;
import { beforeUserCreated, HttpsError } from "firebase-functions/v2/identity";
import { logger } from "firebase-functions/logger";

function isAllowed(email) {
    if (!email) {
        return false;
    }
    const allowedValues = [
        '@mechanical-orchard.com',
        'scottmuc@gmail.com',
        'wendy@castlelaing.com',
        'mrdavidlaing@gmail.com'
    ];
    for (const allowed of allowedValues) {
        if (email.includes(allowed)) {
            return true;
        }
    }
    return false;
}
exports.beforecreated = beforeUserCreated((event) => {
    const user = event.data;
    if (!isAllowed(user === null || user === void 0 ? void 0 : user.email)) {
        logger.info("Blocking registration because email isn't from recognised domain", { user: user });
        throw new HttpsError('invalid-argument', "Registration blocked because email isn't from recognised domain");
    }
});
//# sourceMappingURL=index.js.map