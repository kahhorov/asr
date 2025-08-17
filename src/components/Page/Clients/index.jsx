// // import React, { useState, useEffect } from "react";
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
//   AppBar,
//   Toolbar,
//   Badge,
//   Drawer,
//   Tabs,
//   Tab,
//   Box,
//   Menu,
//   MenuItem,
//   ListItemIcon,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// import CheckIcon from "@mui/icons-material/Check";
// import CancelIcon from "@mui/icons-material/Cancel";
// import styles from "./style.module.css";

// // IndexedDB sozlamalari
// const DB_NAME = "accordionDB";
// const STORE_NAME = "accordions";
// let db;

// function openDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME);
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
//   store.clear();
//   accordions.forEach((acc) => store.put(acc));
// }

// function getAccordionsFromDB() {
//   return new Promise((resolve) => {
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);
//     const request = store.getAll();
//     request.onsuccess = () => resolve(request.result);
//   });
// }

// // Helper: birinchi N so'zni kesib olish
// const truncateWords = (text = "", wordCount = 2) => {
//   const words = text.trim().split(/\s+/);
//   if (words.length <= wordCount) return text;
//   return words.slice(0, wordCount).join(" ") + "...";
// };

// // Helper: narxni number ga aylantiruvchi (safeguard)
// const priceToNumber = (p) => {
//   if (p == null) return 0;
//   const cleaned = String(p).replace(/[^0-9.-]+/g, "");
//   const n = Number(cleaned);
//   return Number.isFinite(n) ? n : 0;
// };

// export default () => {
//   const [accordions, setAccordions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openModal, setOpenModal] = useState(false);
//   const [newOwner, setNewOwner] = useState("");
//   const [currentId, setCurrentId] = useState(null);
//   const [editIndex, setEditIndex] = useState(null);

//   const [productName, setProductName] = useState("");
//   const [productPrice, setProductPrice] = useState("");
//   const [productNotes, setProductNotes] = useState(""); // edit vaqtida ishlaydi
//   const [sending, setSending] = useState(false);

//   const [expandedId, setExpandedId] = useState(null);

//   // Korzinka drawer va tab state
//   const [cartOpen, setCartOpen] = useState(false);
//   const [cartTab, setCartTab] = useState(0); // 0 = to'langan, 1 = to'lanmagan

//   // Menu (Edit) state (used both in main list and drawer)
//   const [menuAnchorEl, setMenuAnchorEl] = useState(null);
//   const [menuAccId, setMenuAccId] = useState(null);

//   useEffect(() => {
//     (async () => {
//       await openDB();
//       const saved = await getAccordionsFromDB();
//       const normalized = (saved || []).map((s) => ({
//         ...s,
//         status: s.status || null,
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
//       status: null, // 'paid' | 'unpaid' | null
//     };
//     setAccordions((prev) => [...prev, newAcc]);
//     setNewOwner("");
//     setOpenModal(false);
//   };

//   const handleEditProduct = (accId, index) => {
//     const acc = accordions.find((a) => a.id === accId);
//     if (!acc) return;
//     const prod = acc.products[index];
//     setProductName(prod.name);
//     setProductPrice(prod.price);
//     setProductNotes(acc.notes || "");
//     setCurrentId(accId);
//     setEditIndex(index);
//   };

//   const handleAddProduct = (accId) => {
//     if (productName.trim() === "" || productPrice.trim() === "") return;

//     setAccordions((prev) =>
//       prev.map((acc) =>
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
//     setAccordions((prev) =>
//       prev.map((acc) =>
//         acc.id === currentId
//           ? {
//               ...acc,
//               products: acc.products.map((p, i) =>
//                 i === editIndex ? { name: productName, price: productPrice } : p
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

//   const handleDeleteProduct = (accId, index) => {
//     setAccordions((prev) =>
//       prev.map((acc) =>
//         acc.id === accId
//           ? { ...acc, products: acc.products.filter((_, i) => i !== index) }
//           : acc
//       )
//     );
//   };

//   const handleDeleteAccordion = (accId) => {
//     setAccordions((prev) => prev.filter((acc) => acc.id !== accId));
//     if (expandedId === accId) setExpandedId(null);
//     if (menuAccId === accId) {
//       setMenuAnchorEl(null);
//       setMenuAccId(null);
//     }
//   };

//   const handleDeleteAllProducts = (accId) => {
//     setAccordions((prev) =>
//       prev.map((acc) =>
//         acc.id === accId ? { ...acc, products: [], notes: "" } : acc
//       )
//     );
//   };

//   const handleChatIdChange = (accId, value) => {
//     setAccordions((prev) =>
//       prev.map((acc) => (acc.id === accId ? { ...acc, chatId: value } : acc))
//     );
//   };

//   const toggleShowNotes = (accId) => {
//     setAccordions((prev) =>
//       prev.map((acc) =>
//         acc.id === accId ? { ...acc, showFullNotes: !acc.showFullNotes } : acc
//       )
//     );
//   };

//   // ----------------- status (paid / unpaid) -----------------
//   const handleSetStatus = (accId, status) => {
//     setAccordions((prev) =>
//       prev.map((acc) => (acc.id === accId ? { ...acc, status } : acc))
//     );
//   };

//   // Menu handlers
//   const openMenuForAcc = (event, accId) => {
//     setMenuAnchorEl(event.currentTarget);
//     setMenuAccId(accId);
//   };
//   const closeMenu = () => {
//     setMenuAnchorEl(null);
//     setMenuAccId(null);
//   };

//   const handleMenuToggleStatus = () => {
//     if (menuAccId == null) return;
//     const acc = accordions.find((a) => a.id === menuAccId);
//     if (!acc) return;
//     const newStatus = acc.status === "paid" ? "unpaid" : "paid";
//     handleSetStatus(menuAccId, newStatus);
//     closeMenu();
//   };

//   const handleMenuDelete = () => {
//     if (menuAccId == null) return;
//     handleDeleteAccordion(menuAccId);
//     closeMenu();
//   };

//   // calculate total for products
//   const calculateTotal = (products = []) =>
//     products.reduce((s, p) => s + priceToNumber(p.price), 0);

//   // existing sendToTelegram with sending lock
//   const handleSendToTelegram = async (acc) => {
//     if (sending) return;
//     setSending(true);

//     try {
//       const chatId = acc.chatId.trim();
//       if (!chatId) {
//         alert("Chat ID kiritilmagan!");
//         setSending(false);
//         return;
//       }
//       if (acc.products.length === 0 && !acc.notes?.trim()) {
//         alert("Mahsulotlar yoki izoh bo'sh!");
//         setSending(false);
//         return;
//       }

//       let message = "";
//       if (acc.products.length > 0) {
//         message += acc.products
//           .map((p, i) => `${i + 1}. ${p.name}\nNarxi: ${p.price}`)
//           .join("\n\n");
//       }
//       if (acc.notes?.trim()) {
//         message += "\n\nIzoh:\n" + acc.notes.trim();
//       }

//       await fetch("https://server-srsc.onrender.com/sendMessage", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ clientUser: chatId, message }),
//       });

//       alert("Telegramga yuborildi!");
//     } catch (error) {
//       console.error(error);
//       alert("Xatolik yuz berdi!");
//     } finally {
//       setSending(false);
//     }
//   };

//   if (loading) return <Typography>Yuklanmoqda...</Typography>;

//   const tolanganlar = accordions.filter((a) => a.status === "paid");
//   const tolanmaganlar = accordions.filter((a) => a.status === "unpaid");

//   return (
//     <div style={{ padding: 20 }} className={styles.container}>
//       {/* NAVBAR with cart badge */}
//       <AppBar position="static" color="primary" sx={{ mb: 2 }}>
//         <Toolbar>
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             Mening Accordions
//           </Typography>
//           <IconButton color="inherit" onClick={() => setCartOpen(true)}>
//             <Badge
//               badgeContent={tolanganlar.length + tolanmaganlar.length}
//               color="error"
//             >
//               <ShoppingCartIcon />
//             </Badge>
//           </IconButton>
//         </Toolbar>
//       </AppBar>

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
//               <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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

//                 {/* REPLACED: remove the plain EditIcon here (as requested).
//                     Instead show a MoreVert icon that opens the same menu (paid/unpaid/delete). */}
//                 <IconButton onClick={(e) => openMenuForAcc(e, acc.id)}>
//                   <MoreVertIcon />
//                 </IconButton>

//                 {/* keep delete (direct) if you want quick remove */}
//                 <IconButton onClick={() => handleDeleteAccordion(acc.id)}>
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
//                         {/* product edit remains as before */}
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

//                 {/* Status buttons kept inside details too (visual), but menu is primary control */}
//                 <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
//                   <Button
//                     variant={acc.status === "paid" ? "contained" : "outlined"}
//                     color="success"
//                     onClick={() => handleSetStatus(acc.id, "paid")}
//                   >
//                     To‘langan
//                   </Button>
//                   <Button
//                     variant={acc.status === "unpaid" ? "contained" : "outlined"}
//                     color="error"
//                     onClick={() => handleSetStatus(acc.id, "unpaid")}
//                   >
//                     To‘lanmagan
//                   </Button>
//                 </Box>

//                 {/* show total */}
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
//                     Umumiy summa: {calculateTotal(acc.products)}
//                   </Typography>
//                 )}
//               </AccordionDetails>
//             </Accordion>
//           </Grid>
//         ))}
//       </Grid>

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

//       {/* Edit Menu (used by accordions and drawer items) */}
//       <Menu
//         anchorEl={menuAnchorEl}
//         open={Boolean(menuAnchorEl)}
//         onClose={closeMenu}
//       >
//         <MenuItem onClick={handleMenuToggleStatus}>
//           <ListItemIcon>
//             {(() => {
//               const acc = accordions.find((a) => a.id === menuAccId);
//               return acc?.status === "paid" ? <CancelIcon /> : <CheckIcon />;
//             })()}
//           </ListItemIcon>
//           {(() => {
//             const acc = accordions.find((a) => a.id === menuAccId);
//             return acc?.status === "paid"
//               ? "To'lovni 'To'lanmagan' ga o'tkazish"
//               : "To'lovni 'To'langan' ga o'tkazish";
//           })()}
//         </MenuItem>
//         <MenuItem onClick={handleMenuDelete}>
//           <ListItemIcon>
//             <DeleteIcon />
//           </ListItemIcon>
//           O'chirish
//         </MenuItem>
//       </Menu>

//       {/* CART Drawer */}
//       <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
//         <Box sx={{ width: 420, p: 2 }}>
//           <Tabs
//             value={cartTab}
//             onChange={(e, v) => setCartTab(v)}
//             variant="fullWidth"
//           >
//             <Tab label={`To‘langan (${tolanganlar.length})`} />
//             <Tab label={`To‘lanmagan (${tolanmaganlar.length})`} />
//           </Tabs>

//           <Box sx={{ mt: 2 }}>
//             {/* now each drawer item also has the MoreVert menu trigger (menu contains paid/unpaid/delete) */}
//             {(cartTab === 0 ? tolanganlar : tolanmaganlar).map((acc) => (
//               <Accordion key={acc.id} sx={{ mb: 1 }}>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Typography sx={{ color: cartTab === 0 ? "green" : "red" }}>
//                     {acc.owner}
//                   </Typography>

//                   <IconButton
//                     onClick={(e) => openMenuForAcc(e, acc.id)}
//                     sx={{ ml: 1 }}
//                   >
//                     <MoreVertIcon />
//                   </IconButton>

//                   <IconButton
//                     onClick={() => handleDeleteAccordion(acc.id)}
//                     sx={{ ml: 1 }}
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 </AccordionSummary>

//                 <AccordionDetails>
//                   <List>
//                     {acc.products.map((p, i) => (
//                       <ListItem key={i} divider>
//                         <ListItemText
//                           primary={p.name}
//                           secondary={`Narxi: ${p.price}`}
//                         />
//                       </ListItem>
//                     ))}
//                   </List>
//                   <Typography fontWeight="bold">
//                     Umumiy summa: {calculateTotal(acc.products)}
//                   </Typography>
//                 </AccordionDetails>
//               </Accordion>
//             ))}
//           </Box>
//         </Box>
//       </Drawer>
//     </div>
//   );
// };
