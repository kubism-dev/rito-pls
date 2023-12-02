/**
 * Helpers
 */

/**
 * Throttle API calls to avoid rate limiting.
 * RITO
 * Rate Limits
 * 20 requests every 1 seconds(s)
 * 100 requests every 2 minutes(s)
 * Note that rate limits are enforced per routing value (e.g., na1, euw1, americas).
 * @param {function} func - The function to throttle.
 * @param {number} limit - The limit in milliseconds.
 * @returns {function} The throttled function.
 */

function throttlePromise(func, limit) {
    let lastCall = 0;
    let lastCallTimer;

    return function(...args) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            if (lastCall && now < lastCall + limit) {
                // Clear previous timer and set a new one
                clearTimeout(lastCallTimer);
                lastCallTimer = setTimeout(() => {
                    lastCall = now;
                    resolve(func.apply(this, args));
                }, limit - (now - lastCall));
            } else {
                lastCall = now;
                resolve(func.apply(this, args));
            }
        });
    };
}

export { throttlePromise };