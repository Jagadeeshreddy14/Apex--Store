import { FormHelperText, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { addToCartAsync, selectCartItems } from '../../cart/CartSlice';
import { motion } from 'framer-motion';
import { formatPrice } from '../../../utils/formatPrice';
import { Card, CardMedia } from '@mui/material';

export const ProductCard = ({
  id,
  title,
  price,
  thumbnail,
  images,
  brand,
  stockQuantity,
  handleAddRemoveFromWishlist,
  isWishlistCard = false,
  isAdminCard = false,
}) => {
  // Move useState to the top, before any conditionals
  const [imgError, setImgError] = useState(false);
  
  const navigate = useNavigate();
  const wishlistItems = useSelector(selectWishlistItems) || [];
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItems = useSelector(selectCartItems) || [];
  const dispatch = useDispatch();

  const theme = useTheme();
  const is1410 = useMediaQuery(theme.breakpoints.down(1410));
  const is932 = useMediaQuery(theme.breakpoints.down(932));
  const is752 = useMediaQuery(theme.breakpoints.down(752));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is608 = useMediaQuery(theme.breakpoints.down(608));
  const is488 = useMediaQuery(theme.breakpoints.down(488));
  const is408 = useMediaQuery(theme.breakpoints.down(408));

  // Validate the ID prop after hooks
  if (!id) {
    console.error('Product ID is missing');
    return null;
  }

  // Check if the product is already in the wishlist
  const isProductAlreadyInWishlist = wishlistItems.some(
    (item) => item?.product?._id === id
  );

  // Check if the product is already in the cart
  const isProductAlreadyInCart = cartItems.some(
    (item) => item?.product?._id === id
  );

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const data = { user: loggedInUser?._id, product: id };
    dispatch(addToCartAsync(data));
  };

  // Fallback image URL
  const fallbackImage = "https://via.placeholder.com/300x300?text=No+Image";
  
  // Function to handle image load errors
  const handleImageError = () => {
    setImgError(true);
  };

  // Get primary image - try thumbnail first, then first image from array
  const displayImage = thumbnail || (images && images[0]) || fallbackImage;

  return (
    <Card sx={{ width: '100%', maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="200"
        image={imgError ? fallbackImage : displayImage}
        alt={title}
        onError={handleImageError}
        sx={{
          objectFit: 'contain',
          p: 2,
          bgcolor: 'background.paper'
        }}
      />
      <Stack flex={2} justifyContent={'flex-end'} spacing={1} rowGap={2}>
        <Stack>
          <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant="h6" fontWeight={400}>
              {title}
            </Typography>
            {!isAdminCard && (
              <motion.div
                whileHover={{ scale: 1.3, y: -10, zIndex: 100 }}
                whileTap={{ scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
              >
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  checked={isProductAlreadyInWishlist}
                  onChange={(e) => handleAddRemoveFromWishlist(e, id)}
                  icon={<FavoriteBorder />}
                  checkedIcon={<Favorite sx={{ color: 'red' }} />}
                />
              </motion.div>
            )}
          </Stack>
          <Typography color={'text.secondary'}>{brand}</Typography>
        </Stack>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>{formatPrice(parseFloat(price) || 0)}</Typography>
          {!isWishlistCard &&
            (isProductAlreadyInCart ? (
              'Added to cart'
            ) : (
              !isAdminCard && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 1 }}
                  onClick={(e) => handleAddToCart(e)}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '3px',
                    outline: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'black',
                    color: 'white',
                    fontSize: is408 ? '.9rem' : is488 ? '.7rem' : is500 ? '.8rem' : '.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '.5rem' }}>
                    <p>Add To Cart</p>
                  </div>
                </motion.button>
              )
            ))}
        </Stack>
        {stockQuantity <= 20 && (
          <FormHelperText sx={{ fontSize: '.9rem' }} error>
            {stockQuantity === 1 ? 'Only 1 stock is left' : 'Only few are left'}
          </FormHelperText>
        )}
      </Stack>
    </Card>
  );
};
