const state = {
  startedAt: new Date().toISOString(),
  bootstrap: {
    ready: false,
    attempts: 0,
    lastError: null,
    lastSuccessAt: null
  }
};

export function markBootstrapAttempt() {
  state.bootstrap.attempts += 1;
}

export function markBootstrapReady() {
  state.bootstrap.ready = true;
  state.bootstrap.lastError = null;
  state.bootstrap.lastSuccessAt = new Date().toISOString();
}

export function markBootstrapError(error) {
  state.bootstrap.ready = false;
  state.bootstrap.lastError = error?.message || String(error);
}

export function getRuntimeState() {
  return state;
}
