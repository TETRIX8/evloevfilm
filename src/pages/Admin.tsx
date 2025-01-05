import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Admin() {
  const [statistics, setStatistics] = useState({ pageViews: 0, uniqueVisitors: 0 });
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const { data, error } = await supabase
      .from('site_statistics')
      .select('*')
      .single();

    if (error) {
      toast.error("Ошибка при загрузке статистики");
      return;
    }

    setStatistics({
      pageViews: data.page_views,
      uniqueVisitors: data.unique_visitors
    });
  };

  const sendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      toast.error("Заполните все поля");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(notificationTitle, {
        body: notificationMessage,
        icon: "/favicon.ico"
      });
      toast.success("Уведомление отправлено");
      setNotificationTitle("");
      setNotificationMessage("");
    } else {
      toast.error("Разрешение на отправку уведомлений не получено");
    }
  };

  const chartData = [
    { name: 'Просмотры', value: statistics.pageViews },
    { name: 'Уникальные посетители', value: statistics.uniqueVisitors }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container pt-24 pb-16">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Статистика сайта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Отправка уведомлений</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Заголовок уведомления"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Текст уведомления"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                  />
                </div>
                <Button onClick={sendNotification}>Отправить уведомление</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}