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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import styles from "./style.module.css";

// IndexedDB sozlamalari
const DB_NAME = "accordionDB";
const STORE_NAME = "accordions";
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
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
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  accordions.forEach((acc) => store.put(acc));
}

function getAccordionsFromDB() {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

// Helper: birinchi N so'zni kesib olish
const truncateWords = (text = "", wordCount = 2) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "...";
};

export default function App() {
  const [accordions, setAccordions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productNotes, setProductNotes] = useState(""); // edit vaqtida ishlaydi

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      await openDB();
      const saved = await getAccordionsFromDB();
      if (saved.length > 0) setAccordions(saved);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (db && !loading) saveAccordionsToDB(accordions);
  }, [accordions, loading]);

  const handleAddAccordion = () => {
    if (newOwner.trim() === "") return;
    const newAcc = {
      id: Date.now(),
      owner: newOwner,
      products: [],
      chatId: "",
      notes: "",
      showFullNotes: false,
    };
    setAccordions((prev) => [...prev, newAcc]);
    setNewOwner("");
    setOpenModal(false);
  };

  const handleEditProduct = (accId, index) => {
    const acc = accordions.find((a) => a.id === accId);
    if (!acc) return;
    const prod = acc.products[index];
    setProductName(prod.name);
    setProductPrice(prod.price);
    setProductNotes(acc.notes || ""); // izohni edit qilish
    setCurrentId(accId);
    setEditIndex(index);
  };

  const handleAddProduct = (accId) => {
    if (productName.trim() === "" || productPrice.trim() === "") return;

    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: [
                ...acc.products,
                { name: productName, price: productPrice },
              ],
              notes: productNotes || acc.notes, // input bo‘sh bo‘lsa eski izoh saqlanadi
            }
          : acc
      )
    );

    // inputlarni tozalash
    setProductName("");
    setProductPrice("");
    setProductNotes("");
    setCurrentId(null);
    setEditIndex(null);
  };

  const handleUpdateProduct = () => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === currentId
          ? {
              ...acc,
              products: acc.products.map((p, i) =>
                i === editIndex ? { name: productName, price: productPrice } : p
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

  const handleDeleteProduct = (accId, index) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? { ...acc, products: acc.products.filter((_, i) => i !== index) }
          : acc
      )
    );
  };

  const handleDeleteAccordion = (accId) => {
    setAccordions((prev) => prev.filter((acc) => acc.id !== accId));
    if (expandedId === accId) setExpandedId(null);
  };

  const handleDeleteAllProducts = (accId) => {
    setAccordions((prev) =>
      prev.map((acc) => (acc.id === accId ? { ...acc, products: [] } : acc))
    );
  };

  const handleChatIdChange = (accId, value) => {
    setAccordions((prev) =>
      prev.map((acc) => (acc.id === accId ? { ...acc, chatId: value } : acc))
    );
  };

  const toggleShowNotes = (accId) => {
    setAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId ? { ...acc, showFullNotes: !acc.showFullNotes } : acc
      )
    );
  };

  const handleSendToTelegram = async (acc) => {
    const chatId = acc.chatId.trim();
    if (!chatId) return alert("Chat ID kiritilmagan!");
    if (acc.products.length === 0 && !acc.notes?.trim())
      return alert("Mahsulotlar yoki izoh bo'sh!");

    let message = "";
    if (acc.products.length > 0) {
      message += acc.products
        .map((p, i) => `${i + 1}. ${p.name} - ${p.price}`)
        .join("\n");
    }
    if (acc.notes?.trim()) {
      message += "\n\nIzoh:\n" + acc.notes.trim();
    }

    try {
      await fetch("http://localhost:5000/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientUser: chatId,
          message: message,
        }),
      });
      alert("Telegramga yuborildi!");
      setAccordions((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, showFullNotes: false } : a))
      );
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi!");
    }
  };

  if (loading) return <Typography>Yuklanmoqda...</Typography>;

  return (
    <div style={{ padding: 20 }} className={styles.container}>
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
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow: 1 }}>{acc.owner}</Typography>
                <IconButton onClick={() => handleDeleteAccordion(acc.id)}>
                  <DeleteIcon />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="UserName yoki Chat ID"
                  fullWidth
                  value={acc.chatId}
                  onChange={(e) => handleChatIdChange(acc.id, e.target.value)}
                  style={{ marginBottom: 10 }}
                />

                <List>
                  {acc.products.map((p, index) => (
                    <ListItem key={index}>
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

                  {acc.notes && acc.notes.trim() !== "" && (
                    <div
                      style={{
                        marginTop: 6,
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="span"
                        onClick={() => toggleShowNotes(acc.id)}
                        style={{
                          cursor: "pointer",
                          fontWeight: 600,
                          paddingLeft: "15px",
                        }}
                      >
                        Izoh:
                      </Typography>

                      <Typography variant="body2" component="span">
                        {acc.showFullNotes
                          ? acc.notes
                          : truncateWords(acc.notes, 2)}
                      </Typography>

                      {acc.notes.trim().split(/\s+/).length > 2 && (
                        <Button
                          size="small"
                          onClick={() => toggleShowNotes(acc.id)}
                          style={{ textTransform: "none", marginLeft: 8 }}
                        >
                          {acc.showFullNotes ? "less" : "more"}
                        </Button>
                      )}
                    </div>
                  )}
                </List>

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
                  value={productNotes} // faqat inputga bog‘langan state
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
                  style={{ marginTop: 10 }}
                  onClick={() => handleSendToTelegram(acc)}
                >
                  Telegramga yuborish
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
    </div>
  );
}
