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
} from "@mui/material";
import {
  ShoppingCart,
  Menu as MenuIcon,
  Close,
  ExpandMore,
  MoreVert,
} from "@mui/icons-material";
import { IoMdClose } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";

// Agar sizda rasm va css bo'lmasa, quyidagini vaqtincha komment qiling yoki moslashtiring
// import siteLogo from "../../Images/siteLogo.png";
// import styles from "./style.module.css";
const styles = {
  container: { maxWidth: 1280, margin: "0 auto", width: "100%" },
  desktopNav: { display: "none" },
  mobileNav: { display: "none" },
  siteLogo: { display: "inline-block" },
  Btn: {},
  navLink: {},
  mobileLogoWrapper: {},
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

const Navbar = ({ cartAccordions, setCartAccordions, onLogout }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // accordion control state
  const [expandedId, setExpandedId] = useState(false);

  // route highlight
  const desktopTabValue = useMemo(() => {
    if (location.pathname.startsWith("/masters")) return 0;
    if (location.pathname.startsWith("/clients")) return 1;
    if (location.pathname.startsWith("/debtors")) return 2;
    return false;
  }, [location.pathname]);

  const toggleDrawer = () => setDrawerOpen((p) => !p);
  const toggleMenu = () => setMenuOpen((p) => !p);
  const handleCartTabChange = (_e, v) => {
    setTabValue(v);
    setExpandedId(false); // tab o'zgarsa accordion yopilsin
  };

  const paid = cartAccordions.filter((c) => c.status === "to'langan");
  const unpaid = cartAccordions.filter((c) => c.status === "to'lanmagan");

  // o‘chirish
  const deleteAccordion = (id) => {
    setCartAccordions((prev) => prev.filter((c) => c.id !== id));
  };
  const changeStatus = (id, newStatus) => {
    setCartAccordions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

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
        {data.map((item) => (
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
              {/* 3 nuqta menyu */}
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
                  <ListItem key={i} disableGutters sx={{ py: 0.2 }}>
                    <ListItemText
                      primaryTypographyProps={{ fontSize: 13 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                      primary={p.name}
                      secondary={`Narxi: ${p.price}`}
                    />
                  </ListItem>
                ))}
              </List>
              {item.notes?.trim() ? (
                <Typography sx={{ mt: 0.5 }} variant="caption">
                  Izoh: {item.notes}
                </Typography>
              ) : null}
              <Typography sx={{ mt: 0.5, fontWeight: 700 }} variant="body2">
                Umumiy: {sumProducts(item.products)}.000 so'm
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
        {/* MENU */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              deleteAccordion(selectedId);
              handleMenuClose();
            }}
          >
            🗑️ O‘chirish
          </MenuItem>
          <MenuItem
            disabled={selectedItem?.status === "to'langan"}
            onClick={() => {
              changeStatus(selectedId, "to'langan");
              handleMenuClose();
            }}
          >
            ✅ To‘langan
          </MenuItem>
          <MenuItem
            disabled={selectedItem?.status === "to'lanmagan"}
            onClick={() => {
              changeStatus(selectedId, "to'lanmagan");
              handleMenuClose();
            }}
          >
            ❌ To‘lanmagan
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

  const CloseMenu = () => setMenuOpen(false);

  return (
    <>
      {/* NAVBAR */}
      <AppBar
        position="static"
        color="default"
        sx={{ boxShadow: 2, width: "100%" }}
      >
        <Toolbar sx={styles.container}>
          {/* LOGO */}
          <Link to="/" style={styles.siteLogo}>
            {/* <img src={siteLogo} alt="site logo" width={120} /> */}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ASR AVTO
            </Typography>
          </Link>

          {/* DESKTOP NAV */}
          <Box sx={{ flex: 1 }} />
          <Tabs
            value={desktopTabValue}
            aria-label="nav tabs"
            // className={styles.desktopNav}
            sx={{ display: { md: "flex", xs: "none" } }}
          >
            <Tab label="Ustalar" component={Link} to="/masters" />
            <Tab label="Klientlar" component={Link} to="/clients" />
            <Tab label="Qarizlar" component={Link} to="/debtors" />
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>

            {/* CART ICON */}
            <IconButton color="primary" onClick={toggleDrawer}>
              <Badge badgeContent={cartAccordions.length} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* MOBILE MENU BTN */}
            <IconButton
              onClick={toggleMenu}
              // className={styles.Btn}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              {menuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MOBILE NAV */}
      {menuOpen && (
        <Box
          // className={styles.mobileNav}
          sx={{
            display: { xs: "block", md: "none" },
            borderBottom: "1px solid #eee",
            p: 2,
          }}
        >
          <div
            // className={styles.mobileLogoWrapper}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <Link
              to={"/"} // className={styles.navLink}
              onClick={CloseMenu}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ASR AVTO
              </Typography>
            </Link>
            <Button sx={{ fontSize: "30px" }} onClick={CloseMenu}>
              <IoMdClose />
            </Button>
          </div>
          <List
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "16px",
              textAlign: "start",
              paddingLeft: "8px",
              mt: 1,
            }}
          >
            <Link to="/masters" onClick={toggleMenu}>
              Ustalar
            </Link>
            <Link to="/clients" onClick={toggleMenu}>
              Klientlar
            </Link>
            <Link to="/debtors" onClick={toggleMenu}>
              Qarizlar
            </Link>
          </List>
        </Box>
      )}

      {/* CART DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: { xs: "100%", sm: "360px" } }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" onClick={toggleDrawer}>
              🛒 Korzina
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

          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="cart-tabpanel-0"
            aria-labelledby="cart-tab-0"
            sx={{ p: 2 }}
          >
            <AccordionList
              data={cartAccordions.filter((c) => c.status === "to'lanmagan")}
              color="red"
            />
          </Box>
          <Box
            role="tabpanel"
            hidden={tabValue !== 1}
            id="cart-tabpanel-1"
            aria-labelledby="cart-tab-1"
            sx={{ p: 2 }}
          >
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
