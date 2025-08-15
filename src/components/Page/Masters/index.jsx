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

// BU YERGA O'Z BOT TOKENINGNI QO'Y
const BOT_TOKEN = "8190649011:AAFwF5v7Se6E6hjiqhI9AgcGi5g7LiMMrUA";

export default function App() {
  const [accordions, setAccordions] = useState([]);
  const [loading, setLoading] = useState(true); // yuklanish holati
  const [openModal, setOpenModal] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [currentId, setCurrentId] = useState(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Sahifa yuklanganda IndexedDB dan yuklash
  useEffect(() => {
    (async () => {
      await openDB();
      const saved = await getAccordionsFromDB();
      if (saved.length > 0) {
        setAccordions(saved);
      }
      setLoading(false); // ma’lumot yuklandi
    })();
  }, []);

  // O'zgarish bo'lsa IndexedDB ga yozish
  useEffect(() => {
    if (db && !loading) {
      saveAccordionsToDB(accordions);
    }
  }, [accordions, loading]);

  const handleAddAccordion = () => {
    if (newOwner.trim() === "") return;
    const newAcc = {
      id: Date.now(),
      owner: newOwner,
      products: [],
      chatId: "",
    };
    setAccordions((prev) => [...prev, newAcc]);
    setNewOwner("");
    setOpenModal(false);
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
            }
          : acc
      )
    );
    setProductName("");
    setProductPrice("");
    setCurrentId(null);
    setEditIndex(null);
  };

  const handleEditProduct = (accId, index) => {
    const acc = accordions.find((a) => a.id === accId);
    const prod = acc.products[index];
    setProductName(prod.name);
    setProductPrice(prod.price);
    setCurrentId(accId);
    setEditIndex(index);
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
            }
          : acc
      )
    );
    setProductName("");
    setProductPrice("");
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

  const handleSendToTelegram = async (acc) => {
    if (!acc.chatId.trim()) return alert("Chat ID kiritilmagan!");
    if (acc.products.length === 0) return alert("Mahsulotlar ro'yxati bo'sh!");

    const message = acc.products
      .map((p, i) => `${i + 1}. ${p.name} - ${p.price}`)
      .join("\n");

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: acc.chatId.startsWith("@") ? acc.chatId : Number(acc.chatId),
          text: message,
        }),
      });
      alert("Telegramga yuborildi!");
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi!");
    }
  };

  if (loading) {
    return <Typography>Yuklanmoqda...</Typography>;
  }

  return (
    <div style={{ padding: 20 }} className={styles.container}>
      <Grid
        container
        spacing={2}
        sx={{ display: "grid", gridTemplateColumns: "repeat(1,auto)" }}
      >
        {accordions.map((acc) => (
          <Grid item xs={6} sm={12} key={acc.id}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow: 1 }}>{acc.owner}</Typography>
                <IconButton onClick={() => handleDeleteAccordion(acc.id)}>
                  <DeleteIcon />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Chat ID"
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
