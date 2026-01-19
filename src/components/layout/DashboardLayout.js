import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EcoIcon from '@mui/icons-material/Eco';

const drawerWidth = 256;

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  { type: 'header', text: 'Inventory' },
  { text: 'All Products', icon: <Inventory2Icon />, href: '/products' },
  { text: 'Categories', icon: <CategoryIcon />, href: '/categories' }, // Placeholder href
  { text: 'Warehouses', icon: <WarehouseIcon />, href: '/warehouses' },
  { type: 'header', text: 'Reports' },
  { text: 'Stock Levels', icon: <BarChartIcon />, href: '/stock' },
  { text: 'Sales Trends', icon: <TrendingUpIcon />, href: '/trends' }, // Placeholder href
];

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            opacity: 0.1,
            p: 1,
            borderRadius: 1,
            mr: 1,
            display: 'flex',
          }}
        >
          <EcoIcon color='primary' />
        </Box>
        <Typography
          variant='h6'
          noWrap
          component='div'
          sx={{ fontWeight: 'bold' }}
        >
          EcoTrack{' '}
          <Box
            component='span'
            sx={{ color: 'primary.main', fontWeight: 'normal' }}
          >
            IMS
          </Box>
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2 }}>
        {MENU_ITEMS.map((item, index) => {
          if (item.type === 'header') {
            return (
              <Typography
                key={index}
                variant='caption'
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {item.text}
              </Typography>
            );
          }
          const active = router.pathname === item.href;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Link href={item.href} passHref legacyBehavior>
                <ListItemButton
                  selected={active}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: active ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary='Settings'
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position='fixed'
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ color: 'text.secondary', mr: 2 }}>
            <NotificationsNoneIcon />
          </IconButton>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 32,
              height: 32,
              fontSize: '0.875rem',
            }}
          >
            JD
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box
        component='nav'
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
