import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { supabase } from "@/integrations/supabase/client";
import { requestNotificationPermission } from "@/utils/notifications";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('site_statistics')
          .update({
            page_views: supabase.rpc('increment', { column_name: 'page_views' }),
            unique_visitors: supabase.rpc('increment', { column_name: 'unique_visitors' })
          })
          .eq('id', 1);

        if (error) {
          console.error("Error updating site statistics:", error);
        }
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