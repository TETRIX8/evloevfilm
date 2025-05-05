
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { supabase } from "@/integrations/supabase/client";
import { requestNotificationPermission, scheduleNotification } from "@/utils/notifications";
import { toast } from "sonner";

export function AppInitializer() {
  useEffect(() => {
    const initializeApp = async () => {
      // Request notification permission
      if (!localStorage.getItem("notificationPermission")) {
        const granted = await requestNotificationPermission();
        if (granted) {
          toast.success("Уведомления включены");
          // Schedule daily notification at 12:15 MSK
          scheduleNotification();
        }
      } else if (localStorage.getItem("notificationPermission") === "granted") {
        // If permission was already granted, schedule notification
        scheduleNotification();
      }

      // Set up auth state listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Clear any stored auth data
          localStorage.removeItem('supabase.auth.token');
        } else if (event === 'SIGNED_IN' && session) {
          try {
            // Update site statistics
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
          } catch (error) {
            console.error("Error in initializeApp:", error);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeApp();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
