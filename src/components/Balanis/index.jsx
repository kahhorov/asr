import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Balanis({ cartAccordions }) {
  const now = new Date();

  const { daily, weekly, monthly, chartData } = useMemo(() => {
    let daily = 0,
      weekly = 0,
      monthly = 0;

    const chartData = [];

    cartAccordions
      .filter((item) => item.status === "to'langan") // ✅ faqat to'langanlar
      .forEach((item) => {
        if (!item.createdAt || !item.price) return;
        const d = new Date(item.createdAt);
        const price = Number(item.price) || 0;

        // 1 kunlik
        if (d.toDateString() === now.toDateString()) daily += price;

        // 1 haftalik
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        if (d >= oneWeekAgo) weekly += price;

        // 1 oylik
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        if (d >= oneMonthAgo) monthly += price;

        // 📊 Grafik uchun data (sana bo‘yicha)
        const dayKey = d.toLocaleDateString("uz-UZ");
        const existing = chartData.find((c) => c.day === dayKey);
        if (existing) {
          existing.sum += price;
        } else {
          chartData.push({ day: dayKey, sum: price });
        }
      });

    // Sana bo‘yicha tartiblash
    chartData.sort((a, b) => new Date(a.day) - new Date(b.day));

    return { daily, weekly, monthly, chartData };
  }, [cartAccordions, now]);

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        📊 Savdo statistikasi (faqat to‘langan)
      </Typography>

      {/* Cards */}
      <Grid container spacing={3} sx={{ marginBottom: "30px" }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ backgroundColor: "#f1f8e9", boxShadow: 3, borderRadius: 3 }}
          >
            <CardContent>
              <Typography variant="h6" color="primary">
                Bugungi savdo
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {daily.toLocaleString()} so‘m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ backgroundColor: "#e3f2fd", boxShadow: 3, borderRadius: 3 }}
          >
            <CardContent>
              <Typography variant="h6" color="primary">
                Haftalik savdo
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {weekly.toLocaleString()} so‘m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ backgroundColor: "#fff3e0", boxShadow: 3, borderRadius: 3 }}
          >
            <CardContent>
              <Typography variant="h6" color="primary">
                Oylik savdo
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {monthly.toLocaleString()} so‘m
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grafik */}
      <Card sx={{ padding: "20px", boxShadow: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          📈 Kunlik savdo grafigi
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sum"
              stroke="#1976d2"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

export default Balanis;
