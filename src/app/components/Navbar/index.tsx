'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box, Button, Container, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import logo from '@/app/assets/navbar-logo.png';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [cookies, , removeCookie] = useCookies(['role']);
  const router = useRouter();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    removeCookie('role');
    router.push('/login');
  };

  const handleUserIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (cookies.role) {
      handleOpenUserMenu(event);
    } else {
      router.push('/login');
    }
  };

  const basePages = [
    { name: 'Sobre Nós', path: '/sobre-nos' },
    { name: 'Seguros', path: '/planos', requireAuth: true },
    { name: 'Fale Conosco', path: '/#contact-section' },
  ];

  const adminPages = [
    { name: 'Área do Administrador', path: '/admin' },
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'rgba(0,0,0,.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Hidden on mobile */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 8,
              my: 1.5,
              display: { xs: 'none', md: 'flex' },
              fontFamily: '"Amelia UP W03 Regular", monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Image 
              src={logo} 
              width={300} 
              alt="MEDSAFE" 
              priority 
              style={{ width: 'auto', height: 'auto' }}
            />
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {basePages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={() => {
                    handleCloseNavMenu();
                    if (page.requireAuth && !cookies.role) {
                      router.push('/login');
                    } else {
                      router.push(page.path);
                    }
                  }}
                >
                  <Typography 
                    textAlign="center"
                    sx={{
                      fontFamily: '"Amelia UP W03 Regular", sans-serif',
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      fontSize: '1.05rem'
                    }}
                  >
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
              {cookies.role === 'ADMIN' && adminPages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={() => {
                    handleCloseNavMenu();
                    router.push(page.path);
                  }}
                >
                  <Typography 
                    textAlign="center"
                    sx={{
                      fontFamily: '"Amelia UP W03 Regular", sans-serif',
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      fontSize: '1.05rem'
                    }}
                  >
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile logo - Only visible on mobile */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: '"Amelia UP W03 Regular", monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Image 
              src={logo} 
              width={150} 
              alt="MEDSAFE" 
              priority 
              style={{ width: 'auto', height: 'auto' }}
            />
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {basePages.map((page) => (
              <Button
                key={page.name}
                onClick={() => {
                  if (page.requireAuth && !cookies.role) {
                    router.push('/login');
                  } else {
                    router.push(page.path);
                  }
                }}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  fontFamily: '"Amelia UP W03 Regular", sans-serif',
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}
              >
                {page.name}
              </Button>
            ))}
            {cookies.role === 'ADMIN' && adminPages.map((page) => (
              <Button
                key={page.name}
                onClick={() => router.push(page.path)}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  fontFamily: '"Amelia UP W03 Regular", sans-serif',
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Fazer Login / Registrar">
              <IconButton onClick={handleUserIconClick} sx={{ p: 0 }}>
                <PersonIcon />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {cookies.role ? (
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              ) : (
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  router.push('/login');
                }}>
                  <Typography textAlign="center">Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;