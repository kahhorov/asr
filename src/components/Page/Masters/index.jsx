import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  AppBar,
  Toolbar,
  Badge,
  Drawer,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import styles from "./style.module.css";

const DB_NAME = "accordionDB_v2";
const STORE_NAME = "accordions";
const CART_STORE = "cart";
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(CART_STORE)) {
        db.createObjectStore(CART_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

function saveAccordionsToDB(accordions) {
  if (!db) return;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const clearReq = store.clear();
  clearReq.onsuccess = () => {
    accordions.forEach((acc) => store.put(acc));
  };
}

function getAccordionsFromDB() {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

function saveCartToDB(cart) {
  if (!db) return;
  const tx = db.transaction(CART_STORE, "readwrite");
  const store = tx.objectStore(CART_STORE);
  const clearReq = store.clear();
  clearReq.onsuccess = () => {
    cart.forEach((c) => store.put(c));
  };
}

function getCartFromDB() {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    const tx = db.transaction(CART_STORE, "readonly");
    const store = tx.objectStore(CART_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

export default () => {
  const [accordions, setAccordions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartTab, setCartTab] = useState(0);
  const [sentAccIds, setSentAccIds] = useState([]);
  const [cartAccordions, setCartAccordions] = useState([]);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusPendingAcc, setStatusPendingAcc] = useState(null);

  // ⬇️ Shu yerga CART'ni yuklash qo'shildi
  useEffect(() => {
    (async () => {
      await openDB();
      const saved = await getAccordionsFromDB();
      const normalized = (saved || []).map((s) => ({
        ...s,
        status: s.status || null,
      }));
      if (normalized.length > 0) setAccordions(normalized);

      const cartSaved = await getCartFromDB(); // <-- qoʻshildi
      if (cartSaved.length > 0) setCartAccordions(cartSaved); // <-- qoʻshildi

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (db && !loading) saveAccordionsToDB(accordions);
  }, [accordions, loading]);

  useEffect(() => {
    if (db) saveCartToDB(cartAccordions);
  }, [cartAccordions]);

  const handleAddAccordion = () => {
    if (newOwner.trim() === "") return;
    const newAcc = {
      id: Date.now(),
      owner: newOwner,
      products: [],
      chatId: "",
      notes: "",
      showFullNotes: false,
      status: null,
    };
    setAccordions((prev) => [...prev, newAcc]);
    setNewOwner("");
    setOpenModal(false);
  };

  const truncateWords = (text = "", wordCount = 2) => {
    const w = text.trim().split(/\s+/);
    return w.length <= wordCount
      ? text
      : w.slice(0, wordCount).join(" ") + "...";
  };

  const priceToNumber = (p) => Number(String(p).replace(/[^0-9.-]+/g, "")) || 0;

  const handleEditProduct = (accId, idx) => {
    const acc = accordions.find((a) => a.id === accId);
    const prod = acc.products[idx];
    setProductName(prod.name);
    setProductPrice(prod.price);
    setProductNotes(acc.notes || "");
    setCurrentId(accId);
    setEditIndex(idx);
  };

  const handleAddProduct = (accId) => {
    if (!productName.trim() || !productPrice.trim()) return;
    setAccordions((p) =>
      p.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: [
                ...acc.products,
                { name: productName, price: productPrice },
              ],
              notes: productNotes || acc.notes,
            }
          : acc
      )
    );
    setProductName("");
    setProductPrice("");
    setProductNotes("");
    setCurrentId(null);
    setEditIndex(null);
  };

  const handleUpdateProduct = () => {
    setAccordions((p) =>
      p.map((acc) =>
        acc.id === currentId
          ? {
              ...acc,
              products: acc.products.map((pr, i) =>
                i === editIndex
                  ? { name: productName, price: productPrice }
                  : pr
              ),
              notes: productNotes || acc.notes,
            }
          : acc
      )
    );
    setProductName("");
    setProductPrice("");
    setProductNotes("");
    setCurrentId(null);
    setEditIndex(null);
  };

  const handleDeleteProduct = (accId, i) => {
    setAccordions((p) =>
      p.map((acc) =>
        acc.id === accId
          ? { ...acc, products: acc.products.filter((_, idx) => idx !== i) }
          : acc
      )
    );
  };

  const handleDeleteAccordion = (accId) => {
    setAccordions((p) => p.filter((acc) => acc.id !== accId));
    if (expandedId === accId) setExpandedId(null);
    setSentAccIds((p) => p.filter((id) => id !== accId));
  };

  const handleDeleteAllProducts = (accId) => {
    setAccordions((p) =>
      p.map((acc) =>
        acc.id === accId ? { ...acc, products: [], notes: "" } : acc
      )
    );
  };

  const handleChatIdChange = (accId, v) => {
    setAccordions((p) =>
      p.map((acc) => (acc.id === accId ? { ...acc, chatId: v } : acc))
    );
  };

  const toggleShowNotes = (accId) => {
    setAccordions((p) =>
      p.map((acc) =>
        acc.id === accId ? { ...acc, showFullNotes: !acc.showFullNotes } : acc
      )
    );
  };

  const handleSetStatus = (accId, st) => {
    setAccordions((p) =>
      p.map((acc) => (acc.id === accId ? { ...acc, status: st } : acc))
    );
  };

  const calculateTotal = (arr) =>
    arr.reduce((s, p) => s + priceToNumber(p.price), 0);

  const handleSendToTelegram = async (acc) => {
    if (sending) return;
    setSending(true);
    try {
      if (!acc.chatId.trim()) return alert("Chat ID kiritilmagan!");
      if (acc.products.length === 0 && !acc.notes?.trim())
        return alert("Mahsulot yoki izoh yo'q!");

      let msg = "";
      if (acc.products.length)
        msg += acc.products
          .map((p, i) => `${i + 1}. ${p.name}\nNarxi: ${p.price}`)
          .join("\n\n");
      if (acc.notes?.trim()) msg += "\n\nIzoh:\n" + acc.notes.trim();

      const res = await fetch("https://server-srsc.onrender.com/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUser: acc.chatId.trim(), message: msg }),
      });
      if (!res.ok) throw new Error("Server error");

      const clone = JSON.parse(JSON.stringify(acc));
      setStatusPendingAcc(clone);
      setStatusModalOpen(true);
      setSentAccIds((p) => (p.includes(acc.id) ? p : [...p, acc.id]));
    } catch (e) {
      alert("Xatolik yuz berdi!");
    } finally {
      setSending(false);
    }
  };

  const handleSaveStatus = (status) => {
    const newAcc = {
      ...statusPendingAcc,
      id: Date.now(),
      status,
      createdAt: new Date().toISOString(),
    };
    setCartAccordions((p) => [...p, newAcc]);
    setAccordions((p) =>
      p.map((acc) =>
        acc.id === statusPendingAcc.id ? { ...acc, status } : acc
      )
    );
    setStatusModalOpen(false);
    setStatusPendingAcc(null);
    setProductName("");
    setProductPrice("");
    setProductNotes("");
  };

  if (loading) return <Typography>Yuklanmoqda...</Typography>;

  const tolanganlar = cartAccordions.filter((a) => a.status === "paid");
  const tolanmaganlar = cartAccordions.filter((a) => a.status === "unpaid");

  return (
    <div style={{ padding: 20 }} className={styles.container}>
      {/* NAVBAR with cart badge */}
      <AppBar position="static" color="primary" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mening Accordions
          </Typography>
          <IconButton color="inherit" onClick={() => setCartOpen(true)}>
            <Badge
              badgeContent={tolanganlar.length + tolanmaganlar.length}
              color="error"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Grid
        container
        spacing={2}
        sx={{ display: "grid", gridTemplateColumns: "repeat(1,auto)" }}
      >
        {accordions.map((acc) => (
          <Grid item xs={6} sm={12} key={acc.id}>
            <Accordion
              expanded={expandedId === acc.id}
              onChange={() =>
                setExpandedId(expandedId === acc.id ? null : acc.id)
              }
              style={{
                border:
                  acc.status === "paid"
                    ? "2px solid green"
                    : acc.status === "unpaid"
                    ? "2px solid red"
                    : "1px solid #ccc",
                borderRadius: 6,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${acc.id}-content`}
                id={`panel-${acc.id}-header`}
              >
                <Typography
                  sx={{
                    flexGrow: 1,
                    color:
                      acc.status === "paid"
                        ? "green"
                        : acc.status === "unpaid"
                        ? "red"
                        : "inherit",
                  }}
                >
                  {acc.owner}
                </Typography>

                {/* NOTE: MoreVertIcon (3 nuqta) olib tashlandi */}
                {/* Quick delete action kept */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAccordion(acc.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </AccordionSummary>

              <AccordionDetails>
                <TextField
                  label="Username yoki Chat ID"
                  fullWidth
                  value={acc.chatId}
                  onChange={(e) => handleChatIdChange(acc.id, e.target.value)}
                  style={{ marginBottom: 10 }}
                />

                <List>
                  {acc.products.map((p, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={p.name}
                        secondary={`Narxi: ${p.price}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => handleEditProduct(acc.id, index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteProduct(acc.id, index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {acc.notes && acc.notes.trim() !== "" && (
                  <div
                    style={{
                      marginTop: 6,
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "start",
                      gap: "10px",
                      flexWrap: "wrap",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      style={{ fontWeight: 600, paddingLeft: "15px" }}
                    >
                      Izoh:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        padding: "10px 20px",
                      }}
                    >
                      {acc.showFullNotes
                        ? acc.notes
                        : truncateWords(acc.notes, 2)}
                    </Typography>

                    {acc.notes.trim().split(/\s+/).length > 2 && (
                      <Button
                        size="small"
                        onClick={() => toggleShowNotes(acc.id)}
                        style={{ textTransform: "none" }}
                      >
                        {acc.showFullNotes ? "less" : "more"}
                      </Button>
                    )}
                  </div>
                )}

                <TextField
                  label="Mahsulot nomi"
                  fullWidth
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  style={{ marginBottom: 10 }}
                />
                <TextField
                  label="Narxi"
                  fullWidth
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  style={{ marginBottom: 10 }}
                />

                <TextField
                  label="Qo‘shimcha izoh"
                  fullWidth
                  multiline
                  minRows={3}
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  style={{ marginBottom: 10 }}
                />

                {editIndex !== null && currentId === acc.id ? (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleUpdateProduct}
                    fullWidth
                  >
                    Yangilash
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => handleAddProduct(acc.id)}
                    fullWidth
                  >
                    Qo‘shish
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  disabled={sending}
                  style={{ marginTop: 10 }}
                  onClick={() => handleSendToTelegram(acc)}
                >
                  {sending ? "Yuborilmoqda..." : "Telegramga yuborish"}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  style={{ marginTop: 10 }}
                  onClick={() => handleDeleteAllProducts(acc.id)}
                >
                  Barchasini o‘chirish
                </Button>

                {/* show total */}
                {acc.products.length > 0 && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mt: 2,
                      fontWeight: "bold",
                      color:
                        acc.status === "paid"
                          ? "green"
                          : acc.status === "unpaid"
                          ? "red"
                          : "inherit",
                    }}
                  >
                    Umumiy summa: {calculateTotal(acc.products)}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenModal(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          borderRadius: "50%",
          width: 60,
          height: 60,
          minWidth: 0,
        }}
      >
        <AddIcon />
      </Button>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Egasining ismini kiriting</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Ism"
            fullWidth
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Bekor</Button>
          <Button onClick={handleAddAccordion} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Korzina (Drawer) */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 420, p: 2 }}>
          <Tabs
            value={cartTab}
            onChange={(e, v) => setCartTab(v)}
            variant="fullWidth"
          >
            <Tab label={`To‘langan (${tolanganlar.length})`} />
            <Tab label={`To‘lanmagan (${tolanmaganlar.length})`} />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {(cartTab === 0 ? tolanganlar : tolanmaganlar).map((acc) => (
              <Accordion key={acc.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ color: cartTab === 0 ? "green" : "red" }}>
                    {acc.owner || acc.chatId}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <List>
                    {acc.products.map((p, i) => (
                      <ListItem key={i} divider>
                        <ListItemText
                          primary={p.name}
                          secondary={`Narxi: ${p.price}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography fontWeight="bold">
                    Umumiy summa: {calculateTotal(acc.products)}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Drawer>

      {/* STATUS tanlash modali (Telegramga muvaffaqiyatli yuborilgach) */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <DialogTitle>Holatini belgilang</DialogTitle>
        <DialogContent>
          <Typography>
            Telegramga muvaffaqiyatli yuborildi. Endi bu yozuvni qaysi holatga
            qo'shasiz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleSaveStatus("paid")}
          >
            To‘langan
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleSaveStatus("unpaid")}
          >
            To‘lanmagan
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
