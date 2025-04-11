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

  // Debug log to check the role cookie value
  console.log('Current role from cookie:', cookies.role);

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
    { name: 'Serviços', path: '/seguros', requireAuth: true },
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
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 8,
              my: 4,
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

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
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
                  onClick={handleCloseNavMenu}
                  sx={{ display: page.requireAuth && !cookies.role ? 'none' : 'block' }}
                >
                  <Link href={page.path} passHref>
                    <Typography sx={{ textAlign: 'center', fontFamily: '"Amelia UP W03 Regular", sans-serif' }}>
                      {page.name}
                    </Typography>
                  </Link>
                </MenuItem>
              ))}
              {cookies.role === 'ADMIN' && adminPages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Link href={page.path} passHref>
                    <Typography sx={{ textAlign: 'center', fontFamily: '"Amelia UP W03 Regular", sans-serif' }}>
                      {page.name}
                    </Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography
            variant="h5"
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
              width={200} 
              alt="MEDSAFE" 
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {basePages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                href={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: 'white',
                  display: page.requireAuth && !cookies.role ? 'none' : 'block',
                  fontSize: '1.3rem',
                  fontFamily: '"Amelia UP W03 Regular", sans-serif',
                  textTransform: 'none',
                  mx: 2,
                  textDecoration: 'none'
                }}
              >
                {page.name}
              </Button>
            ))}
            {cookies.role === 'ADMIN' && adminPages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                href={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  fontSize: '1.3rem',
                  fontFamily: '"Amelia UP W03 Regular", sans-serif',
                  textTransform: 'none',
                  mx: 2,
                  textDecoration: 'none'
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={cookies.role ? "Abrir configurações" : "Fazer login"}>
              <IconButton onClick={handleUserIconClick} sx={{ p: 0 }}>
                <PersonIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
              </IconButton>
            </Tooltip>
            {cookies.role && (
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
                <MenuItem onClick={handleLogout}>
                  <Typography sx={{ textAlign: 'center', fontFamily: '"Amelia UP W03 Regular", sans-serif' }}>
                    Sair
                  </Typography>
                </MenuItem>
              </Menu>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;