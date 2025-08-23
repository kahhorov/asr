import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Box,
  Divider,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

function Masters({ handleAddToCart }) {
  const [accordions, setAccordions] = useState(() => {
    const saved = localStorage.getItem("mastersAccordions");
    return saved ? JSON.parse(saved) : [];
  });
  const [openModal, setOpenModal] = useState(false);
  const [newMaster, setNewMaster] = useState("");
  const [sending, setSending] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusPendingAcc, setStatusPendingAcc] = useState(null);

  // localStorage'dan yuklash

  // localStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem("mastersAccordions", JSON.stringify(accordions));
  }, [accordions]);

  // Modal ochish-yopish
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setNewMaster("");
    setOpenModal(false);
  };

  // Usta qo‘shish
  const addMaster = () => {
    if (!newMaster.trim()) return alert("Ism kiriting!");
    const newAcc = {
      id: Date.now(),
      name: newMaster,
      chatId: "",
      products: [],
      notes: "",
    };
    setAccordions((prev) => [...prev, newAcc]);
    setNewMaster("");
    setOpenModal(false);
  };

  // Mahsulot qo‘shish
  const addProduct = (id, name, price) => {
    if (!name.trim()) return alert("Mahsulot nomini kiriting!");
    if (!String(price).trim()) return alert("Narx kiriting!");
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              products: [...acc.products, { name, price }],
            }
          : acc
      )
    );

    // inputlarni tozalash
    document.getElementById(`name-${id}`).value = "";
    document.getElementById(`price-${id}`).value = "";
  };

  // Barchasini o‘chirish (products va izoh)
  const clearProducts = (id) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, products: [], notes: "" } : acc
      )
    );
  };

  // Telegramga yuborish
  const handleSendToTelegram = async (acc) => {
    if (sending) return;
    setSending(true);
    try {
      if (!acc.chatId.trim()) return alert("Chat ID kiritilmagan!");
      if (acc.products.length === 0)
        return alert("Hech qanday mahsulot qo‘shilmagan!");

      let msg = "";
      if (acc.products.length)
        msg += acc.products
          .map((p, i) => `${i + 1}. ${p.name}\nNarxi: ${p.price}.000`)
          .join("\n\n");
      if (acc.notes?.trim()) msg += "\n\nIzoh:\n" + acc.notes.trim();

      const res = await fetch("https://server-srsc.onrender.com/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUser: acc.chatId.trim(), message: msg }),
      });
      if (!res.ok) throw new Error("Server error");

      // Yuborilgandan keyin status modali
      const clone = JSON.parse(JSON.stringify(acc));
      setStatusPendingAcc(clone);
      setStatusModalOpen(true);
    } catch (_e) {
      alert("Xatolik yuz berdi!");
    } finally {
      setSending(false);
    }
  };

  // Holat tanlash → App.js dagi cartAccordions ga qo‘shish
  const handleStatusSelect = (status) => {
    if (!statusPendingAcc) return;
    const payload = {
      id: Date.now(),
      master: statusPendingAcc.name,
      chatId: statusPendingAcc.chatId,
      products: statusPendingAcc.products,
      notes: statusPendingAcc.notes,
      status,
    };
    handleAddToCart(payload);
    setStatusModalOpen(false);
    setStatusPendingAcc(null);
  };

  return (
    <Box p={2}>
      {/* Ustalar accordionlari */}
      {accordions.map((acc) => (
        <Accordion key={acc.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{acc.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Chat ID */}
            <TextField
              fullWidth
              label="Telegram username yoki Chat ID"
              value={acc.chatId}
              onChange={(e) =>
                setAccordions((prev) =>
                  prev.map((a) =>
                    a.id === acc.id ? { ...a, chatId: e.target.value } : a
                  )
                )
              }
              sx={{ mb: 2 }}
            />

            {/* Mahsulotlar ro‘yxati */}
            {acc.products.map((p, i) => (
              <Box key={i} mb={1}>
                <Typography>
                  {i + 1}. {p.name} — {p.price}.000 so‘m
                </Typography>
              </Box>
            ))}

            {/* Mahsulot inputlari */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems="stretch"
              sx={{ mb: 2, mt: 4 }}
            >
              <TextField
                label="Mahsulot nomi"
                id={`name-${acc.id}`}
                size="small"
              />
              <TextField
                label="Narxi"
                id={`price-${acc.id}`}
                size="small"
                type="number"
              />

              {/* Umumiy izoh */}
              <TextField
                fullWidth
                label="Umumiy izoh (ixtiyoriy)"
                value={acc.notes}
                onChange={(e) =>
                  setAccordions((prev) =>
                    prev.map((a) =>
                      a.id === acc.id ? { ...a, notes: e.target.value } : a
                    )
                  )
                }
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={() =>
                  addProduct(
                    acc.id,
                    document.getElementById(`name-${acc.id}`).value,
                    document.getElementById(`price-${acc.id}`).value
                  )
                }
              >
                Qo‘shish
              </Button>
            </Stack>

            {/* Tugmalar */}
            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="contained"
              sx={{ mb: 1 }}
              onClick={() => handleSendToTelegram(acc)}
              disabled={sending}
            >
              {sending ? "Yuborilmoqda..." : "Telegramga yuborish"}
            </Button>
            <Button
              fullWidth
              color="error"
              variant="outlined"
              onClick={() => clearProducts(acc.id)}
            >
              Barchasini o‘chirish
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={handleOpen}
        sx={{ position: "fixed", bottom: 20, right: 20 }}
      >
        <AddIcon />
      </Fab>

      {/* Usta qo‘shish modali */}
      <Dialog open={openModal} onClose={handleClose}>
        <DialogTitle>Usta ismini kiriting</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ism"
            value={newMaster}
            onChange={(e) => setNewMaster(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Bekor qilish</Button>
          <Button onClick={addMaster} variant="contained">
            Qo‘shish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Holatni tanlash modali */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <DialogTitle>Holatini belgilang</DialogTitle>
        <DialogContent>
          <Typography>
            Telegramga yuborildi. Ushbu yozuvni qaysi bo‘limga qo‘shamiz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="success"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => handleStatusSelect("to'langan")}
          >
            To‘langan
          </Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<CloseIcon />}
            onClick={() => handleStatusSelect("to'lanmagan")}
          >
            To‘lanmagan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Masters;
