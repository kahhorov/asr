import React, { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Menu,
  MenuItem,
  Checkbox,
} from "@mui/material";
import {
  ShoppingCart,
  Menu as MenuIcon,
  Close,
  ExpandMore,
  MoreVert,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import siteLogo from "../../Images/siteLogo.png";
import { LuShoppingCart } from "react-icons/lu";

const styles = {
  container: { maxWidth: 1280, margin: "0 auto", width: "100%" },
  siteLogo: { display: "inline-block" },
};

function a11yProps(index) {
  return {
    id: `cart-tab-${index}`,
    "aria-controls": `cart-tabpanel-${index}`,
  };
}

const priceToNumber = (p) => Number(String(p).replace(/[^0-9.-]+/g, "")) || 0;
const sumProducts = (products = []) =>
  products.reduce((s, p) => s + priceToNumber(p.price), 0);

const Navbar = ({ cartAccordions, setCartAccordions }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // mobil menyu
  const [tabValue, setTabValue] = useState(0);
  const [expandedId, setExpandedId] = useState(false);

  const desktopTabValue = useMemo(() => {
    if (location.pathname.startsWith("/masters")) return 0;
    if (location.pathname.startsWith("/clients")) return 1;
    if (location.pathname.startsWith("/debtors")) return 2;
    if (location.pathname.startsWith("/balanis")) return 3;
    return false;
  }, [location.pathname]);

  const toggleDrawer = () => setDrawerOpen((p) => !p);
  const toggleMobileMenu = () => setMobileMenuOpen((p) => !p);
  const handleCartTabChange = (_e, v) => {
    setTabValue(v);
    setExpandedId(false);
  };

  const deleteAccordion = (id) => {
    setCartAccordions((prev) => prev.filter((c) => c.id !== id));
  };

  const changeStatus = (id, newStatus) => {
    setCartAccordions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const toggleProductSelected = (accId, index) => {
    setCartAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p, i) =>
                i === index ? { ...p, selected: !p.selected } : p
              ),
            }
          : acc
      )
    );
  };

  const confirmPaidProducts = (accId) => {
    setCartAccordions((prev) =>
      prev.map((acc) =>
        acc.id === accId
          ? {
              ...acc,
              products: acc.products.map((p) =>
                p.selected ? { ...p, paid: true, selected: false } : p
              ),
            }
          : acc
      )
    );
  };

  const checkAllPaid = (acc) => acc.products.every((p) => p.paid);

  const AccordionList = ({ data, color }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const handleMenuOpen = (e, id) => {
      setAnchorEl(e.currentTarget);
      setSelectedId(id);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
      setSelectedId(null);
    };
    const selectedItem = data.find((c) => c.id === selectedId);

    return (
      <>
        {data.map((item) => {
          const hasSelected = item.products.some((p) => p.selected);
          if (checkAllPaid(item) && item.status !== "to'langan") {
            changeStatus(item.id, "to'langan");
          }

          return (
            <Accordion
              key={item.id}
              sx={{ mb: 1 }}
              expanded={expandedId === item.id}
              onChange={() =>
                setExpandedId(expandedId === item.id ? false : item.id)
              }
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ fontWeight: 700, color, flexGrow: 1 }}>
                  {item.master}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "gray",
                    fontSize: 12,
                    mr: 1,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.createdAt
                    ? (() => {
                        const d = new Date(item.createdAt);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const hours = String(d.getHours()).padStart(2, "0");
                        const minutes = String(d.getMinutes()).padStart(2, "0");
                        return `${day}/${month} ${hours}:${minutes}`;
                      })()
                    : "⏰ sana yo‘q"}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, item.id);
                  }}
                >
                  <MoreVert />
                </IconButton>
              </AccordionSummary>

              <AccordionDetails>
                <List dense disablePadding>
                  {item.products.map((p, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                      <Checkbox
                        checked={!!p.selected}
                        onChange={() => toggleProductSelected(item.id, i)}
                        disabled={item.status === "to'langan" || p.paid}
                      />
                      <ListItemText
                        primaryTypographyProps={{
                          fontSize: 13,
                          sx: {
                            color: p.paid ? "green" : "black",
                            textDecoration: p.paid ? "line-through" : "none",
                          },
                        }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                        primary={p.name}
                        secondary={`Narxi: ${p.price}`}
                      />
                    </ListItem>
                  ))}
                </List>

                {hasSelected && item.status !== "to'langan" && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => confirmPaidProducts(item.id)}
                  >
                    ✅ To‘landi deb belgilash
                  </Button>
                )}

                <Typography sx={{ mt: 0.5, fontWeight: 700 }} variant="body2">
                  Umumiy: {sumProducts(item.products.filter((p) => !p.paid))}
                  .000 so'm
                </Typography>
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { maxHeight: 200, width: 200 },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {selectedItem && selectedItem.status === "to'langan" && (
            <MenuItem
              onClick={() => {
                changeStatus(selectedId, "to'lanmagan");
                handleMenuClose();
              }}
            >
              ❌ To‘lanmaganlarga o‘tkazish
            </MenuItem>
          )}

          {selectedItem && selectedItem.status === "to'lanmagan" && (
            <MenuItem
              onClick={() => {
                changeStatus(selectedId, "to'langan");
                handleMenuClose();
              }}
            >
              ✅ To‘langanlarga o‘tkazish
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              deleteAccordion(selectedId);
              handleMenuClose();
            }}
          >
            🗑️ O‘chirish
          </MenuItem>
        </Menu>

        {data.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Bo‘sh
          </Typography>
        )}
      </>
    );
  };

  return (
    <>
      {/* NAVBAR */}
      <AppBar
        position="static"
        color="default"
        sx={{ boxShadow: 2, width: "100%" }}
      >
        <Toolbar sx={styles.container}>
          <Link to="/" style={styles.siteLogo}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <img src={siteLogo} alt="" width={150} />
            </Typography>
          </Link>

          <Box sx={{ flex: 1 }} />

          {/* Desktop Tabs */}
          <Tabs
            value={desktopTabValue}
            aria-label="nav tabs"
            sx={{ display: { md: "flex", xs: "none" } }}
          >
            <Tab label="Ustalar" component={Link} to="/" />
            <Tab label="Klientlar" component={Link} to="/clients" />
            <Tab label="Qarzdorlar" component={Link} to="/debtors" />
            <Tab label="Balance" component={Link} to="/balanis" />
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="primary" onClick={toggleDrawer}>
              <Badge
                badgeContent={cartAccordions.length}
                color="error"
                invisible={cartAccordions.length === 0} // <- bu satr qo‘shildi
              >
                <LuShoppingCart />
              </Badge>
            </IconButton>

            {/* Mobil menyu tugma */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              {mobileMenuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobil menyu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{ display: { md: "none", xs: "block" } }}
      >
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem button component={Link} to="/" onClick={toggleMobileMenu}>
              <ListItemText primary="Ustalar" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/clients"
              onClick={toggleMobileMenu}
            >
              <ListItemText primary="Klientlar" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/debtors"
              onClick={toggleMobileMenu}
            >
              <ListItemText primary="Qarzdorlar" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/balanis"
              onClick={toggleMobileMenu}
            >
              <ListItemText primary="Balance" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* CART DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: { xs: "100%", sm: "360px" } }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" onClick={toggleDrawer}>
              <LuShoppingCart /> Korzina
            </Typography>
          </Box>
          <Divider />
          <Tabs
            value={tabValue}
            onChange={handleCartTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label={`❌ To‘lanmagan (${
                cartAccordions.filter((c) => c.status === "to'lanmagan").length
              })`}
              {...a11yProps(0)}
            />
            <Tab
              label={`✅ To‘langan (${
                cartAccordions.filter((c) => c.status === "to'langan").length
              })`}
              {...a11yProps(1)}
            />
          </Tabs>

          <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 2 }}>
            <AccordionList
              data={cartAccordions.filter((c) => c.status === "to'lanmagan")}
              color="red"
            />
          </Box>
          <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 2 }}>
            <AccordionList
              data={cartAccordions.filter((c) => c.status === "to'langan")}
              color="green"
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
