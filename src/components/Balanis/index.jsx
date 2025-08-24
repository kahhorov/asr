import React, { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { daily, weekly, monthly, yearly, chartData } = useMemo(() => {
    let daily = 0,
      weekly = 0,
      monthly = 0,
      yearly = 0;

    const chartMap = new Map(); // graf uchun
    const chartData = [];

    cartAccordions
      .filter((item) => item.status === "to'langan")
      .forEach((item) => {
        if (!item.createdAt || !item.price) return;
        const d = new Date(item.createdAt);
        const price = Number(item.price) || 0;

        const diffMs = now - d;
        const diffDays = diffMs / (1000 * 60 * 60 * 24); // kun
        const diffWeeks = diffDays / 7;
        const diffMonths =
          now.getFullYear() * 12 +
          now.getMonth() -
          (d.getFullYear() * 12 + d.getMonth());

        // 🔹 1 kunlik: faqat bugungi kun, else haftalikga qo‘shish
        if (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        ) {
          daily += price;
        }

        // 🔹 Haftalik: oxirgi 7 kun
        if (diffDays < 7) {
          weekly += price;
        } else if (diffDays >= 7 && diffDays < 30) {
          monthly += price; // 7 kundan keyin haftalik oylikka qo‘shiladi
        }

        // 🔹 Oylik: oxirgi 30 kun
        if (diffDays < 30) {
          monthly += price;
        } else if (diffDays >= 30 && diffMonths < 12) {
          yearly += price; // 1 oydan keyin yillikka qo‘shiladi
        }

        // 🔹 Yillik
        if (diffMonths < 12) yearly += price;

        // 🔹 Grafik (kunlik savdo)
        const dayKey = d.toLocaleDateString("uz-UZ");
        chartMap.set(dayKey, (chartMap.get(dayKey) || 0) + price);
      });

    // Mapni chartData ga o‘tkazish
    chartMap.forEach((sum, day) => chartData.push({ day, sum }));
    chartData.sort((a, b) => new Date(a.day) - new Date(b.day));

    return { daily, weekly, monthly, yearly, chartData };
  }, [cartAccordions, now]);

  const cardProps = {
    sx: {
      boxShadow: 3,
      borderRadius: 3,
      p: isMobile ? 1.5 : 2,
      textAlign: "center",
      userSelect: "none",
      cursor: "default",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: 6,
      },
    },
  };

  const fontSizeH6 = isMobile ? "1rem" : "1.2rem";
  const fontSizeH4 = isMobile ? "1rem" : "2rem";

  return (
    <Box sx={{ padding: isMobile ? 1.5 : 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          textAlign: "start",
          fontWeight: 700,
          mb: isMobile ? 2 : 3,
          userSelect: "none",
        }}
      >
        📊 Savdo statistikasi
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Bugungi savdo", value: daily, color: "#e9f2f8" },
          { label: "Haftalik savdo", value: weekly, color: "#e3f2fd" },
          { label: "Oylik savdo", value: monthly, color: "#fff3e0" },
          { label: "Yillik savdo", value: yearly, color: "#fce4ec" },
        ].map((item, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={3}>
            <Card
              {...cardProps}
              sx={{ ...cardProps.sx, backgroundColor: item.color }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontSize: fontSizeH6, mb: 1 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: fontSizeH4 }}
                >
                  {item.value.toLocaleString()} so‘m
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          p: isMobile ? 1.5 : 2,
          boxShadow: 3,
          borderRadius: 3,
          userSelect: "none",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ mb: isMobile ? 1 : 2, fontWeight: 600 }}
        >
          📈 Kunlik savdo grafigi
        </Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 10 : 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ stroke: "transparent" }} />
            <Line
              type="monotone"
              dataKey="sum"
              stroke="#1976d2"
              strokeWidth={3}
              dot={{ r: isMobile ? 2 : 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}

export default Balanis;
