// Invio delle notifiche "in background": la risposta HTTP non aspetta Twilio.
// Le promesse pendenti sono tracciate per poterle attendere (test, spegnimento pulito del server).
const pending = new Set();

function dispatch(task) {
    const promise = Promise.resolve().then(task).catch((error) => console.error('[dispatch notifica]', error?.code ?? error?.name));
    pending.add(promise);
    promise.finally(() => pending.delete(promise));
    return promise;
}

async function flushNotifications() {
    while (pending.size > 0) await Promise.all([...pending]);
}

module.exports = { dispatch, flushNotifications };
