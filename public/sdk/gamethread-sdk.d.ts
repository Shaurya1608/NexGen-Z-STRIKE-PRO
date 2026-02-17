/**
 * GamerThred Platform SDK v2.1
 * Industry-standard SDK for integrating HTML5 games with the GamerThred platform.
 */
declare namespace GametSDK {
    /**
     * Configuration options for the SDK
     */
    interface SDKConfig {
        /**
         * Enable verbose logging for debugging integration issues.
         * Default: false (except in development environments)
         */
        debug?: boolean;
        /**
         * Optional callback fired when SDK is fully initialized and ready.
         */
        onInit?: () => void;
    }

    /**
     * Data payload for reporting match results
     */
    interface MatchResult {
        /** The final score achieved by the player */
        score: number;
        /** Total number of kills (if applicable) */
        kills?: number;
        /** Survival time in seconds (if applicable) */
        survival_time?: number;
        /** Distance traveled (if applicable) */
        distance?: number;
        /** Any custom metadata relevant to the game mode */
        [key: string]: any;
    }

    /**
     * Initialize the SDK. Must be called before any other methods.
     * @param gameId The unique identifier or key for your game on the platform.
     * @param config Optional configuration object.
     */
    function init(gameId: string, config?: SDKConfig): void;

    /**
     * Signal the start of a match/session.
     * Use this when the player actually begins gameplay (e.g. clicks "Start").
     */
    function matchStart(): void;

    /**
     * Report a live score update during gameplay.
     * Use this periodically (e.g. every few seconds or on major events) for live leaderboards.
     * @param score The current score of the player.
     */
    function reportScoreUpdate(score: number): void;

    /**
     * Alias for reportScoreUpdate.
     * @param score The current score.
     */
    function addScore(score: number): void;

    /**
     * Report the end of a match/session.
     * This finalizes the score and triggers the results screen on the platform.
     * @param data The final match results.
     */
    function matchEnd(data: MatchResult): void;

    /**
     * Alias for matchEnd.
     * @param data The final match results.
     */
    function reportGameOver(data: MatchResult): void;
}

// Expose the global variable
interface Window {
    GametSDK: typeof GametSDK;
}
