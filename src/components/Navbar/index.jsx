import * as React from "react";

import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { IoMenu } from "react-icons/io5";
import Button from "@mui/material/Button";
import { IoMdClose } from "react-icons/io";
import { FaCircleUser } from "react-icons/fa6";

// logo
import siteLogo from "../../Images/siteLogo.png";
// css
import styles from "./style.module.css";
import { Link } from "react-router-dom";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default () => {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [open, setOpen] = React.useState(false);
  function Open() {
    setOpen(!open);
  }
  function linkClose() {
    setOpen(false);
  }

  return (
    <Box
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
        className={styles.container}
      >
        <Link to="/" className={styles.siteLogo}>
          <img src={siteLogo} alt="" width={160} />
        </Link>
        {open ? (
          <nav className={styles.mobileNav}>
            <Button
              onClick={Open}
              sx={{ fontSize: "25px" }}
              className={styles.Btn2}
            >
              <IoMdClose />
            </Button>
            <img
              src={siteLogo}
              alt=""
              width={100}
              className={styles.mobileLogo}
            />

            <Link to="/masters" className={styles.navLink}>
              <button onClick={linkClose} className={styles.linkBtn}>
                Ustalar
              </button>
            </Link>
            <Link to="/clients" className={styles.navLink}>
              <button onClick={linkClose} className={styles.linkBtn}>
                Klientlar
              </button>
            </Link>
            <Link to="/debtors" className={styles.navLink}>
              <button onClick={linkClose} className={styles.linkBtn}>
                Qarizlar
              </button>
            </Link>
            <div className={styles.adminInfo}>
              <FaCircleUser /> <span>Abbos Qaxxorov</span>
            </div>
          </nav>
        ) : (
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            className={styles.desktopNav}
          >
            <Tab label="Ustalar" component={Link} to="/masters" />
            <Tab label="Klientlar" component={Link} to="/clients" />
            <Tab label="Qarizlar" component={Link} to="/debtors" />
          </Tabs>
        )}
        <Button onClick={Open} sx={{ fontSize: "25px" }} className={styles.Btn}>
          {open ? <IoMdClose /> : <IoMenu />}
        </Button>
      </Box>
    </Box>
  );
};
