"use strict";

(function () {
  if (window.GameThreadSDK) return;

  const context = {
    mode: "fun",
    sessionId: null,
    gameId: null,
    reported: false,
    initialized: false
  };

  // Auto-listener for platform initialization
  window.addEventListener("message", (e) => {
    if (e.data?.type === "INIT_GAME") {
      context.mode = e.data.mode || "fun";
      context.sessionId = e.data.sessionId || null;
      context.gameId = e.data.gameId || context.gameId; // Use provided ID or fallback
      context.initialized = true;
      console.log(`[GametSDK] Initialized: ${context.gameId} (${context.mode})`);
    }
  });

  function init(gameId) {
    if (context.initialized && context.gameId) return; // Already initialized by message
    context.gameId = gameId;
  }

  function reportGameOver({ score, distance = 0, ...extraStats }) {
    if (context.reported) return;
    context.reported = true;

    if (!window.parent || window.parent === window) {
      console.warn("[GametSDK] No parent window found for reporting.");
      return;
    }

    window.parent.postMessage(
      {
        type: "GAME_OVER",
        gameId: context.gameId,
        mode: context.mode,
        sessionId: context.sessionId,
        score,
        distance,
        ...extraStats
      },
      "*"
    );
  }

  function reportScoreUpdate(score) {
    if (!window.parent || window.parent === window) return;
    window.parent.postMessage(
      {
        type: "SCORE_UPDATE",
        gameId: context.gameId,
        sessionId: context.sessionId,
        score,
      },
      "*"
    );
  }

  function reportGameStarted() {
    if (!window.parent || window.parent === window) return;
    window.parent.postMessage(
      {
        type: "GAME_STARTED",
        gameId: context.gameId,
        sessionId: context.sessionId
      },
      "*"
    );
  }

  window.GameThreadSDK = {
    init,
    reportGameOver,
    reportScoreUpdate,
    reportGameStarted,
  };
})();
