// import React, { useState, useEffect } from "react";
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Grid,
//   Typography,
//   IconButton,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import CheckIcon from "@mui/icons-material/Check";
// import CancelIcon from "@mui/icons-material/Cancel";

// import styles from "./style.module.css";

// // IndexedDB faqat accordions uchun
// const DB_NAME = "accordionDB_v2";
// const STORE_NAME = "accordions";
// let db;

// function openDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME, 1);
//     request.onupgradeneeded = (event) => {
//       db = event.target.result;
//       if (!db.objectStoreNames.contains(STORE_NAME)) {
//         db.createObjectStore(STORE_NAME, { keyPath: "id" });
//       }
//     };
//     request.onsuccess = (event) => {
//       db = event.target.result;
//       resolve();
//     };
//     request.onerror = (event) => reject(event.target.error);
//   });
// }

// function saveAccordionsToDB(accordions) {
//   if (!db) return;
//   const tx = db.transaction(STORE_NAME, "readwrite");
//   const store = tx.objectStore(STORE_NAME);
//   const clearReq = store.clear();
//   clearReq.onsuccess = () => {
//     accordions.forEach((acc) => store.put(acc));
//   };
// }

// function getAccordionsFromDB() {
//   return new Promise((resolve) => {
//     if (!db) return resolve([]);
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);
//     const request = store.getAll();
//     request.onsuccess = () => resolve(request.result || []);
//     request.onerror = () => resolve([]);
//   });
// }

// export default function Masters({
//   cartAccordions,
//   setCartAccordions,
//   handleAddToCart,
// }) {
//   const [accordions, setAccordions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openModal, setOpenModal] = useState(false);
//   const [newOwner, setNewOwner] = useState("");

//   const [currentId, setCurrentId] = useState(null);
//   const [editIndex, setEditIndex] = useState(null);

//   const [productName, setProductName] = useState("");
//   const [productPrice, setProductPrice] = useState("");
//   const [productNotes, setProductNotes] = useState("");

//   const [sending, setSending] = useState(false);
//   const [expandedId, setExpandedId] = useState(null);

//   const [statusModalOpen, setStatusModalOpen] = useState(false);
//   const [statusPendingAcc, setStatusPendingAcc] = useState(null);

//   useEffect(() => {
//     (async () => {
//       await openDB();
//       const saved = await getAccordionsFromDB();
//       const normalized = (saved || []).map((s) => ({
//         ...s,
//         status: s.status || null, // "paid" | "unpaid" | null (faqat rang ko'rinishi uchun)
//       }));
//       if (normalized.length > 0) setAccordions(normalized);
//       setLoading(false);
//     })();
//   }, []);

//   useEffect(() => {
//     if (db && !loading) saveAccordionsToDB(accordions);
//   }, [accordions, loading]);

//   const handleAddAccordion = () => {
//     if (newOwner.trim() === "") return;
//     const newAcc = {
//       id: Date.now(),
//       owner: newOwner,
//       products: [],
//       chatId: "",
//       notes: "",
//       showFullNotes: false,
//       status: null, // "paid" | "unpaid" | null
//     };
//     setAccordions((prev) => [...prev, newAcc]);
//     setNewOwner("");
//     setOpenModal(false);
//   };

//   const truncateWords = (text = "", wordCount = 2) => {
//     const w = text.trim().split(/\s+/);
//     return w.length <= wordCount
//       ? text
//       : w.slice(0, wordCount).join(" ") + "...";
//   };

//   const priceToNumber = (p) => Number(String(p).replace(/[^0-9.-]+/g, "")) || 0;
//   const calculateTotal = (arr) =>
//     arr.reduce((s, p) => s + priceToNumber(p.price), 0);

//   const handleEditProduct = (accId, idx) => {
//     const acc = accordions.find((a) => a.id === accId);
//     const prod = acc.products[idx];
//     setProductName(prod.name);
//     setProductPrice(prod.price);
//     setProductNotes(acc.notes || "");
//     setCurrentId(accId);
//     setEditIndex(idx);
//   };

//   const handleAddProduct = (accId) => {
//     if (!productName.trim() || !productPrice.trim()) return;
//     setAccordions((p) =>
//       p.map((acc) =>
//         acc.id === accId
//           ? {
//               ...acc,
//               products: [
//                 ...acc.products,
//                 { name: productName, price: productPrice },
//               ],
//               notes: productNotes || acc.notes,
//             }
//           : acc
//       )
//     );
//     setProductName("");
//     setProductPrice("");
//     setProductNotes("");
//     setCurrentId(null);
//     setEditIndex(null);
//   };

//   const handleUpdateProduct = () => {
//     setAccordions((p) =>
//       p.map((acc) =>
//         acc.id === currentId
//           ? {
//               ...acc,
//               products: acc.products.map((pr, i) =>
//                 i === editIndex
//                   ? { name: productName, price: productPrice }
//                   : pr
//               ),
//               notes: productNotes || acc.notes,
//             }
//           : acc
//       )
//     );
//     setProductName("");
//     setProductPrice("");
//     setProductNotes("");
//     setCurrentId(null);
//     setEditIndex(null);
//   };

//   const handleDeleteProduct = (accId, i) => {
//     setAccordions((p) =>
//       p.map((acc) =>
//         acc.id === accId
//           ? { ...acc, products: acc.products.filter((_, idx) => idx !== i) }
//           : acc
//       )
//     );
//   };

//   const handleDeleteAccordion = (accId) => {
//     setAccordions((p) => p.filter((acc) => acc.id !== accId));
//     if (expandedId === accId) setExpandedId(null);
//   };

//   const handleDeleteAllProducts = (accId) => {
//     setAccordions((p) =>
//       p.map((acc) =>
//         acc.id === accId ? { ...acc, products: [], notes: "" } : acc
//       )
//     );
//   };

//   const handleChatIdChange = (accId, v) => {
//     setAccordions((p) =>
//       p.map((acc) => (acc.id === accId ? { ...acc, chatId: v } : acc))
//     );
//   };

//   const toggleShowNotes = (accId) => {
//     setAccordions((p) =>
//       p.map((acc) =>
//         acc.id === accId ? { ...acc, showFullNotes: !acc.showFullNotes } : acc
//       )
//     );
//   };

//   const handleSetStatus = (accId, st) => {
//     setAccordions((p) =>
//       p.map((acc) => (acc.id === accId ? { ...acc, status: st } : acc))
//     );
//   };

//   const handleSendToTelegram = async (acc) => {
//     if (sending) return;
//     setSending(true);
//     try {
//       if (!acc.chatId.trim()) return alert("Chat ID kiritilmagan!");
//       if (acc.products.length === 0 && !acc.notes?.trim())
//         return alert("Mahsulot yoki izoh yo'q!");

//       let msg = "";
//       if (acc.products.length)
//         msg += acc.products
//           .map((p, i) => `${i + 1}. ${p.name}\nNarxi: ${p.price}`)
//           .join("\n\n");
//       if (acc.notes?.trim()) msg += "\n\nIzoh:\n" + acc.notes.trim();

//       const res = await fetch("https://server-srsc.onrender.com/sendMessage", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ clientUser: acc.chatId.trim(), message: msg }),
//       });
//       if (!res.ok) throw new Error("Server error");

//       const clone = JSON.parse(JSON.stringify(acc));
//       setStatusPendingAcc(clone);
//       setStatusModalOpen(true);
//     } catch (_e) {
//       alert("Xatolik yuz berdi!");
//     } finally {
//       setSending(false);
//     }
//   };

//   // STATUSni saqlash (to‘langan / to‘lanmagan)
//   const handleSaveStatus = (statusUZ) => {
//     if (!statusPendingAcc) return;

//     // inglizcha status (faqat rang uchun)
//     const en = statusUZ === "to'langan" ? "paid" : "unpaid";

//     // Korzinaga qo‘shiladigan element
//     const cartItem = {
//       id: Date.now(),
//       master: statusPendingAcc.owner,
//       status: statusUZ, // "to'langan" yoki "to'lanmagan"
//       products: statusPendingAcc.products.map((p) => ({
//         name: p.name,
//         price: p.price,
//       })),
//       notes: statusPendingAcc.notes || "",
//       createdAt: new Date().toISOString(),
//     };

//     // Korzinaga qo‘shamiz
//     setCartAccordions((prev) => [...prev, cartItem]);

//     // Asosiy ro‘yxatda statusini yangilaymiz
//     setAccordions((p) =>
//       p.map((acc) =>
//         acc.id === statusPendingAcc.id ? { ...acc, status: en } : acc
//       )
//     );

//     // Modalni yopamiz
//     setStatusModalOpen(false);
//     setStatusPendingAcc(null);
//   };
//   if (loading) return <Typography>Yuklanmoqda...</Typography>;

//   return (
//     <div style={{ padding: 20 }} className={styles.container}>
//       <Grid
//         container
//         spacing={2}
//         sx={{ display: "grid", gridTemplateColumns: "repeat(1,auto)" }}
//       >
//         {accordions.map((acc) => (
//           <Grid item xs={6} sm={12} key={acc.id}>
//             <Accordion
//               expanded={expandedId === acc.id}
//               onChange={() =>
//                 setExpandedId(expandedId === acc.id ? null : acc.id)
//               }
//               style={{
//                 border:
//                   acc.status === "paid"
//                     ? "2px solid green"
//                     : acc.status === "unpaid"
//                     ? "2px solid red"
//                     : "1px solid #ccc",
//                 borderRadius: 6,
//               }}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls={`panel-${acc.id}-content`}
//                 id={`panel-${acc.id}-header`}
//               >
//                 <Typography
//                   sx={{
//                     flexGrow: 1,
//                     color:
//                       acc.status === "paid"
//                         ? "green"
//                         : acc.status === "unpaid"
//                         ? "red"
//                         : "inherit",
//                   }}
//                 >
//                   {acc.owner}
//                 </Typography>

//                 <IconButton
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDeleteAccordion(acc.id);
//                   }}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </AccordionSummary>

//               <AccordionDetails>
//                 <TextField
//                   label="Username yoki Chat ID"
//                   fullWidth
//                   value={acc.chatId}
//                   onChange={(e) => handleChatIdChange(acc.id, e.target.value)}
//                   style={{ marginBottom: 10 }}
//                 />

//                 <List>
//                   {acc.products.map((p, index) => (
//                     <ListItem key={index} divider>
//                       <ListItemText
//                         primary={p.name}
//                         secondary={`Narxi: ${p.price}`}
//                       />
//                       <ListItemSecondaryAction>
//                         <IconButton
//                           onClick={() => handleEditProduct(acc.id, index)}
//                         >
//                           <EditIcon />
//                         </IconButton>
//                         <IconButton
//                           onClick={() => handleDeleteProduct(acc.id, index)}
//                         >
//                           <DeleteIcon />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>

//                 {acc.notes && acc.notes.trim() !== "" && (
//                   <div
//                     style={{
//                       marginTop: 6,
//                       marginBottom: 8,
//                       display: "flex",
//                       alignItems: "start",
//                       gap: "10px",
//                       flexWrap: "wrap",
//                       width: "100%",
//                     }}
//                   >
//                     <Typography
//                       variant="body2"
//                       component="span"
//                       style={{ fontWeight: 600, paddingLeft: "15px" }}
//                     >
//                       Izoh:
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       component="span"
//                       style={{
//                         wordBreak: "break-word",
//                         whiteSpace: "normal",
//                         padding: "10px 20px",
//                       }}
//                     >
//                       {acc.showFullNotes
//                         ? acc.notes
//                         : truncateWords(acc.notes, 2)}
//                     </Typography>

//                     {acc.notes.trim().split(/\s+/).length > 2 && (
//                       <Button
//                         size="small"
//                         onClick={() => toggleShowNotes(acc.id)}
//                         style={{ textTransform: "none" }}
//                       >
//                         {acc.showFullNotes ? "less" : "more"}
//                       </Button>
//                     )}
//                   </div>
//                 )}

//                 <TextField
//                   label="Mahsulot nomi"
//                   fullWidth
//                   value={productName}
//                   onChange={(e) => setProductName(e.target.value)}
//                   style={{ marginBottom: 10 }}
//                 />
//                 <TextField
//                   label="Narxi"
//                   fullWidth
//                   value={productPrice}
//                   onChange={(e) => setProductPrice(e.target.value)}
//                   style={{ marginBottom: 10 }}
//                 />

//                 <TextField
//                   label="Qo‘shimcha izoh"
//                   fullWidth
//                   multiline
//                   minRows={3}
//                   value={productNotes}
//                   onChange={(e) => setProductNotes(e.target.value)}
//                   style={{ marginBottom: 10 }}
//                 />

//                 {editIndex !== null && currentId === acc.id ? (
//                   <Button
//                     variant="contained"
//                     color="warning"
//                     onClick={handleUpdateProduct}
//                     fullWidth
//                   >
//                     Yangilash
//                   </Button>
//                 ) : (
//                   <Button
//                     variant="contained"
//                     onClick={() => handleAddProduct(acc.id)}
//                     fullWidth
//                   >
//                     Qo‘shish
//                   </Button>
//                 )}

//                 <Button
//                   variant="outlined"
//                   color="success"
//                   fullWidth
//                   disabled={sending}
//                   style={{ marginTop: 10 }}
//                   onClick={() => handleSendToTelegram(acc)}
//                 >
//                   {sending ? "Yuborilmoqda..." : "Telegramga yuborish"}
//                 </Button>

//                 <Button
//                   variant="outlined"
//                   color="error"
//                   fullWidth
//                   style={{ marginTop: 10 }}
//                   onClick={() => handleDeleteAllProducts(acc.id)}
//                 >
//                   Barchasini o‘chirish
//                 </Button>

//                 {acc.products.length > 0 && (
//                   <Typography
//                     variant="subtitle1"
//                     sx={{
//                       mt: 2,
//                       fontWeight: "bold",
//                       color:
//                         acc.status === "paid"
//                           ? "green"
//                           : acc.status === "unpaid"
//                           ? "red"
//                           : "inherit",
//                     }}
//                   >
//                     Umumiy summa: {calculateTotal(acc.products)} so'm
//                   </Typography>
//                 )}
//               </AccordionDetails>
//             </Accordion>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Yangi accordion qo'shish FAB */}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={() => setOpenModal(true)}
//         style={{
//           position: "fixed",
//           bottom: 20,
//           right: 20,
//           borderRadius: "50%",
//           width: 60,
//           height: 60,
//           minWidth: 0,
//         }}
//       >
//         <AddIcon />
//       </Button>

//       {/* Add owner modal */}
//       <Dialog open={openModal} onClose={() => setOpenModal(false)}>
//         <DialogTitle>Egasining ismini kiriting</DialogTitle>
//         <DialogContent>
//           <TextField
//             autoFocus
//             label="Ism"
//             fullWidth
//             value={newOwner}
//             onChange={(e) => setNewOwner(e.target.value)}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenModal(false)}>Bekor</Button>
//           <Button onClick={handleAddAccordion} variant="contained">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* STATUS tanlash modali (Telegram yuborilgach) */}
//       <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
//         <DialogTitle>Holatini belgilang</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Telegramga yuborildi. Ushbu yozuvni qaysi bo‘limga qo‘shamiz?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             variant="contained"
//             color="success"
//             startIcon={<CheckIcon />}
//             onClick={() => handleSaveStatus("to'langan")}
//           >
//             To‘langan
//           </Button>
//           <Button
//             variant="contained"
//             color="error"
//             startIcon={<CancelIcon />}
//             onClick={() => handleSaveStatus("to'lanmagan")}
//           >
//             To‘lanmagan
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }

import React from "react";

export default () => {
  return (
    <div>
      <h1>Qarizlar</h1>
    </div>
  );
};
