
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useVisitorCount() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function trackAndGetVisitors() {
      try {
        setLoading(true);
        
        // Track the current visitor
        const { data, error: trackError } = await supabase.functions.invoke('track-visitor');
        
        if (trackError) {
          throw new Error(trackError.message);
        }
        
        if (data?.count) {
          setVisitorCount(data.count);
        }
      } catch (err) {
        console.error("Error tracking visitor:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      } finally {
        setLoading(false);
      }
    }

    trackAndGetVisitors();
  }, []);

  return { visitorCount, loading, error };
}
