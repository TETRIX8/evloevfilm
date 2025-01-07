import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { supabase } from "@/integrations/supabase/client";
import { requestNotificationPermission } from "@/utils/notifications";
import { toast } from "sonner";

export function AppInitializer() {
  useEffect(() => {
    const initializeApp = async () => {
      // Request notification permission
      if (!localStorage.getItem("notificationPermission")) {
        const granted = await requestNotificationPermission();
        if (granted) {
          toast.success("Уведомления включены");
        }
      }

      // Update site statistics
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // First get the statistics record
          const { data: statsData, error: fetchError } = await supabase
            .from('site_statistics')
            .select('*')
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error("Error fetching site statistics:", fetchError);
            return;
          }

          if (statsData) {
            // Then update it
            const { error: updateError } = await supabase
              .from('site_statistics')
              .update({
                page_views: (statsData.page_views || 0) + 1,
                unique_visitors: (statsData.unique_visitors || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', statsData.id);

            if (updateError) {
              console.error("Error updating site statistics:", updateError);
            }
          }
        }
      } catch (error) {
        console.error("Error in initializeApp:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}