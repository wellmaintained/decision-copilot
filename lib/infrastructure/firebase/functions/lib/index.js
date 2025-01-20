"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforecreated = void 0;
const identity_1 = require("firebase-functions/v2/identity");
const logger = require("firebase-functions/logger");
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
exports.beforecreated = (0, identity_1.beforeUserCreated)((event) => {
    const user = event.data;
    if (!isAllowed(user === null || user === void 0 ? void 0 : user.email)) {
        logger.info("Blocking registration because email isn't from recognised domain", { user: user });
        throw new identity_1.HttpsError('invalid-argument', "Registration blocked because email isn't from recognised domain");
    }
});
//# sourceMappingURL=index.js.map