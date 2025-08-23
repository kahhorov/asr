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
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

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

  // localStorage
  useEffect(() => {
    localStorage.setItem("mastersAccordions", JSON.stringify(accordions));
  }, [accordions]);

  // Usta qo‘shish modal
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setNewMaster("");
    setOpenModal(false);
  };

  const addMaster = () => {
    if (!newMaster.trim()) return alert("Ism kiriting!");
    const newAcc = {
      id: Date.now(),
      name: newMaster,
      chatId: "",
      products: [],
    };
    setAccordions((prev) => [...prev, newAcc]);
    setNewMaster("");
    setOpenModal(false);
  };

  // Mahsulot qo‘shish (izohni alohida joylaymiz)
  const addProduct = (id, name, price, note) => {
    if (!name.trim()) return alert("Mahsulot nomini kiriting!");
    if (!String(price).trim()) return alert("Narx kiriting!");

    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              products: [
                ...acc.products,
                {
                  id: Date.now(),
                  name,
                  price,
                  note: note || "",
                  isEditing: false,
                  isNoteEditing: false,
                  showFullNote: false,
                },
              ],
            }
          : acc
      )
    );

    document.getElementById(`name-${id}`).value = "";
    document.getElementById(`price-${id}`).value = "";
    document.getElementById(`note-${id}`).value = "";
  };

  const deleteProduct = (accId, productId) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.filter((p) => p.id !== productId),
            }
          : acc
      )
    );
  };

  const toggleEdit = (accId, productId) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p) =>
                p.id === productId ? { ...p, isEditing: !p.isEditing } : p
              ),
            }
          : acc
      )
    );
  };

  const toggleNoteEdit = (accId, productId) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p) =>
                p.id === productId
                  ? { ...p, isNoteEditing: !p.isNoteEditing }
                  : p
              ),
            }
          : acc
      )
    );
  };

  const deleteNote = (accId, productId) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p) =>
                p.id === productId ? { ...p, note: "" } : p
              ),
            }
          : acc
      )
    );
  };

  const toggleShowNote = (accId, productId) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p) =>
                p.id === productId ? { ...p, showFullNote: !p.showFullNote } : p
              ),
            }
          : acc
      )
    );
  };

  const updateProduct = (accId, productId, field, value) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p) =>
                p.id === productId ? { ...p, [field]: value } : p
              ),
            }
          : acc
      )
    );
  };

  // Telegram
  const handleSendToTelegram = async (acc) => {
    if (sending) return;
    setSending(true);
    try {
      if (!acc.chatId.trim()) return alert("Chat ID kiritilmagan!");
      if (acc.products.length === 0)
        return alert("Hech qanday mahsulot qo‘shilmagan!");

      let msg = acc.products
        .map(
          (p, i) =>
            `${i + 1}. ${p.name}\nNarxi: ${p.price}.000${
              p.note ? `\nIzoh: ${p.note}` : ""
            }`
        )
        .join("\n\n");

      const res = await fetch("https://server-srsc.onrender.com/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUser: acc.chatId.trim(), message: msg }),
      });
      if (!res.ok) throw new Error("Server error");

      setStatusPendingAcc(JSON.parse(JSON.stringify(acc)));
      setStatusModalOpen(true);

      setAccordions((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, products: [] } : a))
      );
    } catch (_e) {
      alert("Xatolik yuz berdi!");
    } finally {
      setSending(false);
    }
  };

  const handleStatusSelect = (status) => {
    if (!statusPendingAcc) return;
    const payload = {
      id: Date.now(),
      master: statusPendingAcc.name,
      chatId: statusPendingAcc.chatId,
      products: statusPendingAcc.products,
      status,
    };
    handleAddToCart(payload);
    setStatusModalOpen(false);
    setStatusPendingAcc(null);
  };

  return (
    <Box p={2}>
      {accordions.map((acc) => (
        <Accordion key={acc.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{acc.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
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

            {acc.products.map((p) => (
              <Box key={p.id} mb={2}>
                {/* Mahsulot */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  {p.isEditing ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        value={p.name}
                        onChange={(e) =>
                          updateProduct(acc.id, p.id, "name", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        value={p.price}
                        onChange={(e) =>
                          updateProduct(acc.id, p.id, "price", e.target.value)
                        }
                      />
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => toggleEdit(acc.id, p.id)}
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ) : (
                    <>
                      <Typography>
                        {p.name} — {p.price}.000 so‘m
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => toggleEdit(acc.id, p.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteProduct(acc.id, p.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>

                {/* Izoh */}
                {p.note && !p.isNoteEditing && (
                  <Box ml={2} mt={1} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      Izoh:{" "}
                      {p.showFullNote
                        ? p.note
                        : p.note.split(" ").slice(0, 2).join(" ") +
                          (p.note.split(" ").length > 2 ? " ..." : "")}
                    </Typography>
                    {p.note.split(" ").length > 2 && (
                      <Button
                        size="small"
                        onClick={() => toggleShowNote(acc.id, p.id)}
                      >
                        {p.showFullNote ? "Yopish" : "Ko‘proq"}
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => toggleNoteEdit(acc.id, p.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteNote(acc.id, p.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {p.isNoteEditing && (
                  <Stack direction="row" spacing={1} mt={1} ml={2}>
                    <TextField
                      size="small"
                      fullWidth
                      value={p.note}
                      onChange={(e) =>
                        updateProduct(acc.id, p.id, "note", e.target.value)
                      }
                    />
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => toggleNoteEdit(acc.id, p.id)}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
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
              <TextField
                label="Izoh (ixtiyoriy)"
                id={`note-${acc.id}`}
                size="small"
              />
              <Button
                variant="contained"
                onClick={() =>
                  addProduct(
                    acc.id,
                    document.getElementById(`name-${acc.id}`).value,
                    document.getElementById(`price-${acc.id}`).value,
                    document.getElementById(`note-${acc.id}`).value
                  )
                }
              >
                Qo‘shish
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 1, color: "green", borderColor: "green" }}
              onClick={() => handleSendToTelegram(acc)}
              disabled={sending}
            >
              {sending ? "Yuborilmoqda..." : "Telegramga yuborish"}
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Floating add button */}
      <Fab
        color="primary"
        onClick={handleOpen}
        sx={{ position: "fixed", bottom: 20, right: 20 }}
      >
        <AddIcon />
      </Fab>

      {/* Usta qo‘shish modal */}
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

      {/* Holat modali */}
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
