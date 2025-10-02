import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing AbortController for API requests
 * Automatically cleans up on component unmount
 */
export function useAbortController() {
    const abortControllerRef = useRef<AbortController | null>(null);

    // Create new abort controller
    const createAbortController = useCallback(() => {
        // Abort previous controller if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort('New request initiated');
        }

        abortControllerRef.current = new AbortController();
        return abortControllerRef.current;
    }, []);

    // Get current abort signal
    const getSignal = useCallback(() => {
        abortControllerRef.current ??= new AbortController();
        return abortControllerRef.current.signal;
    }, []);

    // Abort current request
    const abort = useCallback((reason?: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(reason || 'Request cancelled');
            abortControllerRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort('Component unmounted');
            }
        };
    }, []);

    return {
        createAbortController,
        getSignal,
        abort,
    };
}

/**
 * Hook for managing multiple concurrent requests with individual abort controllers
 */
export function useAbortControllers() {
    const controllersRef = useRef<Map<string, AbortController>>(new Map());

    // Create abort controller with ID
    const createAbortController = useCallback((id: string) => {
        // Abort existing controller with same ID
        const existing = controllersRef.current.get(id);
        if (existing) {
            existing.abort('Replaced by new request');
        }

        const controller = new AbortController();
        controllersRef.current.set(id, controller);
        return controller;
    }, []);

    // Get signal for specific ID
    const getSignal = useCallback((id: string) => {
        let controller = controllersRef.current.get(id);
        if (!controller) {
            controller = new AbortController();
            controllersRef.current.set(id, controller);
        }
        return controller.signal;
    }, []);

    // Abort specific request
    const abort = useCallback((id: string, reason?: string) => {
        const controller = controllersRef.current.get(id);
        if (controller) {
            controller.abort(reason || 'Request cancelled');
            controllersRef.current.delete(id);
        }
    }, []);

    // Abort all requests
    const abortAll = useCallback((reason?: string) => {
        controllersRef.current.forEach((controller, id) => {
            controller.abort(reason || 'All requests cancelled');
        });
        controllersRef.current.clear();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            controllersRef.current.forEach((controller) => {
                controller.abort('Component unmounted');
            });
            controllersRef.current.clear();
        };
    }, []);

    return {
        createAbortController,
        getSignal,
        abort,
        abortAll,
        getActiveCount: () => controllersRef.current.size,
    };
}
