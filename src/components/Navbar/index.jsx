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
} from "@mui/material";
import {
  ShoppingCart,
  Menu as MenuIcon,
  Close,
  ExpandMore,
} from "@mui/icons-material";
import { FaCircleUser } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import siteLogo from "../../Images/siteLogo.png";
import styles from "./style.module.css";

function a11yProps(index) {
  return {
    id: `cart-tab-${index}`,
    "aria-controls": `cart-tabpanel-${index}`,
  };
}

const priceToNumber = (p) => Number(String(p).replace(/[^0-9.-]+/g, "")) || 0;
const sumProducts = (products = []) =>
  products.reduce((s, p) => s + priceToNumber(p.price), 0);

const Navbar = ({ cartAccordions = [] }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // route highlight
  const desktopTabValue = useMemo(() => {
    if (location.pathname.startsWith("/masters")) return 0;
    if (location.pathname.startsWith("/clients")) return 1;
    if (location.pathname.startsWith("/debtors")) return 2;
    return false;
  }, [location.pathname]);

  const toggleDrawer = () => setDrawerOpen((p) => !p);
  const toggleMenu = () => setMenuOpen((p) => !p);
  const handleCartTabChange = (_e, v) => setTabValue(v);

  const paid = cartAccordions.filter((c) => c.status === "to'langan");
  const unpaid = cartAccordions.filter((c) => c.status === "to'lanmagan");

  const AccordionList = ({ data, color }) => (
    <>
      {data.map((item) => (
        <Accordion key={item.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 700, color }}>
              {item.master}
            </Typography>
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
              Umumiy: {sumProducts(item.products)} so'm
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
      {data.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Bo‘sh
        </Typography>
      )}
    </>
  );

  return (
    <>
      {/* NAVBAR */}
      <AppBar position="static" color="default" sx={{ boxShadow: 2 }}>
        <Toolbar className={styles.container}>
          {/* LOGO */}
          <Link to="/" className={styles.siteLogo}>
            <img src={siteLogo} alt="site logo" width={120} />
          </Link>

          {/* DESKTOP NAV */}
          <Box sx={{ flex: 1 }} />
          <Tabs
            value={desktopTabValue}
            aria-label="nav tabs"
            className={styles.desktopNav}
          >
            <Tab label="Ustalar" component={Link} to="/masters" />
            <Tab label="Klientlar" component={Link} to="/clients" />
            <Tab label="Qarizlar" component={Link} to="/debtors" />
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* CART ICON */}
            <IconButton color="primary" onClick={toggleDrawer}>
              <Badge badgeContent={cartAccordions.length} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* MOBILE MENU BTN */}
            <IconButton
              onClick={toggleMenu}
              className={styles.Btn}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              {menuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MOBILE NAV */}
      {menuOpen && (
        <Box className={styles.mobileNav}>
          <Link to="/masters" className={styles.navLink} onClick={toggleMenu}>
            Ustalar
          </Link>
          <Link to="/clients" className={styles.navLink} onClick={toggleMenu}>
            Klientlar
          </Link>
          <Link to="/debtors" className={styles.navLink} onClick={toggleMenu}>
            Qarizlar
          </Link>
        </Box>
      )}

      {/* CART DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: { xs: 320, sm: 360 } }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">🛒 Korzina</Typography>
          </Box>
          <Divider />
          <Tabs
            value={tabValue}
            onChange={handleCartTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label={`❌ To‘lanmagan (${unpaid.length})`}
              {...a11yProps(0)}
            />
            <Tab label={`✅ To‘langan (${paid.length})`} {...a11yProps(1)} />
          </Tabs>

          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="cart-tabpanel-0"
            aria-labelledby="cart-tab-0"
            sx={{ p: 2 }}
          >
            <AccordionList data={unpaid} color="red" />
          </Box>
          <Box
            role="tabpanel"
            hidden={tabValue !== 1}
            id="cart-tabpanel-1"
            aria-labelledby="cart-tab-1"
            sx={{ p: 2 }}
          >
            <AccordionList data={paid} color="green" />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
